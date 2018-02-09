import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { NativeModules, Platform, StyleSheet, Text, View } from 'react-native'

const { AmpHelpers } = NativeModules

import reducers from './store/reducers'
import sagas from './store/sagas'

type Props = {}
export default class App extends Component<Props> {
  getDatPass() {
    console.log(AmpHelpers)
    const result = AmpHelpers.getTokenParams('')
      .done(result => {
        console.log(result)
        this.setState({data: result})
      })
  }

  componentWillMount() {
    const sagaMiddleware = createSagaMiddleware()
    this.store = createStore(reducers, applyMiddleware(sagaMiddleware))
    sagaMiddleware.run(sagas)

    this.store.dispatch({
      type: 'FETCH_AUTH_TOKEN',
      instance: {
        url: 'http://music.lannysport.net',
        username: 'lanny',
        password: '',
        version: '350001'
      }
    })
  }

  render() {
    return (
      <Provider store={this.store}>
        <View style={styles.container}>
          <Text style={styles.welcome}>
            Foobar
          </Text>
          <Text style={styles.instructions}>
            To get started, edit App.js
          </Text>
        </View>
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
})
