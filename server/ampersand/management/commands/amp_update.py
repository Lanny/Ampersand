import os
import re
import time
from datetime import datetime, timezone

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

from ampersand import utils
from ampersand.models import *

class Command(BaseCommand):
    help = 'Syncronize database with files in MUSIC_DIR'

    def add_arguments(self, parser):
        parser.add_argument('--rebuild', dest='rebuild', action='store_true')
        parser.add_argument('--show-stats', dest='show_stats', action='store_true')
        parser.add_argument('--skip-deletions', dest='skip_del', action='store_true')
        parser.add_argument('--follow-links', dest='follow_links', action='store_true')
        parser.set_defaults(rebuild=False, skip_del=False, follow_links=False,
                            show_stats=False)

    def handle(self, **options):
        rebuild = options['rebuild']
        follow_links = options['follow_links']
        show_stats = options['show_stats']

        if rebuild:
            print('Clearing all current music information in database...')
            Track.objects.all().delete()
            Album.objects.all().delete()
            Artist.objects.all().delete()
            print('Done!')

        if show_stats: start_time = time.time()

        # Make sure the empty records have been created
        unknown_artist = Artist.get_empty_record()
        unknown_album = Album.get_empty_record()

        # Run stats
        files_added = []
        files_updated = []
        files_flagged = []
        files_deleted = []
        files_unadded = []
        num_examined = 0
        num_skipped = 0
        albums_added = 0
        artists_added = 0

        # Conditionally append an item to a list depending on show_stats
        cappend = lambda l, i: l.append(i) if show_stats else None

        gen = os.walk(settings.MUSIC_DIR, followlinks=follow_links)

        for (path, dirnames, filenames) in gen:
            for filename in filenames:
                if show_stats: num_examined += 1

                if not re.match(settings.FILE_REGEX, filename):
                    continue

                full_path = os.path.join(path, filename)
                mod_time = utils.get_mod_time(full_path)

                try:
                    track = Track.objects.get(path=full_path)
                    new = False
                except Track.DoesNotExist:
                    track = Track(path=full_path)
                    new = True

                if (rebuild or new or track.file_mod_time < mod_time):
                    result, album_created, artist_created = track.sync()

                    if result == Track.SyncCodes.SUCCESS:
                        track.save()

                        if new: cappend(files_added, track)
                        else: cappend(files_updated, track)

                        if show_stats: albums_added += int(album_created)
                        if show_stats: artists_added += int(artist_created)

                    elif result == Track.SyncCodes.UNADDED:
                        cappend(files_unadded, full_path)

                    elif result == Track.SyncCodes.DELETED:
                        cappend(files_deleted, track)

                    elif result == Track.SyncCodes.FLAGGED:
                        track.save()
                        cappend(files_flagged, track)
                    else:
                        raise RuntimeError('Unexpected SyncCode %d', result)

                else:
                    if show_stats: num_skipped += 1

        if show_stats:
            duration = time.time() - start_time

            print('Ampersand database update complete.')
            print('===================================')
            print('  Examined %d files in %.3f seconds'
                    % (num_examined, duration))
            print('  Tracks added: %d' % len(files_added))
            print('  Tracks updated: %d' % len(files_updated))
            print('  Tracks flagged: %d' % len(files_flagged))
            print('  Tracks deleted: %d' % len(files_deleted))
            print('  Tracks unable to be loaded: %d' % len(files_unadded))
            print('  Tracks left alone: %d' % num_skipped)
            print('  New albums added: %d' % albums_added)
            print('  New artists added: %d' % artists_added)

            if files_flagged:
                print('\n\nThe following tracks were flagged as invalid:')
                for track in files_flagged:
                    print ('  %s' % track.identifier)

            if files_deleted:
                print('\n\nThe following tracks were deleted:')
                for track in files_deleted:
                    print ('  %s' % track.identifier)

            if files_unadded:
                print('\n\nThe following files could not be added:')
                for path in files_unadded:
                    print ('  %s' % path)

