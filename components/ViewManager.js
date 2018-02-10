import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import ArtistList from './ArtistList'
import AlbumsForArtist from './AlbumsForArtist'
import TracksForAlbum from './TracksForAlbum'
import Settings from './Settings'
import Processing from './Processing'
import TabBar from './TabBar'

class ViewManager extends Component {
  getActiveView() {
    switch (this.props.activeView) {
      case 'ARTISTS':
        return <ArtistList />
      case 'SETTINGS':
        return <Settings />
      case 'PROCESSING':
        return <Processing />
      case 'ALBUMS_FOR_ARTIST':
        return <AlbumsForArtist {...this.props.viewParams} />
      case 'TRACKS_FOR_ALBUM':
        return <TracksForAlbum {...this.props.viewParams} />
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
    backgroundColor: '#FFF',
  },
  activeView: {
    flex: 1
  }
})

const mapStateToProps = state => ({
  activeView: state.view.get('activeView'),
  viewParams: state.view.get('viewParams'),
})

export default connect(mapStateToProps)(ViewManager)
