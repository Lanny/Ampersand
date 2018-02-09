import React, { Component } from 'react'
import { NativeModules, Platform, StyleSheet, Text, View } from 'react-native'
import getConnection from './data-access/database'

const { AmpHelpers } = NativeModules

type Props = {}
export default class App extends Component<Props> {
  getDatPass() {
    const result = AmpHelpers.getTokenParams('')
      .done(result => {
        console.log(result)
        this.setState({data: result})
      })
  }

  componentWillMount() {
    getConnection().then(db => {
      db.getSetting('instance').then(result => {
        console.log(result)
        debugger
      })
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Foobar
        </Text>
        <Text style={styles.instructions}>
          To get started, edit App.js
        </Text>
      </View>
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
