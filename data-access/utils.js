import { parseString } from 'react-native-xml2js'

// Light wrapper around xml2js to return a promise so sagas get along with it
// better.
export function parseXML(xml) {
  return new Promise((resolve, reject) =>
    parseString(xml, (err, result) => {
      if (err)
        reject(err, result)
      else
        resolve(result)
    }))
}

export function appendQuery(url, params) {
  var returnUrl = url;
  const parts = []

  for (key in params) {
    parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
  }

  returnUrl += (url.indexOf('?') == -1) ? '?' : '&'
  returnUrl += parts.join('&')

  return returnUrl
}
