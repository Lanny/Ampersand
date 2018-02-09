import { combineReducers } from 'redux'
import { OrderedSet, Record } from 'immutable'

const AmpacheInstance = Record({
  url: '',
  username: null,
  password: null,
  version: '350001',
  token: null
})

const instanceInitialState = AmpacheInstance({
  url: 'http://music.lannysport.net',
  username: 'lanny',
  password: '2Salinas',
  version: '350001'
})

function instanceReducer(state=instanceInitialState, action) {
  switch (action.type) {
    case 'UPDATE_INSTANCE':
      return state.merge(action.data)
    default:
      return state
  }
}

const artistsInitialState = OrderedSet()

function artistsReducer(state=artistsInitialState, action) {
  switch (action.type) {
    default:
      return state
  }
}

export default combineReducers({
  instance: instanceReducer,
  artists: artistsReducer,
})
