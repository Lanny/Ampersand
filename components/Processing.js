import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Text, View, StyleSheet } from 'react-native'


class Processing extends Component {

  render() {
    return (
      <View style={styles.container}>
        <Text>Processing</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
})

export default connect(null, null)(Processing)
