import React, { Component } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'

import ArtistList from './components/ArtistList'
import TabBar from './components/TabBar'

type Props = {}
export default class App extends Component<Props> {
  render() {
    return (
      <View style={styles.container}>
        <ArtistList />
        <TabBar />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5FCFF',
  }
})
