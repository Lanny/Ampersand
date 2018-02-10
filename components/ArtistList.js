import React, { Component } from 'react'
import { Text, View, SectionList, Header, ListItem, StyleSheet } from 'react-native'


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
      <View style={styles.item}>
        <Text style={styles.itemName}>{item.name}</Text>
      </View>
    )
  }

  renderSectionHeader({ section }) {
    return (
      <View style={styles.heading}>
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
      <View style={styles.container}>
        <SectionList
          renderItem={this.renderItem}
          renderSectionHeader={this.renderSectionHeader}
          sections={sections}
          keyExtractor={(item, index) => index} />
      </View>
    )
  }
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  heading: {
    backgroundColor: '#EFEFEF',
    borderColor: '#AAA',
    borderBottomWidth: 1,
    paddingLeft: 15,
    paddingTop: 5,
    paddingBottom: 5
  },
  item: {
    backgroundColor: '#FFF',
    padding: 15,
    borderColor: '#AAA',
    borderBottomWidth: 1
  }
})
