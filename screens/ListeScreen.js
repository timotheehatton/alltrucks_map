import React from 'react';
import geolib from 'geolib';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  FlatList,
  TextInput,
} from 'react-native';

import { API_URL } from '../Utile'
import axios from 'axios';
import { ListItem, Avatar } from 'react-native-elements';
import 'moment';
import 'moment/locale/fr';
import Moment from 'moment';
import AppContext from '../context/AppContext'
import AsyncStorage from '@react-native-async-storage/async-storage';


import * as Location from 'expo-location';

const { height, width } = Dimensions.get('window');


export default class ListeScreen extends React.Component {
  static contextType = AppContext;
  static navigationOptions = {
    header: null,
  };

  state = {
    currentDay: {
      day: null,
      hour: null,
    },
    search: '',
    garageListBase: [],
    garageList: [],
    garageListOrder: [],
    currentPosition: null,
    endOrder: false,
    alreadyGet: false,
    tempPosition: null,
    requestParams_count: 10,
    loading: false,
    requestParams_page: 0,
    hasScrolled: false,
    waitForData: false,
    startScroll: false,
    
  };

  componentDidMount() {
    Moment.locale('fr');
    this._getCurrentDay();
    this.retrieveLocation();
    this.focusListener = this.props.navigation.addListener('focus', this.handleFocus);
  }

  componentWillUnmount() {
    this.focusListener();
  }

  handleFocus = async () => {
    this.checkLocation();
    this._getCurrentDay();
    this.setState({
      loading: true,
      requestParams_page: 0,
      startScroll: false,
      waitForData: false,
      search: ''
    });

    let newPos = await this.getNewLocation();
    if (this.state.currentPosition && newPos) {
      if (this.state.currentPosition.latitude !== newPos.latitude || this.state.currentPosition.longitude !== newPos.longitude) {
        if (this.state.endOrder) {
          this.setState({ currentPosition: newPos }, () => {
            this.callList(newPos);
          });
        }
      } else {
        this.setState({ loading: false });
      }
    } else {
      this.setState({ loading: false });
    }

    this._getLocationAsync();
  }

