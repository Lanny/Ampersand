import { combineReducers } from 'redux'
import { OrderedSet } from 'immutable'

const artistsInitialState = OrderedSet()

function artistsReducer(state=artistsInitialState, action) {
  switch (action.type) {
    default:
      return state
  }
}

export default combineReducers({
  artists: artistsReducer
})
