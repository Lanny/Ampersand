import { combineReducers } from 'redux'
import { Map } from 'immutable'

const VIEW_NAMES = new Set(['ARTISTS', 'SETTINGS'])
const initialViewState = Map({
  activeView: 'ARTISTS'
})

function viewReducer(state=initialViewState, action) {
  console.log('mak')
  switch (action.type) {
    case 'SET_VIEW':
      if (!VIEW_NAMES.has(action.viewName))
        throw new Error('Unknown view: ' + action.viewName)

      return state.set('activeView', action.viewName)
    default:
      return state
  }
}

export default combineReducers({
  view: viewReducer
})

