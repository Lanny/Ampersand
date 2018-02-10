import React, { Component } from 'react'
import { connect } from 'react-redux'
import Sound from 'react-native-sound';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from 'react-native'

import getConnection from '../data-access/database'
import globalStyles from '../styles/globalStyles'


class TracksForAlbum extends Component {
  componentWillMount() {
    this.setState({albums: []})

    getConnection()
      .then(db => db.executeSql(
        'SELECT * FROM tracks WHERE album_id = ?', [this.props.albumId]))
      .then(([results]) => {
        this.setState({tracks: results.rows.raw() })
      })
  }

  renderItem({ item }) {
    const playTrack = () => {
      /*
      console.log(item.url)
      const sound = new Sound('Atoll.mp3', Sound.MAIN_BUNDLE, error => {
        if (error)
          console.log('UH OH', error)

        console.log('duration in seconds: ' + sound.getDuration())
        sound.play()
      })
      console.log('jam')
      */
      this.props.playTrack({trackId: item.ampache_id})
    }

    return (
      <TouchableOpacity onPress={playTrack}>
        <View style={globalStyles.listItem}>
          <Text>{item.name}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          renderItem={this.renderItem.bind(this)}
          data={this.state.tracks}
          keyExtractor={(item, index) => `${index}`} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

const mapDispatchToProps = dispatch => ({
  playTrack: options => dispatch({type: 'PLAY_TRACK', options})
})

export default connect(null, mapDispatchToProps)(TracksForAlbum)
