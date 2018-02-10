import { NativeModules } from 'react-native'
import * as _ from 'lodash'
import RNFetchBlob from 'react-native-fetch-blob'

import getConnection from './database'
import { appendQuery, parseXML } from './utils.js'

async function paginatedCall(params, dataCb) {
  const perQuery = 1000
  let totalCount = null
  let loadedSoFar = 0

  while (loadedSoFar < totalCount || totalCount === null) {
    const workingParams = _.merge(
      {},
      params,
      {limit: perQuery, offset: loadedSoFar})
    const response = await ampCall(workingParams)

    let listKey = Object.keys(response.root)
      .filter(key => key !== 'total_count' && key !== '_')

    if (listKey.length !== 1)
      throw new Error('Unable to identify list element in response')
    else
      listKey = listKey[0]

    loadedSoFar += response.root[listKey].length
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

  console.debug(`ampCall to: ${url}`)

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

export async function fetchArtists() {
  const db = await getConnection()
  const dataCb = response => {
    const promises = response.root.artist.map(artist =>
      db.insert('artists', {
        ampache_id: artist['$'].id,
        name: artist.name[0]
      }))

    return Promise.all(promises)
  }

  await paginatedCall({action: 'artists'}, dataCb)
}

export async function fetchAlbums() {
  const db = await getConnection()
  const dataCb = response => {
    const promises = response.root.album.map(album =>
      db.insert('albums', {
        ampache_id: album['$'].id,
        artist_id: album.artist[0]['$'].id,
        name: album.name[0],
        year: album.year[0]
      }))

    return Promise.all(promises)
  }

  await paginatedCall({action: 'albums'}, dataCb)
}

export async function fetchTracks() {
  const db = await getConnection()
  const dataCb = response => {
    const promises = response.root.song.map(song =>
      db.insert('tracks', {
        ampache_id: song['$'].id,
        album_id: song.album[0]['$'].id,
        track_number: song.track[0],
        name: song.name[0],
        url: song.url[0]
      }))

    return Promise.all(promises)
  }

  await paginatedCall({action: 'songs'}, dataCb)
}

export async function downloadTrack(trackId) {
  const db = await getConnection()
  const trackData = await db.selectOne('tracks', {ampache_id: trackId})
  
  const file = await RNFetchBlob
    .config({ fileCache: true, appendExt: 'mp3' })
    .fetch('GET', trackData.url)

  return file.path()
}
