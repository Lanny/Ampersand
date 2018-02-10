import { put, call, all, select, takeLatest } from 'redux-saga/effects'

import getConnection from '../data-access/database'
import { fetchArtists } from '..//data-access/instance-interactions'

function* flushAndReload() {
  const db = yield call(getConnection)
  yield put({ type: 'SET_VIEW', viewName: 'PROCESSING' })
  yield put({ type: 'PROC_PROG', stage: 'FLUSHING' })
  yield call(db.flush.bind(db))
  yield put({ type: 'PROC_PROG', stage: 'FETCHING_ARTISTS' })
  yield call(fetchArtists)
  yield put({ type: 'PROC_DONE' })
}

function* combinedSagas() {
  yield all([
    takeLatest('FLUSH_AND_RELOAD_DB', flushAndReload)
  ])
}

export default combinedSagas
