import React from 'react';
import geolib from 'geolib';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  AsyncStorage,
  Platform,
  FlatList,
} from 'react-native';

import { API_URL } from '../Utile'
import axios from 'axios';

import { ListItem, SearchBar} from 'react-native-elements';
import 'moment';
import 'moment/locale/fr';
import Moment from 'moment';
import AppContext from '../context/AppContext'

import * as Location from 'expo-location';

const garageList = require('../assets/garage/list.json');

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
    garageList: this.context.mapBase,
    garageListOrder: this.context.mapBase,
    currentPosition: null,
    endOrder: false,
    alreadyGet: false,
    tempPosition: null,
    requestParams_count: 10,
    loading: false,
    requestParams_page: 0,
  };

  componentDidMount() {
    this._getCurrentDay()
  }

  componentWillMount() {
    Moment.locale('fr');
    this._getCurrentDay();
    this.retrieveLocation()
    const { navigation } = this.props;
    
    this.focusListener = navigation.addListener("didFocus", async () => {
      this.checkLocation()
      this._getCurrentDay()
      this.setState({loading: true})
      let newPos = await this.getNewLocation()
      // if(this.state.currentPosition !== null && newPos !== null) {
      //   if(this.state.currentPosition.latitude !== newPos.latitude || this.state.currentPosition.longitude !== newPos.longitude) {
      //     if(this.state.endOrder === true) {
      //       let temp = newPos
      //       this.setState({currentPosition: temp})
      //       this.callNewList(temp)
      //     }
      //   }
      //   else {
      //     this.setState({loading: false});
      //   }
      // }
      // else {
      //   this.setState({loading: false});
      // }

      this._getLocationAsync()
    });
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

    let location = await Location.getCurrentPositionAsync({accuracy: 3});
    this.callNewList(location.coords)
  };

  checkLocation = async () => {
    try {
      const value = await AsyncStorage.getItem('location');
      if (value !== null) {
        if(JSON.parse(value).latitude !== this.state.currentPosition.latitude || JSON.parse(value).longitude !== this.state.currentPosition.longitude) {
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
        this.setState({currentPosition: JSON.parse(value), endOrder: true});
      }
    } catch (error) {
    }
  }

loadJson(currentPosition, page) {
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
    page: page,
    count: requestParams_count,
    lat: currentPosition.latitude,
    long: currentPosition.longitude,
  }

  axios.get(`${API_URL}`, {
      params: paramsObj
    })
    .then(res => {
      let json = {}
      if(page === 1) {
        json = res.data.resultList
      } else {
        json = this.state.garageList.concat(res.data.resultList)
      }

      this.setState({
        garageList: json,
        garageListOrder: json,
        requestParams_page: page,
        loading: false
      })

    })
    .catch(err => {
        console.log('error', err)
    });

}

  callNewList(currentPosition) {
    let page = this.state.requestParams_page
    this.loadJson(currentPosition, page+1)
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
    this.setState({ search });
    let filter = search
    let renderListe = this.state.garageListOrder.filter((element) => {
      if(element.address.toLowerCase().includes(filter.toLowerCase()) || element.city.toLowerCase().includes(filter.toLowerCase()) || element.companyName.toLowerCase().includes(filter.toLowerCase()) || element.postalCode.toString().startsWith(filter.toLowerCase())) {
        return element
      }
    })
    this.setState({garageList: renderListe})
  };

  _getCurrentDay() {
    let date = new Date();
    let day = Moment().weekday()
    let hour = ("0" + date.getHours()).slice(-2);
    let minute = ("0" + date.getMinutes()).slice(-2);
    let dayArray = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

    this.state.currentDay.dayNumber = day
    this.state.currentDay.day = dayArray[day]

    this.state.currentDay.hour = hour+':'+minute
  }

  _getGarageHour(day) {
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

  isCloseToBottom({layoutMeasurement, contentOffset, contentSize}){
    return layoutMeasurement.height + contentOffset.y >= (contentSize.height - 20 - (height / 1.5));
  }

  renderListItem(item) {
    const marker = item
    return (
      <ListItem
        key={item.index}
        style={styles.ListItems}
        underlayColor={"transparent"}
        title={
          <Text style={styles.title}>
            {marker.companyName}
          </Text>
        }
        subtitle={
          <View>
            <Text style={styles.address}>
            {marker.address}, {marker.postalCode} {marker.city}
            </Text>
            <View style={styles.bottomContent}>
              {this._getGarageHour(marker.openHours)}
              <Text style={styles.distance}>
                {this.getDistance({latitude: this.state.currentPosition.latitude, longitude: this.state.currentPosition.longitude }, {latitude: marker.latitude, longitude: marker.longitude })} km
              </Text>
            </View>
          </View>
        }
        leftAvatar={
          <Image source={require('../assets/images/avatar.png')} style={styles.avatarImage}/>
        }
        leftAvatarStyle={{ height: 10 }}
        onPress={() => this.props.navigation.navigate('Map', {
          selectedMarker: marker
        })}
      />
    )
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
            <SearchBar
              placeholder="Search a workshop"
              onChangeText={this.updateSearch.bind(this)}
              value={search}
              lightTheme={true}
              containerStyle={{backgroundColor: '#F9F9F9', borderTopWidth: 0, borderBottomWidth: 0}}
              inputContainerStyle={{backgroundColor: '#EBEBEC', borderRadius: 10,}}
            />
          </View>
        </View>
        <View style={styles.listContainer}>
        {
          this.state.endOrder === true && this.state.loading === false ?
            <View style={styles.scrollViewContent} >
              <FlatList
                data={this.state.garageList}
                renderItem={({ item }) => this.renderListItem(item)}
                keyExtractor={item=>item.companyNo}
              />
            </View>
          :
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#021A3E" />
          </View>
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
    height: height - (130 + 75),
    backgroundColor: '#F9F9F9',
  },
  safeAreaStyleAndroid: {
    backgroundColor: '#F9F9F9',
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
  scrollView: {
    backgroundColor: '#fff'
  },
  scrollViewContent: {
    backgroundColor: '#fff'
  },
  listContainer: {
    backgroundColor: '#fff',
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
  }
});
