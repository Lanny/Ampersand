import React, { Component } from 'react'
import { connect } from 'react-redux'
import Sound from 'react-native-sound';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native'

import getConnection from '../../data-access/database'
import globalStyles from '../../styles/globalStyles'
import PlayIcon from './PlayIcon.svg'
import PauseIcon from './PauseIcon.svg'


class PlayerUI extends Component {
  render() {
    const { playbackState } = this.props
    const onPlayPausePress = this.props.togglePlaybackState
    const iconSource = (playbackState === 'PLAYING') ?
      require('./PlayIcon.png') : require('./PauseIcon.png')

    return (
      <View style={styles.container}>
        <Text>Hey There</Text>
        <TouchableOpacity onPress={onPlayPausePress}>
          <Image source={iconSource} style={{width: 40, height: 40}} />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
})

const mapStateToProps = state => ({
  currentlyPlaying: state.player.currentlyPlaying,
  playbackState: state.player.playbackState
})

const mapDispatchToProps = dispatch => ({
  togglePlaybackState: () => dispatch({type: 'TOGGLE_PLAYBACK_STATE'})
})

export default connect(null, mapDispatchToProps)(PlayerUI)
