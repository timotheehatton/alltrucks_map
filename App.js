import React, { Component } from 'react'
import { Platform, StatusBar, StyleSheet, View, ActivityIndicator, Text, AsyncStorage } from 'react-native'
import * as SplashScreen from 'expo-splash-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Font from 'expo-font'
import * as Location from 'expo-location'
import { Asset } from 'expo-asset'
import MainTabNavigator from './navigation/MainTabNavigator'
import axios from 'axios'
import { API_URL } from './Utile'
import AppContext from './context/AppContext'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ViewPropTypes } from 'deprecated-react-native-prop-types';


export default class App extends Component {
  state = {
    isLoadingComplete: false,
    mapBase: null,
    jsonFirstPartLoader: false,
    jsonFullPartLoader: false,
    currentLocation: null,
    hasLocationPermissions: null,

    requestParams_count: 40,
    requestParams_page: 1,
  }

  async componentDidMount() {
    try {
      await SplashScreen.preventAutoHideAsync();
      await this._loadResourcesAsync();
    } catch (e) {
      console.warn(e);
    }
  }

  _loadResourcesAsync = async () => {
    try {
      await Promise.all([
        Asset.loadAsync([
          require('./assets/images/markerMeIphone.png'),
          require('./assets/images/logo-inline.png'),
          require('./assets/images/pinIphone.png'),
          require('./assets/images/avatar.png'),
        ]),
        Font.loadAsync({
          ...Ionicons.font,
          'sf-pro-display': require('./assets/fonts/SF-Pro-Display-Bold.ttf'),
          'sf-pro-text': require('./assets/fonts/SF-Pro-Text-Regular.ttf'),
          'sf-pro-text-bold': require('./assets/fonts/SF-Pro-Text-Bold.ttf'),
          'sf-pro-text-semibold': require('./assets/fonts/SF-Pro-Text-Semibold.ttf'),
        }),
        this.checkJson()  // Assuming checkJson initiates some data loading
      ]);
      this.setState({ isLoadingComplete: true }, async () => {
        await SplashScreen.hideAsync();
      });
    } catch (e) {
      console.warn(e);
    }
  }

  storeJson = async (toStore) => {
    try {
      await AsyncStorage.setItem('workshop', toStore);
    } catch (error) {
    }
  };

  checkJson = async () => {
    this._getLocationAsync('pages')
  }

  setContextJson = (json) => {
    this.setState({
      jsonFirstPartLoader: true,
      jsonFullPartLoader: true,
      mapBase: json
    })
  }

  _getLocationAsync = async (scope) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
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


  isValidCoordinate = (lat, lng) => {
    // Check if coordinates are valid
    if (!lat || !lng) return false;
    if (lat === null || lng === null) return false;
    if (lat === undefined || lng === undefined) return false;
    if (lat === "" || lng === "") return false;
    if (lat === "0" || lng === "0") return false;
    
    // Convert to number and check
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) return false;
    if (latitude === 0 || longitude === 0) return false;
    if (latitude === 0.0 || longitude === 0.0) return false;
    
    // Check valid coordinate ranges
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return false;
    
    return true;
  }

  loadJson = (currentLocation, scope) => {
    // New API doesn't need parameters, returns all workshops at once
    axios.get(`${API_URL}`)
      .then(res => {
        // Data is already in the correct format, no need to transform field names
        const transformedData = res.data.map(workshop => ({
          ...workshop,
          web: workshop.website, // Some screens use 'web' field
          imageUrl: workshop.imageId ? `/image/${workshop.imageId}` : null,
          // openHours is already provided by the API, no need to generate
        }));

        // Filter out workshops without valid coordinates
        const validWorkshops = transformedData.filter(w => 
          this.isValidCoordinate(w.latitude, w.longitude)
        );

        console.log(`Loaded ${res.data.length} workshops, ${validWorkshops.length} have valid coordinates`);

        this.setState({
          jsonFirstPartLoader: true,
          jsonFullPartLoader: true,
          mapBase: validWorkshops
        });
        
        this.storeJson(JSON.stringify(validWorkshops));
      })
      .catch(err => {
          console.log('error', err)
      });
  }


  render() {
    const { mapBase, jsonFirstPartLoader, isLoadingComplete } = this.state;

    if (!isLoadingComplete) {
      return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        </GestureHandlerRootView>
      )
    } else if (!jsonFirstPartLoader) {
      return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#021A3E" />
            <Text style={{ marginTop: 20, color: "#021A3E" }}>Loading app content...</Text>
          </View>
        </GestureHandlerRootView>
      )
    } else {
      return (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppContext.Provider value={{ mapBase: mapBase }}>
            <View style={styles.container}>
              {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
              <MainTabNavigator />
            </View>
          </AppContext.Provider>
        </GestureHandlerRootView>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
})