  _getLocationAsync = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permission to access location was denied',
      });
    } else {
      this.setState({ hasLocationPermissions: true });
    }

    let location = await Location.getCurrentPositionAsync({ accuracy: 3 });
    this.callList(location.coords)
  };

  checkLocation = async () => {
    try {
      const value = await AsyncStorage.getItem('location');
      if (value !== null) {
        if (
          JSON.parse(value).latitude !== this.state.currentPosition.latitude
          || JSON.parse(value).longitude !== this.state.currentPosition.longitude
        ) {
          this.setState({tempPosition: JSON.parse(value)});
        }
      }
    } catch (error) {
    }
  }

  getNewLocation = async () => {
    try {
      const value = await AsyncStorage.getItem('location');
      if (value !== null) {
        return JSON.parse(value)
      }
    } catch (error) {
    }
  }

  retrieveLocation = async () => {
    try {
      const value = await AsyncStorage.getItem('location');
      if (value !== null) {
        this.setState(
          {
            currentPosition: JSON.parse(value),
            endOrder: true
          }
        );
      }
    } catch (error) {
      console.log('error catching value', error);
    }
  }

  loadGarageList = (currentPosition, page) => {
    // With the new API, we get all data from context, no need to fetch again
    const { mapBase } = this.context;
    
    if (mapBase && mapBase.length > 0) {
      // Calculate distances for all workshops
      const workshopsWithDistance = mapBase.map(workshop => ({
        ...workshop,
        distance: this.getDistance(
          { latitude: currentPosition.latitude, longitude: currentPosition.longitude },
          { latitude: workshop.latitude, longitude: workshop.longitude }
        )
      }));

      // Sort by distance
      const sortedWorkshops = workshopsWithDistance.sort((a, b) => a.distance - b.distance);

      this.setState({
        garageList: sortedWorkshops,
        garageListOrder: sortedWorkshops,
        garageListBase: sortedWorkshops,
        loading: false,
        waitForData: false,
        endOrder: true
      });
    } else {
      this.setState({
        loading: false,
        waitForData: false
      });
    }
  }

  callList(currentPosition) {
    let page = this.state.requestParams_page
    this.loadGarageList(currentPosition, page+1)
  }

  getDistance(startCoord, endCoord) {
    let distanceMetre = geolib.getDistanceSimple(
      {latitude: startCoord.latitude, longitude: startCoord.longitude},
      {latitude: endCoord.latitude, longitude: endCoord.longitude}
    )

    let distanceKm = distanceMetre/1000
    return Math.round(distanceKm)
  }

  writeDistance() {
    this.state.garageList.forEach(element => {
      element.distance = this.getDistance({latitude: this.state.currentPosition.latitude, longitude: this.state.currentPosition.longitude }, {latitude: element.latitude, longitude: element.longitude })
    });
  }

  updateSearch = search => {
    this.setState({ search, requestParams_page: 0 });
    let filter = search
    if(search !== '') {
      let renderListe = this.state.garageListBase.filter((element) => {
        if(element.address.toLowerCase().includes(filter.toLowerCase()) || element.city.toLowerCase().includes(filter.toLowerCase()) || element.companyName.toLowerCase().includes(filter.toLowerCase()) || element.postalCode.toString().startsWith(filter.toLowerCase())) {
          return element
        }
      })
      this.setState({garageList: renderListe})
    } else {
      this._getLocationAsync()
    }
  };

  _getCurrentDay() {
    let date = new Date();
    let day = Moment().weekday()
    let hour = ("0" + date.getHours()).slice(-2);
    let minute = ("0" + date.getMinutes()).slice(-2);
    // API uses full day names starting with capital letter
    let dayArray = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]

    this.state.currentDay.dayNumber = day
    this.state.currentDay.day = dayArray[day]

    this.state.currentDay.hour = hour+':'+minute
  }

  _getGarageHour(day, companyNo) {
    // Check if opening hours data exists
    if (!day || !Array.isArray(day) || day.length === 0) {
      return null; // Return nothing if no opening hours data
    }

    this._getCurrentDay()
    let date = new Date();
    let statement = null
    let className = null
    let classNameDot = null

    // Find today's opening hours from the array
    const todayHours = day.find(h => h.day === this.state.currentDay.day);
    
    // Check if today's data exists
    if (!todayHours) {
      return null;
    }
    
    // Check if workshop has any opening hours at all
    const hasMorningHours = todayHours.openFromAM && todayHours.openToAM && 
                           todayHours.openFromAM !== "" && todayHours.openToAM !== "";
    const hasAfternoonHours = todayHours.openFromPM && todayHours.openToPM && 
                             todayHours.openFromPM !== "" && todayHours.openToPM !== "";
    
    if (!hasMorningHours && !hasAfternoonHours) {
      return null; // No opening hours at all
    }

    let currentTime = Moment(this.state.currentDay.hour, 'HH:mm')
    let isOpen = false;
    let closingSoon = false;
    
    // Check morning hours if available
    if (hasMorningHours) {
      let amOne = Moment(todayHours.openFromAM, 'HH:mm')
      let amTwo = Moment(todayHours.openToAM, 'HH:mm')
      
      if (amOne.isValid() && amTwo.isValid()) {
        if (currentTime >= amOne && currentTime <= amTwo) {
          isOpen = true;
          // Check if closing soon (within 1 hour)
          let amEnd = Moment(todayHours.openToAM, 'HH:mm')
          let soonAm = amEnd.subtract({'hours': 1})
          if (currentTime >= soonAm) {
            closingSoon = true;
          }
        }
      }
    }
    
    // Check afternoon hours if available
    if (hasAfternoonHours && !isOpen) {
      let pmOne = Moment(todayHours.openFromPM, 'HH:mm')
      let pmTwo = Moment(todayHours.openToPM, 'HH:mm')
      
      if (pmOne.isValid() && pmTwo.isValid()) {
        if (currentTime >= pmOne && currentTime <= pmTwo) {
          isOpen = true;
          // Check if closing soon (within 1 hour)
          let pmEnd = Moment(todayHours.openToPM, 'HH:mm')
          let soonPm = pmEnd.subtract({'hours': 1})
          if (currentTime >= soonPm) {
            closingSoon = true;
          }
        }
      }
    }

    // Set the status based on opening hours
    if (isOpen) {
      if (closingSoon) {
        statement = "Closed soon"
        className = styles.hour_soon
        classNameDot = styles.hourDot_soon
      } else {
        statement = "Currently open"
        className = styles.hour_open
        classNameDot = styles.hourDot_open
      }
    } else {
      statement = "Closed"
      className = styles.hour_close
      classNameDot = styles.hourDot_close
    }

    return (
      <View key={`hours-${companyNo}`} style={styles.time}>
        <View key="hours-dot" style={[styles.hoursDot, classNameDot]}></View>
        <Text key="hours-text" style={[styles.panelHour, className]}>
          {statement}
        </Text>
      </View>
    )
  }

  isCloseToBottom({layoutMeasurement, contentOffset, contentSize}){
    return layoutMeasurement.height + contentOffset.y >= (contentSize.height - 20 - (height / 1.5));
  }

  renderListItem = (item, index) => {
    return (
      <ListItem
        key={index.toString()}
        bottomDivider
        onPress={() => {
          this.props.navigation.navigate('MapScreen', { selectedMarker: item })
        }}
      >
        <Avatar source={require('../assets/images/avatar.png')} size="medium" style={styles.avatarImage} />
        <ListItem.Content>
          <ListItem.Title style={styles.title}>{item.companyName}</ListItem.Title>
          <ListItem.Subtitle style={styles.address}>
            {item.address}, {item.postalCode} {item.city}
          </ListItem.Subtitle>
          <View style={styles.bottomContent}>
            <Text key={`hours-info-${item.companyNo}`}>
              {this._getGarageHour(item.openHours, item.companyNo)}
            </Text>
            <Text key={`distance-${item.companyNo}`} style={styles.distance}>
              {this.getDistance({ latitude: this.state.currentPosition.latitude, longitude: this.state.currentPosition.longitude }, { latitude: item.latitude, longitude: item.longitude })} km
            </Text>
          </View>
        </ListItem.Content>
      </ListItem>
    );
  }

  handleLoadMore() {
    // With the new API, all data is loaded at once, no need for pagination
    return;
  }

  render() {
    const { search } = this.state;
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
      <SafeAreaView style={Platform.OS != "android" ? styles.safeAreaStyle : styles.safeAreaStyleAndroid}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Alltrucks Workshops</Text>
          <View style={styles.searchstyle}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search a workshop"
                onChangeText={this.updateSearch.bind(this)}
                value={search}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>
        <View style={styles.listContainer}>
        {
          this.state.endOrder === true && this.state.loading === false ?
            <View style={styles.scrollViewContent} >
              <FlatList
                data={this.state.garageList || []}
                renderItem={({ item, index }) => this.renderListItem(item, index)}
                keyExtractor={(item, index) => index.toString()}
                onEndReached={() => this.handleLoadMore()}
                onEndReachedThreshold={1.5}
                scrollEnabled={!this.state.waitForData}
                // bounce={false}
                // onScrollEndDrag={(e) => {
                //   if(e && e.nativeEvent && e.nativeEvent.contentSize && e.nativeEvent.layoutMeasurement ) {
                //     if(e.nativeEvent.targetContentOffset) {
                //       const calc = e.nativeEvent.layoutMeasurement.height + e.nativeEvent.targetContentOffset.y
                //       if(e.nativeEvent.contentSize.height <= calc + 5 && e.nativeEvent.contentSize.height >= calc - 5 ) {
                //         this.handleLoadMore()
                //       }
                //     } else if(e.nativeEvent.contentOffset) {
                //       const calc = e.nativeEvent.layoutMeasurement.height + e.nativeEvent.contentOffset.y
                //       if(e.nativeEvent.contentSize.height <= calc + 5 && e.nativeEvent.contentSize.height >= calc - 5 ) {
                //         this.handleLoadMore()
                //       }
                //     }
                //   }
                // }}
              />
            </View>
          :
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#021A3E" />
          </View>
        }
        {
          this.state.waitForData && (
          <View style={[styles.loaderDataContainer, { paddingBottom: 10 }]}>
            <ActivityIndicator size="small" color="#FFF" />
          </View>
          )
        }
        </View>
      </SafeAreaView>
    );
  }
}

