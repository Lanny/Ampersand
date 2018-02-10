import React, { Component } from 'react'
import { Text, View, SectionList, Header, ListItem } from 'react-native'


import { fetchArtists } from '../data-access/instance-interactions'
import getConnection from '../data-access/database'


export default class ArtistList extends Component {
  componentWillMount() {
    this.setState({artists: []})

    fetchArtists()
      .then(() => getConnection())
      .then(db => db.executeSql('SELECT * FROM artists'))
      .then(([results]) => {
        this.setState({artists: results.rows.raw() })
      })
  }

  renderItem({ item }) {
    return (
      <View key={ item.ampache_id }>
        <Text>{ item.name }</Text>
      </View>
    )
  }

  renderSectionHeader({ section }) {
    return (
      <View>
        <Text>{ section.title }</Text>
      </View>
    )
  }

  render() {
    const sections = [{
      title: 'Artists',
      data: this.state.artists
    }]

    return (
      <SectionList
        renderItem={this.renderItem}
        renderSectionHeader={this.renderSectionHeader}
        sections={sections} />
    )
  }
}
