import { combineReducers } from 'redux'
import { Map } from 'immutable'

const VIEW_NAMES = new Set([
  'ARTISTS',
  'ALBUMS_FOR_ARTIST',
  'TRACKS_FOR_ALBUM',
  'PLAYER',
  'SETTINGS',
  'PROCESSING'
])

const initialViewState = Map({
  activeView: 'ARTISTS',
  viewParams: {}
})

function viewReducer(state=initialViewState, action) {
  switch (action.type) {
    case 'SET_VIEW':
      if (!VIEW_NAMES.has(action.viewName))
        throw new Error('Unknown view: ' + action.viewName)

      return state.set('activeView', action.viewName)
        .set('viewParams', action.viewParams)

    case 'PROC_DONE':
      return state.set('activeView', 'SETTINGS')

    default:
      return state
  }
}

const initialPlayerState = Map({
  currentlyPlaying: null,
  playbackState: 'STOPPED'
})

function playerReduver(state=initialPlayerState, action) {
  switch (action.type) {
    case 'SET_PLAYING_TRACK':
      return state
        .set('playbackState', 'PLAYING')
        .set('currentplyPlaying', action.trackId)

    case 'TOGGLE_PLAYBACK_STATE':
      const newState = (state.get('playbackState') === 'PLAYING')?
        'PAUSED' : 'PLAYING'
      return state.set('playbackState', newState)

    default:
      return state
  }
}

export default combineReducers({
  view: viewReducer,
  player: playerReduver
})

