import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet
} from 'react-native'

import { fetchArtists } from '../data-access/instance-interactions'
import getConnection from '../data-access/database'
import globalStyles from '../styles/globalStyles'


class AlbumsForArtist extends Component {
  componentWillMount() {
    this.setState({albums: []})

    getConnection()
      .then(db => db.executeSql(
        'SELECT * FROM albums WHERE artist_id = ?', [this.props.artistId]))
      .then(([results]) => {
        this.setState({albums: results.rows.raw() })
      })
  }

  renderItem({ item }) {
    const goToAlbum = this.props.setView.bind(
      null,
      'TRACKS_FOR_ALBUM',
      {albumId: item.ampache_id})

    
    return (
      <TouchableOpacity onPress={goToAlbum}>
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
          data={this.state.albums}
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
  setView: (viewName, viewParams) =>
    dispatch({type: 'SET_VIEW', viewName, viewParams})
})

export default connect(null, mapDispatchToProps)(AlbumsForArtist)


