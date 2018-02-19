import { put, call, all, select, takeLatest } from 'redux-saga/effects'
import Sound from 'react-native-sound';

import getConnection from '../data-access/database'
import {
  fetchArtists,
  fetchAlbums,
  fetchTracks,
  downloadTrack
} from '../data-access/instance-interactions'

function* flushAndReload(action) {
  const db = yield call(getConnection)
  yield put({ type: 'SET_VIEW', viewName: 'PROCESSING' })
  yield put({ type: 'PROC_PROG', stage: 'FLUSHING' })
  yield call(db.flush.bind(db))
  yield put({ type: 'PROC_PROG', stage: 'FETCHING_ARTISTS' })
  yield call(fetchArtists)
  yield put({ type: 'PROC_PROG', stage: 'FETCHING_ALBUMS' })
  yield call(fetchAlbums)
  yield put({ type: 'PROC_PROG', stage: 'FETCHING_TRACKS' })
  yield call(fetchTracks)
  yield put({ type: 'PROC_DONE' })
}

function* playTrack(action) {
  const { options: { trackId } } = action
  const db = yield call(getConnection)
  const trackData = yield call(
    db.selectOne.bind(db),
    'tracks',
    {ampache_id: trackId})

  let filePath
  if (!trackData.cached_file || true) {
    filePath = yield call(downloadTrack, trackId)
    yield call(db.update.bind(db),
               'tracks',
               {ampache_id: trackId},
               {cached_file: filePath})
  } else {
    filePath = trackData.cachedFile
  }

  yield put({ type: 'SET_VIEW', viewName: 'PLAYER' })

  const sound = new Sound(filePath, null, error => {
    if (error)
      console.log('UH OH', error)

    sound.play()
  })

}

function* combinedSagas() {
  yield all([
    takeLatest('FLUSH_AND_RELOAD_DB', flushAndReload),
    takeLatest('PLAY_TRACK', playTrack),
  ])
}

export default combinedSagas
