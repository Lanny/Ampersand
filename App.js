import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'

import reducers from './store/reducers'
import ViewManager from './components/ViewManager'

export default class App extends Component {
  componentWillMount() {
    this.store = createStore(reducers)
  }
  
  render() {
    return (
      <Provider store={this.store}>
        <ViewManager />
      </Provider>
    )
  }
}
