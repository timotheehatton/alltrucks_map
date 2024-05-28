import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableHighlight,
  ActivityIndicator,
  Linking,
  Alert,
  StatusBar,
  Animated,
  AppState
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import SlidingUpPanel from 'rn-sliding-up-panel';
import haversine from 'haversine';
import Communications from 'react-native-communications';
import 'moment';
import 'moment/locale/fr';
import Moment from 'moment';
import AppContext from '../context/AppContext'

const { height, width } = Dimensions.get('window');
let alertStatus = true


export default class MapScreen extends React.Component {
  static contextType = AppContext;

  static navigationOptions = {
    header: null,
    tabBarVisible: false,
  };

  constructor(props) {
    super(props)
    this.find_dimensions = this.find_dimensions.bind(this)
    this.mapRef = React.createRef();
    this.panelRef = React.createRef();
    this.closePanel = this.closePanel.bind(this);
    this.animatedValue = new Animated.Value(0); 
  }

  state = {
    currentDay: {
      day: null,
      hour: null,
      dayNumber: null
    },
    appState: AppState.currentState,
    mapRegion: null,
    hasLocationPermissions: false,
    locationResult: null,
    visible: false,
    contentPanel: null,
    selectedMarker: null,
    oneLoad: false,
    currentLocation: null,
    contentheight: height,
    oneLayout: true,
    space: 0.025,
    distanceTravelled: 0,
    draggableRange: {
      top: height,
      bottom: 120
    }
  };

  componentDidMount = () => {
    this._getLocationAsync()
    this.listener = this.animatedValue.addListener(this.onAnimatedValueChange)
    Moment.locale('fr')
    this._getCurrentDay()
    this.watchPosition()
    const { navigation } = this.props;
  
    this.appStateSubscription = AppState.addEventListener("change", this._handleAppStateChange);
    this.focusListener = navigation.addListener("didFocus", () => {
      if(this.state.mapRegion) {
        let point = {latitude: this.state.mapRegion.latitude + this.state.space , longitude: this.state.mapRegion.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }
        this.setState({
          oneLoad: false,
          visible: false,
          
        })
      } else {
        this.setState({
          oneLoad: false,
          visible: false,
          
        })
      }
    });
    this.focusListener = navigation.addListener("didBlur", () => {
      this.setState({
        oneLoad: false,
        visible: false,
        
      })
    });
  }

