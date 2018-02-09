import { put, call, all, select, takeLatest } from 'redux-saga/effects'
import { NativeModules } from 'react-native'
import * as _ from 'lodash'

import { appendQuery, parseXML } from '../data-access/utils.js'

function* ampCall(params, retry=true) {
  const instance = yield select(state => state.instance)
  const path = `${instance.url}/server/xml.server.php`
  const workingParams = _.merge(
    { auth: instance.token },
    params, 
    { version: instance.version })

  const url = appendQuery(path, workingParams)
  const serverResponse = yield call(fetch, url)
  const xml = yield serverResponse.text()
  const data = yield parseXML(xml)

  if (!data.root)
    throw new Error('Unexpected response: \n' + xml)

  if ('error' in data.root) {
    // Can't recover from auth errors on handshakes
    if (params.method === 'handshake')
      throw new Error('Unexpected response: \n' + xml)

    const authError = data.root.error.filter(error => error['$'].code === 403)

    if (!authError)
      throw new Error('Unexpected response: \n' + xml)
    
    if (!retry)
      throw new Error('Unrecoverable auth error: \n' + xml)

    const authToken = yield call(fetchAuthToken, instance)
    return yield call(ampCall, params, false)
  }

  return data
}

function* fetchAuthToken(instance) {
  const [passphrase, timeStr] = yield call(NativeModules.AmpHelpers.getTokenParams,
                                           instance.password)

  const response = yield ampCall({
    action: 'handshake',
    auth: passphrase,
    timestamp: timeStr,
    user: instance.username
  }, false)

  const token = response.root.auth[0]

  yield put({
    type: 'UPDATE_INSTANCE',
    data: {
      token: token
    }
  })

  return instance
}

function* fetchArtists(action) {
  const response = yield call(ampCall, {
    action: 'artists',
    limit: 100
  })
}

function* combinedSagas() {
  yield all([
    takeLatest('FETCH_AUTH_TOKEN', fetchArtists)
  ])
}

export default combinedSagas
