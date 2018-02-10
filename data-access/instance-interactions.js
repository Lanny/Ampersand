import { NativeModules } from 'react-native'
import * as _ from 'lodash'

import getConnection from './database'
import { appendQuery, parseXML } from './utils.js'

async function paginatedCall(params, dataCb) {
  const perQuery = 1000
  let totalCount = null
  let loadedSoFar = 0

  while (loadedSoFar < totalCount || totalCount === null) {
    let workingParams = _.merge(
      {},
      params,
      {limit: perQuery, offset: loadedSoFar})
    let response = await ampCall(workingParams)

    loadedSoFar += response.root.artist.length
    totalCount = parseInt(response.root.total_count[0])

    await dataCb(response)
  }
}

async function ampCall(params, retry=true) {
  const db = await getConnection()
  const instance = await db.getSetting('instance')
  const path = `${instance.url}/server/xml.server.php`
  const workingParams = _.merge(
    { auth: instance.token },
    params, 
    { version: instance.version })

  const url = appendQuery(path, workingParams)
  const serverResponse = await fetch(url)
  const xml = await serverResponse.text()
  const data = await parseXML(xml)

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

    const authToken = await fetchAuthToken(instance)
    return await ampCall(params, false)
  }

  return data
}

async function fetchAuthToken(instance) {
  const db = await getConnection()
  const [passphrase, timeStr] = await NativeModules.AmpHelpers.getTokenParams(
    instance.password)

  const response = await ampCall({
    action: 'handshake',
    auth: passphrase,
    timestamp: timeStr,
    user: instance.username
  }, false)

  instance.token = response.root.auth[0]
  await db.setSetting('instance', instance)

  return instance
}

export async function fetchArtists(action) {
  const db = await getConnection()
  const dataCb = response => {
    const promises = response.root.artist.map(artist =>
      db.executeSql('INSERT INTO artists (ampache_id, name) VALUES (?,?)',
                    [artist['$'].id, artist.name[0]]))

    return Promise.all(promises)
  }

  await paginatedCall({action: 'artists'}, dataCb)
}