  _handleAppStateChange = async nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      const location = await this._getLocationAsync()
      this.mapRef.current.animateToRegion(location, 300);
    }
    this.setState({ appState: nextAppState });
  };

  calcDistance = newLatLng => {
    const prevLatLng  = this.state.currentLocation
    return haversine(prevLatLng, newLatLng, {unit: 'meter'}) || 0;
  };

  watchPosition = async () => {
    try {
      this.watchID = await Location.watchPositionAsync(
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        position => {
          const { latitude, longitude } = position.coords;
          if (this.state.currentLocation !== null) {
            const newCoordinate = {
              latitude,
              longitude
            };
            this.setState({
              currentLocation: newCoordinate
            });
          }
        }
      );
    } catch (error) {
      console.error('Error watching position:', error);
    }
  }

  find_dimensions = (layout) => {
    let sizeHeight = layout.height
    let sizePanel = sizeHeight

    // if (Platform.OS != "android") {
    //   // if (isIphoneX()) {
    //   //   sizePanel += 75 + getBottomSpace()
    //   // } else {
    //   sizePanel += 75
    //   // }
    // } else {
    //   sizePanel += 75
    // }

    this.setState({
      draggableRange: {
        top: sizePanel,
        bottom: 0,
      }
    }, () => {
      this.panelRef.current.show()
      // this.mapRef.current.animateToRegion(-sizePanel)
      // this.mapRef.current.forceUpdate()
    })
  }

  storeLocation = async (toStore) => {
    try {
      await AsyncStorage.setItem('location', toStore);
    } catch (error) {
    }
  };

  _handleMapRegionChange = mapRegion => {
    this.setState({ mapRegion });
  };

  _getLocationAsync = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permission to access location was denied',
      });
    } else {
      this.setState({ hasLocationPermissions: true });
    }

    let location = await Location.getCurrentPositionAsync({accuracy: 3});
    this.setState({ locationResult: JSON.stringify(location) });

    this.setState({
      mapRegion: { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 4, longitudeDelta: 4 },
      currentLocation: { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 4, longitudeDelta: 4 }
    });
    let toStore = { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 4, longitudeDelta: 4 }
    this.storeLocation(JSON.stringify(toStore));

    return toStore
  };

  _clickOnMarker = (marker) => {
    const point = {
      latitude: marker.latitude - this.state.space,
      longitude: marker.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    this.setState({contentPanel: marker, visible: true, mapRegion: point})
    this.mapRef.current.animateToRegion(point, 300);
  }

  getMarkerFromListe = (marker) => {
    let point = {
      latitude: marker.latitude - this.state.space,
      longitude: marker.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    }
    this.mapRef.current.animateToRegion(point, 100);
    setTimeout(() => {
      this.setState({
        contentPanel: marker,
        mapRegion: point
      })
      this.setState({visible: true})
      if(this.state.visible === true) {
        this.setState({oneLoad: true})
      }
    }, 200);
  }

  onAnimatedValueChange = ({ value }) => {
    if (value === 0) {
      this.closePanel();
    }
  };

  closePanel = () => {
    let point = {
      latitude: this.state.mapRegion.latitude + this.state.space,
      longitude: this.state.mapRegion.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    }
    this.setState({ visible: false });
    this.mapRef.current.animateToRegion(point, 300);
    this.setState({
      mapRegion: point
    })
  }

  getDistance = (startCoord, endCoord) => {
    let distanceMetre = geolib.getDistanceSimple(
      {latitude: startCoord.latitude, longitude: startCoord.longitude},
      {latitude: endCoord.latitude, longitude: endCoord.longitude}
    )

    let distanceKm = distanceMetre/1000
    return Math.round(distanceKm)
  }

  openMapApp = () => {
    let scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    let latLng = `${this.state.contentPanel.latitude},${this.state.contentPanel.longitude}`;
    let label = `${this.state.contentPanel.companyName}`;
    label = label.replace('&','');
    let url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    if (alertStatus) {
      Alert.alert(
        'Caution : Truck navigation',
        'The app that will be open cannot be optimised for truck navigation',
        [
          {text: 'OK', onPress: () => Linking.openURL(url)},
        ],
        {cancelable: false},
      );
      alertStatus = false
      
    } else {
      Linking.openURL(url)
    }
  }

  _getCurrentDay = () => {
    let date = new Date();
    let day = Moment().weekday()
    let hour = ("0" + date.getHours()).slice(-2);
    let minute = ("0" + date.getMinutes()).slice(-2);
    let dayArray = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

    this.state.currentDay.dayNumber = day
    this.state.currentDay.day = dayArray[day]

    this.state.currentDay.hour = hour+':'+minute
  }

  _getGarageHour = (day) => {
    this._getCurrentDay()
    let date = new Date();
    let statement = null
    let className = null
    let classNameDot = null


    let currentTime = Moment(this.state.currentDay.hour, 'HH:mm')
    let amOne = Moment(day[this.state.currentDay.dayNumber].openFromAM, 'HH:mm')
    let amTwo = Moment(day[this.state.currentDay.dayNumber].openToAM, 'HH:mm')
    let pmOne = Moment(day[this.state.currentDay.dayNumber].openFromPM, 'HH:mm')
    let pmTwo = Moment(day[this.state.currentDay.dayNumber].openToPM, 'HH:mm')

    if(currentTime < amOne) {
      statement = "Closed"
      className = styles.hour_close
      classNameDot = styles.hourDot_close
    } else if((currentTime >= amOne && currentTime <= amTwo) || (currentTime >= pmOne && currentTime <= pmTwo)) {
      statement = "Currently open"
      className = styles.hour_open
      classNameDot = styles.hourDot_open
      let pmEnd = Moment(day[this.state.currentDay.dayNumber].openToPM, 'HH:mm')
      let soonPm = pmEnd.subtract({'hours': '01'})

      let amEnd = Moment(day[this.state.currentDay.dayNumber].openToAM, 'HH:mm')
      let soonAm = amEnd.subtract({'hours': '01'})

      if((currentTime >= soonPm && currentTime <= pmTwo) || (currentTime >= soonAm && currentTime <= amTwo)) {
        statement = "Closed soon"
        className = styles.hour_soon
        classNameDot = styles.hourDot_soon
      }
    } else {
      statement = "Closed"
      className = styles.hour_close
      classNameDot = styles.hourDot_close
    }

    return (
      <View style={styles.time}>
        <View style={[styles.hoursDot, classNameDot]}></View>
        <Text style={[styles.panelHour, className]}>
          {statement}
        </Text>
      </View>
    )
  }

  openMailApp = () => {
    Linking.openURL('mailto:' + this.state.contentPanel.email)
  }

  openTelApp = () => {
    let phoneNumber = this.state.contentPanel.phoneNumber
    if (this.state.contentPanel.country != 'Italien') {
      phoneNumber = phoneNumber.replace('(0)', '');
    }
    Linking.openURL(`tel:${phoneNumber}`)
  }

  openWebApp = () => {
    let website = this.state.contentPanel.web
    if (website) {
      Communications.web('http://' + website, true)
    } else {
      Communications.web("https://www.alltrucks.com", true)
    }
  }

  centerMap = () => {
    let current = {
      latitude: this.state.currentLocation.latitude,
      longitude: this.state.currentLocation.longitude,
      latitudeDelta: 4,
      longitudeDelta: 4
    }
    this.mapRef.current.animateToRegion(current, 300);
    this.setState({ visible: false, mapRegion: current })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.route.params?.selectedMarker !== this.props.route.params?.selectedMarker) {
      const selectedMarker = this.props.route.params?.selectedMarker;
      if (selectedMarker) {
        this.getMarkerFromListe(selectedMarker);
        this.props.navigation.setParams({ selectedMarker: null });
      }
    }
  }

  render = () => {
    const { mapBase } = this.context
    if(mapBase === null) {
      return (
        <View style={{ flex: 1, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#021A3E" />
          <Text style={{marginTop: 20, color: "#021A3E"}}>Loading app content...</Text>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <StatusBar hidden={true}/>
        {
          this.state.locationResult === null ?
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#021A3E" />
            <Text style={{marginTop: 20, color: "#021A3E"}}>Finding your current location...</Text>
          </View> :
          this.state.hasLocationPermissions === false ?
            <Text>Location permissions are not granted.</Text> :
            this.state.mapRegion === null && this.state.currentLocation === null ?
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#021A3E" />
            </View> :
            <View style={[styles.mapContainer, this.state.visible === true ? styles.mapContainerOpen : null]}>
              <MapView
                style={{ alignSelf: 'stretch', height: height }}
                initialRegion={this.state.mapRegion}
                ref={this.mapRef}
              >
                <Marker
                  key="ugdiue"
                  coordinate={{latitude: this.state.currentLocation.latitude, longitude: this.state.currentLocation.longitude}}
                  image={Platform.OS === "android" ? require('../assets/images/markerMe.png') : null}
                  anchor={Platform.OS === "android" ? { x:0.5, y:0.5 } : null}
                >
                {
                  Platform.OS != "android" ?
                  <Image
                    source={require('../assets/images/markerMeIphone.png')}
                    style={{ width: 50 }}
                    resizeMode="contain"
                    anchor={Platform.OS === "android" ? { x:0.5, y:1 } : null}
                  />
                  :
                  null
                }
                </Marker>
                {mapBase.map((marker,i) => (
                  <Marker
                    key={i}
                    coordinate={{latitude: parseFloat(marker.latitude), longitude: parseFloat(marker.longitude)}}
                    onPress={this._clickOnMarker.bind(this, marker)}
                    image={Platform.OS === "android" ? require('../assets/images/pin.png') : null}
                  >
                  {
                    Platform.OS != "android" ?
                    <Image
                      source={require('../assets/images/pinIphone.png')}
                      style={{ height: 60, width: 50, marginBottom: 60 }}
                      resizeMode="contain"
                    />
                    :
                    null
                  }
                  </Marker>
                ))}
              </MapView>
              <TouchableHighlight style={styles.centerMapBtn_container} underlayColor="#FFF" onPress={this.centerMap.bind(this)} >
                <View style={styles.centerMapBtn}>
                  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center',}}>
                    <Feather name="navigation" size={24} color="black" />
                  </View>
                </View>
              </TouchableHighlight>
              <Image
                source={require('../assets/images/logo-inline.png')}
                resizeMode="contain"
                style={styles.logoBottom}
              />
              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center',}}>
              </View>
            </View>
        }
        <SlidingUpPanel
          visible={this.state.visible}
          animatedValue={this.animatedValue}
          draggableRange={this.state.draggableRange}
          backdropOpacity={0.1}
          ref={this.panelRef}
        >
            {dragHandler => (
              this.state.visible === true ?
                <View style={styles.panelContent} {...dragHandler} onLayout={(event) => { this.find_dimensions(event.nativeEvent.layout) }}>
                  <View style={styles.panelHeaderBorderContainer} {...dragHandler}>
                    <View style={styles.panelHeaderBorder} />
                  </View>
                  <View>
                    <Text style={styles.panelTitle} >{this.state.contentPanel.companyName}</Text>
                    <Text style={styles.panelDescrib}>{this.state.contentPanel.address}, {this.state.contentPanel.postalCode} {this.state.contentPanel.city}</Text>
                    <View style={styles.panelSectionRow}>
                      <Text style={styles.panelDistance}>{this.getDistance({latitude: this.state.currentLocation.latitude, longitude: this.state.currentLocation.longitude }, {latitude: this.state.contentPanel.latitude, longitude: this.state.contentPanel.longitude })} km</Text>
                    </View>
                  </View>
                  <View style={styles.panelBorder}></View>
                  <View style={styles.panelSection}>
                    <View style={styles.panelHourSection}>
                      <Text style={styles.panelHourSection__title}>Opening hours</Text>
                      {
                        this._getGarageHour(this.state.contentPanel.openHours)
                      }
                    </View>
                    <View style={styles.timeContainer}>
                      <View style={styles.dayContainer}>
                        <Text style={[styles.hourContainer__day, this.state.currentDay.day === "monday" ? styles.hourContainer__dayCurrent : null]}>Monday</Text>
                        <Text style={[styles.hourContainer__day, this.state.currentDay.day === "tuesday" ? styles.hourContainer__dayCurrent : null]}>Tuesday</Text>
                        <Text style={[styles.hourContainer__day, this.state.currentDay.day === "wednesday" ? styles.hourContainer__dayCurrent : null]}>Wednesday</Text>
                        <Text style={[styles.hourContainer__day, this.state.currentDay.day === "thursday" ? styles.hourContainer__dayCurrent : null]}>Thursday</Text>
                        <Text style={[styles.hourContainer__day, this.state.currentDay.day === "friday" ? styles.hourContainer__dayCurrent : null]}>Friday</Text>
                        <Text style={[styles.hourContainer__day, this.state.currentDay.day === "saturday" ? styles.hourContainer__dayCurrent : null]}>Saturday</Text>
                        <Text style={[styles.hourContainer__day, this.state.currentDay.day === "sunday" ? styles.hourContainer__dayCurrent : null]}>Sunday</Text>
                      </View>
                      <View style={styles.hourContainer}>
                        <Text style={[styles.hourContainer__hour , this.state.currentDay.day === "monday" ? styles.hourContainer__dayCurrent : null]}>{this.state.contentPanel.openHours[0].openFromAM !== "" && this.state.contentPanel.openHours[0].openFromAM !== undefined ? this.state.contentPanel.openHours[0].openFromAM + " - " + this.state.contentPanel.openHours[0].openToAM : "Closed"}{this.state.contentPanel.openHours[0].openFromPM ? ' / ' : ''} {this.state.contentPanel.openHours[0].openFromPM}{this.state.contentPanel.openHours[0].openToPM ? ' - ' : ''}{this.state.contentPanel.openHours[0].openToPM}</Text>
                        <Text style={[styles.hourContainer__hour, this.state.currentDay.day === "tuesday" ? styles.hourContainer__dayCurrent : null]}>{this.state.contentPanel.openHours[1].openFromAM !== "" && this.state.contentPanel.openHours[1].openFromAM !== undefined ? this.state.contentPanel.openHours[1].openFromAM + " - " + this.state.contentPanel.openHours[1].openToAM : "Closed"}{this.state.contentPanel.openHours[1].openFromPM ? ' / ' : ''} {this.state.contentPanel.openHours[1].openFromPM}{this.state.contentPanel.openHours[1].openToPM ? ' - ' : ''}{this.state.contentPanel.openHours[1].openToPM}</Text>
                        <Text style={[styles.hourContainer__hour, this.state.currentDay.day === "wednesday" ? styles.hourContainer__dayCurrent : null]}>{this.state.contentPanel.openHours[2].openFromAM !== "" && this.state.contentPanel.openHours[2].openFromAM !== undefined ? this.state.contentPanel.openHours[2].openFromAM + " - " + this.state.contentPanel.openHours[2].openToAM : "Closed"}{this.state.contentPanel.openHours[2].openFromPM ? ' / ' : ''} {this.state.contentPanel.openHours[2].openFromPM}{this.state.contentPanel.openHours[2].openToPM ? ' - ' : ''}{this.state.contentPanel.openHours[2].openToPM}</Text>
                        <Text style={[styles.hourContainer__hour, this.state.currentDay.day === "thursday" ? styles.hourContainer__dayCurrent : null]}>{this.state.contentPanel.openHours[3].openFromAM !== "" && this.state.contentPanel.openHours[3].openFromAM !== undefined ? this.state.contentPanel.openHours[3].openFromAM + " - " + this.state.contentPanel.openHours[3].openToAM : "Closed"}{this.state.contentPanel.openHours[3].openFromPM ? ' / ' : ''} {this.state.contentPanel.openHours[3].openFromPM}{this.state.contentPanel.openHours[3].openToPM ? ' - ' : ''}{this.state.contentPanel.openHours[3].openToPM}</Text>
                        <Text style={[styles.hourContainer__hour, this.state.currentDay.day === "friday" ? styles.hourContainer__dayCurrent : null]}>{this.state.contentPanel.openHours[4].openFromAM !== "" && this.state.contentPanel.openHours[4].openFromAM !== undefined ? this.state.contentPanel.openHours[4].openFromAM + " - " + this.state.contentPanel.openHours[4].openToAM : "Closed"}{this.state.contentPanel.openHours[4].openFromPM ? ' / ' : ''} {this.state.contentPanel.openHours[4].openFromPM}{this.state.contentPanel.openHours[4].openToPM ? ' - ' : ''}{this.state.contentPanel.openHours[4].openToPM}</Text>
                        <Text style={[styles.hourContainer__hour, this.state.currentDay.day === "saturday" ? styles.hourContainer__dayCurrent : null]}>{this.state.contentPanel.openHours[5].openFromAM !== "" && this.state.contentPanel.openHours[5].openFromAM !== undefined ? this.state.contentPanel.openHours[5].openFromAM + " - " + this.state.contentPanel.openHours[5].openToAM : "Closed"}{this.state.contentPanel.openHours[5].openFromPM ? ' / ' : ''} {this.state.contentPanel.openHours[5].openFromPM}{this.state.contentPanel.openHours[5].openToPM ? ' - ' : ''}{this.state.contentPanel.openHours[5].openToPM}</Text>
                        <Text style={[styles.hourContainer__hour, this.state.currentDay.day === "sunday" ? styles.hourContainer__dayCurrent : null]}>{this.state.contentPanel.openHours[6].openFromAM !== "" && this.state.contentPanel.openHours[6].openFromAM !== undefined ? this.state.contentPanel.openHours[6].openFromAM + " - " + this.state.contentPanel.openHours[6].openToAM : "Closed"}{this.state.contentPanel.openHours[6].openFromPM ? ' / ' : ''} {this.state.contentPanel.openHours[6].openFromPM}{this.state.contentPanel.openHours[6].openToPM ? ' - ' : ''}{this.state.contentPanel.openHours[6].openToPM}</Text>
                      </View>
                    </View>
                  </View>
                 <View style={styles.panelBorder}></View>
                  <View style={styles.panelButtonBar}>
                    <TouchableHighlight style={styles.panelButtonofBar} underlayColor="#FFF" onPress={this.openTelApp.bind(this)} >
                      <View style={styles.panelButtonofBar__container}>
                        <Feather name="phone" size={24} color="black" />
                        <Text style={styles.panelButtonofBar__text}>Call</Text>
                      </View>
                    </TouchableHighlight>
                    <TouchableHighlight style={styles.panelButtonofBar} underlayColor="#FFF" onPress={this.openMapApp.bind(this)} >
                      <View style={styles.panelButtonofBar__container}>
                        <Feather name="compass" size={24} color="black" />
                        <Text style={styles.panelButtonofBar__text}>Navigation</Text>
                      </View>
                    </TouchableHighlight>
                    <TouchableHighlight style={styles.panelButtonofBar} underlayColor="#FFF" onPress={this.openMailApp.bind(this)} >
                      <View style={styles.panelButtonofBar__container}>
                        <Feather name="mail" size={24} color="black" />
                        <Text style={styles.panelButtonofBar__text}>Email</Text>
                      </View>
                    </TouchableHighlight>
                    <TouchableHighlight style={styles.panelButtonofBar} underlayColor="#FFF" onPress={this.openWebApp.bind(this)} >
                      <View style={styles.panelButtonofBar__container}>
                        <Feather name="external-link" size={24} color="black" />
                        <Text style={styles.panelButtonofBar__text}>Website</Text>
                      </View>
                    </TouchableHighlight>
                  </View>
                </View>
                :
                null

            )}
        </SlidingUpPanel>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
  },
  mapContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  logoBottom: {
    position: 'absolute',
    bottom: 40,
    left: 12,
    width: 110,
  },
  centerMapBtn_container: {
    position: 'absolute',
    top: 52,
    right: 8,
  },
  centerMapBtn: {
    width: 45,
    height: 45,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E3E2E0',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
  panelScroll: {
    width: '100%',
    height: '100%',
  },
  panelContent: {
    display: 'flex',
    backgroundColor: '#FFFF',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 6,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  panelHeaderBorderContainer: {
    width: '100%',
    height: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7
  },
  panelHeaderBorder: {
    height: 5,
    backgroundColor: '#C4C3BF',
    width: 35,
    borderRadius: 2.5
  },
  panelTitle: {
    fontSize: 20,
    color: "#000",
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: 'sf-pro-display',
    letterSpacing: 0.35,
    lineHeight: 26,
    width: width - 16 - 16
  },
  panelTitleAndroid: {
    fontSize: 20,
    color: "#000",
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: 'sf-pro-display',
    letterSpacing: 0.35,
    lineHeight: 26,
  },
  panelDescrib: {
    fontSize: 14,
    color: "#000",
    marginBottom: 12,
    lineHeight: 18,
  },
  panelHour: {
    fontSize: 14,
    fontWeight: 'bold',
    color: "#4FD262",
  },
  time: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  hoursDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    marginRight: 8
  },
  hourDot_open: {
    backgroundColor: "#4FD262",
  },
  hourDot_close: {
    backgroundColor: "#F63838",
  },
  hourDot_soon: {
    backgroundColor: "#FFC731",
  },
  hour_open: {
    color: "#4FD262",
  },
  hour_close: {
    color: "#FF5A45",
  },
  hour_soon: {
    color: "#FEDB52",
  },
  hourContainer__dayCurrent: {
    fontWeight: 'bold',
  },
  panelDistance: {
    fontSize: 13,
    fontWeight: 'bold',
    color: "#000000",
    marginBottom: 14,
  },
  panelBorder: {
    width: "100%",
    height: 1,
    backgroundColor: "#ececec",
  },
  panelSectionCenter: {
    marginTop: 20,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  panelsectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 9
  },
  panelTxt: {
    fontSize: 17,
    color: "#000000"
  },
  panelSectionRow: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelButtonBar: {
    width: width,
    marginLeft: -16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 21,
    paddingBottom: 21,
    paddingLeft: 16,
    paddingRight: 16,
  },
  panelButtonofBar: {
    width: '25%',
  },
  panelButtonofBar__text: {
    fontSize: 11,
    color: "#021A3E",
    paddingTop: 9,
    fontWeight: '600',
    letterSpacing: 0.07,
  },
  panelButtonofBar__container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  dayContainer: {
    marginRight: 40,
  },
  hourContainer__day: {
    fontSize: 12,
    marginBottom: 14,
    fontWeight: "600",
    letterSpacing: -0.29,
  },
  hourContainer__hour: {
    color: '#000',
    fontSize: 12,
    marginBottom: 14,
    letterSpacing: -0.29,
  },
  panelHourSection: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 14,
  },
  panelHourSection__title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: -0.22,
  },
  loaderContainer: {
    backgroundColor: '#FFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
