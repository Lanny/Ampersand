from django.contrib import admin

from .models import *

class TrackInline(admin.TabularInline):
    model = Track
    extra = 0

class AlbumInline(admin.TabularInline):
    model = Album
    extra = 0

@admin.register(Artist)
class ArtistAdmin(admin.ModelAdmin):
    list_display = ('title',)

@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'year')

@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ('title', 'album', 'artist', 'track_num')
