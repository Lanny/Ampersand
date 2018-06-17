import os
from datetime import datetime, timezone

def get_mod_time(path):
    utime = os.path.getmtime(path)
    ndt = datetime.fromtimestamp(utime)
    return ndt.replace(tzinfo=timezone.utc)

def get_artist(tag):
    return tag.artist or tag.album_artist

def get_album_artist(tag):
    return tag.album_artist or tag.artist