let fontSizeTitle = 35
if (width <= 320 ) {
  fontSizeTitle = 30
}


const styles = StyleSheet.create({
  safeAreaStyle: {
    // height: height - (130 + 75),
    // height: height,
    flex:1,
    backgroundColor: '#F9F9F9',
    position: 'relative',
  },
  safeAreaStyleAndroid: {
    backgroundColor: '#F9F9F9',
    position: 'relative',
    flex:1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  header: {
    borderBottomWidth: 1,
    paddingTop: 20,
    borderBottomColor: '#EDEDED',
    backgroundColor: '#F9F9F9',

  },
  pageTitle: {
    fontSize: fontSizeTitle,
    color: '#000000',
    letterSpacing: -0.39,
    fontWeight: 'bold',
    textAlign: 'left',
    paddingLeft: 8,
  },
  searchstyle: {
    width: width,
    marginBottom: 10,
    marginTop: 6,
  },
  searchstyleBar: {
    backgroundColor: '#F9F9F9',
  },
  searchContainer: {
    backgroundColor: '#EBEBEC',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginHorizontal: 10,
  },
  searchInput: {
    height: 40,
    fontSize: 16,
    color: '#000',
  },
  scrollView: {
    backgroundColor: '#fff'
  },
  scrollViewContent: {
    backgroundColor: '#fff',
    // backgroundColor: 'red',
    flex: 1, 
    // height: height
  },
  listContainer: {
    backgroundColor: '#fff',
    flex: 1,
    // height: height
  },
  ListItems: {
    width: width,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 9,
    letterSpacing: -0.39,
  },
  bottomContent: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  avatarImage: {
    height: 30,
    width: 30,
  },
  distance: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    letterSpacing: -0.21,
  },
  address: {
    fontSize: 13,
    letterSpacing: 0.2,
    marginBottom: 10,
    lineHeight: 18,
  },
  time: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  hour: {
    fontSize: 12,
    fontWeight: '600'
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
    color: "#F63838",
  },
  hour_soon: {
    color: "#FFC731",
  },
  loaderContainer: {
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: height - (130 + 75),
  },
  loaderDataContainer: {
    backgroundColor: '#01B5E2',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // height: 40,
    minHeight: 'auto',
    position: 'absolute',
    bottom: 0,
    paddingTop: 10,
    left: 0,
    width: width
  }
});
