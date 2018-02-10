import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'

import reducers from './store/reducers'
import sagas from './store/sagas'
import ViewManager from './components/ViewManager'

export default class App extends Component {
  componentWillMount() {
    const sagaMiddleware = createSagaMiddleware()
    this.store = createStore(reducers, applyMiddleware(sagaMiddleware))
    sagaMiddleware.run(sagas)
    
  }
  
  render() {
    return (
      <Provider store={this.store}>
        <ViewManager />
      </Provider>
    )
  }
}
