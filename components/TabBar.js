import React, { Component } from 'react'
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import { fetchArtists } from '../data-access/instance-interactions'
import getConnection from '../data-access/database'

class TabListItem extends Component {
  activate() {
    this.props.setView(this.props.viewId)
  }

  render() {
    const activate = this.activate.bind(this)

    return (
      <TouchableOpacity style={styles.item} onPress={activate}>
        <Text>{this.props.title}</Text>
      </TouchableOpacity>
    )
  }
}

const tabs = [
  ['ARTISTS', 'Artists'],
  ['SETTINGS', 'Settings']
]

class TabList extends Component {
  render() {
    const items = tabs.map(([key, title]) => (
        <TabListItem title={title}
                     viewId={key}
                     key={key}
                     setView={this.props.setView} />
      ))

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

const mapStateToProps = state => ({
  activeView: state.view.activeView
})

const mapDispatchToProps = dispatch => ({
  setView: viewName => dispatch({type: 'SET_VIEW', viewName})
})

export default connect(mapStateToProps, mapDispatchToProps)(TabList)
