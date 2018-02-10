import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import ArtistList from './ArtistList'
import Settings from './Settings'
import TabBar from './TabBar'

class ViewManager extends Component {
  getActiveView() {
    switch (this.props.activeView) {
      case 'ARTISTS':
        return <ArtistList />
      case 'SETTINGS':
        return <Settings />
      default:
        throw new Error(`Unrecognized view name: ${this.props.viewName}`)
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.activeView}>
          {this.getActiveView()}
        </View>
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
  },
  activeView: {
    flex: 1
  }
})

const mapStateToProps = state => ({
  activeView: state.view.get('activeView')
})

export default connect(mapStateToProps)(ViewManager)
