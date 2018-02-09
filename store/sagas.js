import { put, call, all, takeLatest } from 'redux-saga/effects'
import { NativeModules } from 'react-native'

import { appendQuery, parseXML } from '../data-access/utils.js'

function* fetchAuthToken(action) {
  const [passphrase, timeStr] = yield call(NativeModules.AmpHelpers.getTokenParams,
                                           action.instance.password)

  const path = `${action.instance.url}/server/xml.server.php`
  const url = appendQuery(path, {
    action: 'handshake',
    auth: passphrase,
    timestamp: timeStr,
    version: action.instance.version,
    user: action.instance.username
  })

  const serverResponse = yield call(fetch, url)
  const xml = yield serverResponse.text()
  const data = yield parseXML(xml)

  put({
    type: 'SET_AUTH_TOKEN',
    instance: action.instance,
    token: data.root.auth[0]
  })
}

function* combinedSagas() {
  yield all([
    takeLatest('FETCH_AUTH_TOKEN', fetchAuthToken)
  ])
}

export default combinedSagas
