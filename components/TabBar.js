import React, { Component } from 'react'
import { Text, View, StyleSheet } from 'react-native'


import { fetchArtists } from '../data-access/instance-interactions'
import getConnection from '../data-access/database'

class TabListItem extends Component {
  render() {
    return (
      <View style={styles.item}>
        <Text>{this.props.title}</Text>
      </View>
    )
  }
}

export default class TabList extends Component {
  render() {
    var items = [
      <TabListItem title="Artists" key="1" />,
      <TabListItem title="Settings" key="2" />,
    ]

    return (
      <View style={styles.tabList}>
        {items}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  tabList: {
    flexDirection: 'row',
    borderColor: '#AAA',
    borderTopWidth: 1
  },
  item: {
    flex: 1,
    backgroundColor: '#FFF',
    borderColor: '#AAA',
    borderRightWidth: 1,
    height: 50,
    justifyContent: 'space-around',
    alignItems: 'center'
  },

})
