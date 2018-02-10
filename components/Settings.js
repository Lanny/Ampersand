import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Text, View, Button } from 'react-native'

import { fetchArtists } from '../data-access/instance-interactions'

class Settings extends Component {
  flushAndReload() {
    this.props.flushAndReload()
  }

  render() {
    const flushAndReload = this.flushAndReload.bind(this)
    return (
      <View>
        <Text>Settings</Text>
        <Button title="Reload Data From Server" onPress={flushAndReload} />
      </View>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  flushAndReload: () => dispatch({ type: 'FLUSH_AND_RELOAD_DB' })
})

export default connect(null, mapDispatchToProps)(Settings)
