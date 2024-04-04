import React from 'react'
import { Platform, StatusBar, StyleSheet, View, ActivityIndicator, Text, AsyncStorage } from 'react-native'
import { AppLoading, SplashScreen } from 'expo'
import * as Icon from '@expo/vector-icons'
import * as Font from 'expo-font'
import * as Permissions from 'expo-permissions'
import * as Location from 'expo-location'
import { Asset } from 'expo-asset'
import AppNavigator from './navigation/AppNavigator'
import axios from 'axios'
import { API_URL } from './Utile'

import AppContext from './context/AppContext'

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
    mapBase : null,
    jsonFirstPartLoader: false,
    jsonFullPartLoader: false,
    currentLocation: null,
    hasLocationPermissions: null,

    requestParams_count: 40,
    requestParams_page: 1,
  }

  componentDidMount() {
    SplashScreen.preventAutoHide()
    this.checkJson()
  }

  storeJson = async (toStore) => {
    try {
      await AsyncStorage.setItem('workshop', toStore);
    } catch (error) {
    }
  };

  checkJson = async () => {
    try {
      const value = await AsyncStorage.getItem('workshop');
      if (value !== null) {
        this.setContextJson(JSON.parse(value))
        this._getLocationAsync('all')
      } else {
        this._getLocationAsync('pages')
      }
    } catch (error) {

    }
  }

  setContextJson(json) {
    this.setState({
      jsonFirstPartLoader: true,
      jsonFullPartLoader: true,
      mapBase: json
    })
  }

  _getLocationAsync = async (scope) => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      let currentLocation = {latitude: 48.856613, longitude: 2.352222, latitudeDelta: 15, longitudeDelta: 15}
      this.setState({
        hasLocationPermissions: false,
        currentLocation: currentLocation,
      })
      this.loadJson(currentLocation, scope)
    } else {
      let location = await Location.getCurrentPositionAsync({accuracy: 3});
      let currentLocation = {latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 4, longitudeDelta: 4}
      this.setState({
        hasLocationPermissions: true,
        currentLocation: currentLocation
      });
      this.loadJson(currentLocation, scope)
    }
   };

  loadJson(currentLocation, scope) {
    const {requestParams_page, requestParams_count} = this.state
    const paramsObj = {
      p_p_id: 'alltrucks_workshop_finder_WAR_alltrucksworkshopfinderportlet',
      p_p_lifecycle: '2',
      p_p_state: 'normal',
      p_p_mode: 'view',
      p_p_cacheability: 'cacheLevelPage',
      p_p_col_id: 'column-4',
      p_p_col_count: '1',
      p_p_resource_id: 'search',
      page: requestParams_page,
      count: requestParams_count,
      lat: currentLocation.latitude,
      long: currentLocation.longitude,
    }

    // axios.get(`${API_URL}`, {
    //     params: paramsObj
    //   })
    //   .then(res => {
    //     if(scope !== 'all') {
    //       this.setState({
    //         jsonFirstPartLoader: true,
    //         mapBase: res.data.resultList
    //       })
    //     } else {
    //       this.setState({
    //         jsonFirstPartLoader: true,
    //       })
    //     }
    //     this.startLooping(res.data.resultList, scope)

    //   })
    //   .catch(err => {
    //       console.log('error', err)
    //   });

    axios.get(`http://localhost:6000/workshop`)
    .then(res => {
      if(scope !== 'all') {
        this.setState({
          jsonFirstPartLoader: true,
          mapBase: res.data.resultList
        })
      } else {
        this.setState({
          jsonFirstPartLoader: true,
        })
      }
      this.setContextJson(JSON.parse(res).data.resultList)

    })
    .catch(err => {
        console.log('error', err)
    });
  }

  async startLooping(jsonBase, scope) {
    let endGetJson = false
    let json = jsonBase
    let page = 2
    while (!endGetJson) {
      let response = await this.launchRequest(page)
      if(response.data.data.resultList.length <= 0) {
        endGetJson = true
        this.storeJson(JSON.stringify(json))
        this.setContextJson(json)
      } else {
        json = json.concat(response.data.data.resultList)
        if(scope !== 'all') {
          this.setState({
            mapBase: json
          })
        }
        page++
      }
    }
  }

  async launchRequest(currentPage) {
    const {currentLocation, requestParams_count} = this.state
    const paramsObj = {
      p_p_id: 'alltrucks_workshop_finder_WAR_alltrucksworkshopfinderportlet',
      p_p_lifecycle: '2',
      p_p_state: 'normal',
      p_p_mode: 'view',
      p_p_cacheability: 'cacheLevelPage',
      p_p_col_id: 'column-4',
      p_p_col_count: '1',
      p_p_resource_id: 'search',
      page: currentPage,
      count: requestParams_count,
      lat: currentLocation.latitude,
      long: currentLocation.longitude,
    }

    return new Promise(resolve => {
      axios.get(`${API_URL}`, {
        params: paramsObj
      })
      .then(res => {
        let obj =  {
          status: 'sucess',
          data: res,
          currentPage: currentPage
        }
        resolve(obj);

      })
      .catch(err => {
        let obj =  {
          status: 'error',
          data: err
        }

        resolve(obj);
      });
    });
  }

  render() {
    const { mapBase, jsonFirstPartLoader } = this.state
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <View style={{ flex: 1, backgroundColor: '#FFF' }}>
          <AppLoading
            startAsync={this._loadResourcesAsync}
            onError={this._handleLoadingError}
            onFinish={this._handleFinishLoading}
          />

        </View>
      )
    } else if(!jsonFirstPartLoader) {
      return (
        <View style={{ flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#021A3E" />
          <Text style={{marginTop: 20, color: "#021A3E"}}>Loading app content...</Text>
        </View>
      )
    } else {
      return (
        <AppContext.Provider value={{
            mapBase: mapBase, 
          }}>

          <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
            <AppNavigator />
          </View>
        </AppContext.Provider>
      )
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/markerMeIphone.png'),
        require('./assets/images/logo-inline.png'),
        require('./assets/images/pinIphone.png'),
        require('./assets/images/avatar.png'),
      ]),
      Font.loadAsync({
        ...Icon.Ionicons.font,
        'sf-pro-display': require('./assets/fonts/SF-Pro-Display-Bold.ttf'),
        'sf-pro-text': require('./assets/fonts/SF-Pro-Text-Regular.ttf'),
        'sf-pro-text-bold': require('./assets/fonts/SF-Pro-Text-Bold.ttf'),
        'sf-pro-text-semibold': require('./assets/fonts/SF-Pro-Text-Semibold.ttf'),
      }),
    ])
  }

  _handleLoadingError = error => {
    console.warn(error)
  }

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
