import os
from datetime import datetime
from enum import Enum

from django.db import models
from django.conf import settings
from django.utils import timezone
from eyed3 import mp3

from ampersand import utils

class AmpRecord(models.Model):
    identifier = models.TextField(unique=True, null=False)
    modified = models.DateTimeField(auto_now=True, null=False)
    title = models.TextField(null=False)

    def __str__(self):
        return self.identifier

    class Meta:
        abstract = True

class Artist(AmpRecord):
    @classmethod
    def get_empty_record(cls):
        record, created = cls.objects.get_or_create(
                identifier='Unknown Artist',
                defaults={'title': 'Unknown Artist'})
        return record

    @classmethod
    def get_or_make(cls, name):
        if not name:
            return cls.get_empty_record()
        else:
            return cls.objects.get_or_create(
                    identifier=name,
                    title=name)

class Album(AmpRecord):
    year = models.IntegerField(null=True)
    artist = models.ForeignKey(Artist, null=False, on_delete=models.CASCADE)
    num_tracks = models.IntegerField(null=True)

    class Meta:
        unique_together = (('artist', 'title'),)

    @classmethod
    def get_empty_record(cls, artist=None):
        if not artist: artist = Artist.get_empty_record()
        record, created = cls.objects.get_or_create(
                identifier=cls.make_identifier(artist.title, 'Unknown Album'),
                defaults={'title': 'Unknown Artist', 'artist': artist})

        return record

    @classmethod
    def make_identifier(cls, album_title, artist_title):
        return '%s - %s' % (album_title, artist_title)

    @classmethod
    def get_or_make(cls, album_name, artist_name, year=None, num_tracks=None):
        artist, _ = Artist.get_or_make(artist_name)
        ident = Album.make_identifier(album_name, artist_name)

        if not album_name:
            return (cls.get_empty_record(artist), False)
        else:
            return cls.objects.get_or_create(
                    identifier=ident,
                    defaults={
                        'title': album_name,
                        'artist': artist,
                        'year': year,
                        'num_tracks': num_tracks})

class Track(AmpRecord):
    class ActionOnInvalid(Enum):
        DELETE = 1
        FLAG = 2

    class SyncCodes(Enum):
        SUCCESS = 0
        FLAGGED = 1
        DELETED = 2
        UNADDED = 3

    valid = models.BooleanField(default=True)
    file_mod_time = models.DateTimeField(null=False)
    last_synced = models.DateTimeField(null=False)
    path = models.FilePathField(
        null=False,
        unique=True,
        path=settings.MUSIC_DIR,
        match=settings.FILE_REGEX,
        allow_files=True,
        allow_folders=False)

    track_num = models.PositiveIntegerField(null=True)
    album = models.ForeignKey(Album, null=False, on_delete=models.CASCADE)
    artist = models.ForeignKey(Artist, null=False, on_delete=models.CASCADE)

    @classmethod
    def make_identifier(self, track_title, album_title, artist_title):
        album_ident = Album.make_identifier(album_title, artist_title)
        return '%s (%s)' % (track_title, album_ident)

    def sync(self, aoi=ActionOnInvalid.FLAG):
        if not mp3.isMp3File(self.path):
            if not self.pk:
                return (self.SyncCodes.UNADDED, False, False)
            elif aoi == self.ActionOnInvalid.FLAG:
                self.valid = False
                return (self.SyncCodes.FLAGGED, False, False)
            else:
                self.delete()
                return (self.SyncCodes.DELETED, False, False)

        audio_file = mp3.Mp3AudioFile(self.path)
        album_created, artist_created = self._update_with_tag(audio_file.tag)

        mod_timestamp = os.path.getmtime(self.path)
        self.file_mod_time = utils.get_mod_time(self.path)
        self.last_synced = timezone.now()

        return (self.SyncCodes.SUCCESS, album_created, artist_created)

    def _update_with_tag(self, tag):
        artist_created = False
        album_created = False

        artist_name = utils.get_artist(tag)
        album_artist_name = utils.get_album_artist(tag)
        track_num, num_tracks = tag.track_num
        best_date = tag.getBestDate()
        year = None if not best_date else best_date.year

        (artist, artist_created) = Artist.get_or_make(artist_name)
        (album, artist_created) = Album.get_or_make(
                tag.album,
                album_artist_name,
                year=year,
                num_tracks=num_tracks)

        self.title = tag.title
        self.track_num = track_num
        self.album = album
        self.artist = artist
        self.identifier = self.make_identifier(self.title, album.title,
                                               artist.title)
        return (album_created, artist_created)


class SystemProperty(models.Model):
    modified = models.DateTimeField(auto_now=True)
    key = models.TextField(null=False, unique=True)
    value_type = models.CharField(
            max_length=100,
            null=False,
            choices=(
                ('STRING', 'STRING'),
                ('INTEGER', 'INTEGER')))

    string_value = models.TextField(null=True)
    integer_value = models.TextField(null=True)

    @classmethod
    def _val_kind(cls, val):
        if isinstance(val, str):
            return ('STRING', 'string_value')
        elif isinstance(val, int):
            return ('INTEGER', 'integer_value')
        else:
            raise RuntimeError('Invalid value type: %r' % self.value_type)

    @classmethod
    def get(cls, key):
        return cls.objects.get(key=key).get_value()

    @classmethod
    def set(cls, key, val):
        t, f = self._val_kind(val)
        cls.objects.update_or_create(
            key=key,
            defaults={'value_type': t, f: val})

    def get_value(self):
        if self.value_type == 'STRING': return self.string_value
        elif self.value_type == 'INTEGER': return self.integer_value
        else: raise RuntimeError('Invalid type choice: %s' % self.value_type)

    def set_value(self, val):
        t, f = self._val_kind(val)
        self.value_type = t
        setattr(self, f, val)
