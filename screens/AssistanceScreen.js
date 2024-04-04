import React from 'react';
import {
  StyleSheet,
  Text,
  Dimensions,
  SafeAreaView,
  TouchableHighlight,
  View,
} from 'react-native';
import Communications from 'react-native-communications';
import Svg,{Path} from 'react-native-svg';
const { width } = Dimensions.get('window');

export default class AssistanceScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };


  render() {
    return (
      <SafeAreaView style={styles.safeAreaStyle}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.mainTitle}>
              Alltrucks Assistance
            </Text>
          </View>
            <TouchableHighlight style={styles.btnAssistance} underlayColor="#FFF" underlayColor="transparent" onPress={this.openTelAssistance.bind(this)} >
              <View style={styles.btnContainer} >
                <Svg width={55} height={63}>
                  <Path
                    d="M18.757 23.491l-5.23-.52a29.963 29.963 0 0 0 0 17.57l5.23-.52c1.78-.17 3.476.86 4.142 2.506l3.935 9.809a4.02 4.02 0 0 1-1.61 4.904l-7.871 4.905a4.013 4.013 0 0 1-4.977-.57c-16.493-16.456-16.53-43.145 0-59.638a4.013 4.013 0 0 1 4.977-.57l7.87 4.905a4.016 4.016 0 0 1 1.611 4.904L22.9 20.985a4.034 4.034 0 0 1-4.142 2.506zm-7.883 21.204c-3.342-9.203-3.475-16.323 0-25.902l8.283.823a.132.132 0 0 0 .145-.084l3.936-9.809a.14.14 0 0 0-.06-.17L15.305 4.65a.147.147 0 0 0-.181.025C.133 19.629.12 43.859 15.125 58.814c.048.049.12.061.181.025l7.871-4.905a.14.14 0 0 0 .06-.17l-3.935-9.808a.132.132 0 0 0-.145-.085l-8.283.824zM35.384 12c.69-.654 1.792-.497 2.264.29a7.785 7.785 0 0 1 0 7.884 1.455 1.455 0 0 1-2.264.314l-.727-.69a1.47 1.47 0 0 1-.279-1.744 3.905 3.905 0 0 0 0-3.62 1.47 1.47 0 0 1 .279-1.744l.727-.69zm7.846-5.292c4.372 5.619 4.372 13.478 0 19.072a1.474 1.474 0 0 1-2.167.158l-.703-.679a1.45 1.45 0 0 1-.157-1.925 11.647 11.647 0 0 0 0-14.18 1.45 1.45 0 0 1 .157-1.925l.703-.678a1.464 1.464 0 0 1 2.167.157zm5.559-5.437c7.277 8.658 7.29 21.288 0 29.983a1.47 1.47 0 0 1-2.132.109l-.702-.679a1.473 1.473 0 0 1-.11-1.986c6.007-7.205 6.02-17.667 0-24.872a1.448 1.448 0 0 1 .11-1.986l.702-.678a1.469 1.469 0 0 1 2.132.109z"
                    fill="#000"
                    fillRule="nonzero"
                  />
                </Svg>
                <Text style={styles.btnLabel}>
                  Call Assistance
                </Text>
              </View>
            </TouchableHighlight>
            <Text style={styles.secondaryTitle}>
              Alltrucks assistance 24/7
            </Text>
            <View style={styles.list}>
              <Text style={styles.listLabel}>
                Available for you
              </Text>
              <View style={styles.listItem}>
                <Svg width={12} height={9} style={styles.listImage}>
                  <Path
                    d="M10.215.456c.11-.11.288-.11.398 0l.663.663c.11.11.11.288 0 .398L4.249 8.544a.281.281 0 0 1-.398 0L.724 5.417a.281.281 0 0 1 0-.398l.663-.663c.11-.11.288-.11.398 0L4.05 6.621 10.215.456z"
                    fill="#01B5E2"
                    fillRule="nonzero"
                  />
                </Svg>
                <Text style={styles.listContent}>
                  24 hours per day, 7 days a week, 365 days a year
                </Text>
              </View>
              <View style={styles.listItem}>
                <Svg width={12} height={9} style={styles.listImage}>
                  <Path
                    d="M10.215.456c.11-.11.288-.11.398 0l.663.663c.11.11.11.288 0 .398L4.249 8.544a.281.281 0 0 1-.398 0L.724 5.417a.281.281 0 0 1 0-.398l.663-.663c.11-.11.288-.11.398 0L4.05 6.621 10.215.456z"
                    fill="#01B5E2"
                    fillRule="nonzero"
                  />
                </Svg>
                <Text style={styles.listContent}>
                  European wide
                </Text>
              </View>
              <View style={styles.listItem}>
                <Svg width={12} height={9} style={styles.listImage}>
                  <Path
                    d="M10.215.456c.11-.11.288-.11.398 0l.663.663c.11.11.11.288 0 .398L4.249 8.544a.281.281 0 0 1-.398 0L.724 5.417a.281.281 0 0 1 0-.398l.663-.663c.11-.11.288-.11.398 0L4.05 6.621 10.215.456z"
                    fill="#01B5E2"
                    fillRule="nonzero"
                  />
                </Svg>
                <Text style={styles.listContent}>
                  For Trucks and Trailers
                </Text>
              </View>
              <View style={styles.listItem}>
                <Svg width={12} height={9} style={styles.listImage}>
                  <Path
                    d="M10.215.456c.11-.11.288-.11.398 0l.663.663c.11.11.11.288 0 .398L4.249 8.544a.281.281 0 0 1-.398 0L.724 5.417a.281.281 0 0 1 0-.398l.663-.663c.11-.11.288-.11.398 0L4.05 6.621 10.215.456z"
                    fill="#01B5E2"
                    fillRule="nonzero"
                  />
                </Svg>
                <Text style={styles.listContent}>
                  Towing & Repair Services
                </Text>
              </View>
              <View style={styles.listItem}>
                <Svg width={12} height={9} style={styles.listImage}>
                  <Path
                    d="M10.215.456c.11-.11.288-.11.398 0l.663.663c.11.11.11.288 0 .398L4.249 8.544a.281.281 0 0 1-.398 0L.724 5.417a.281.281 0 0 1 0-.398l.663-.663c.11-.11.288-.11.398 0L4.05 6.621 10.215.456z"
                    fill="#01B5E2"
                    fillRule="nonzero"
                  />
                </Svg>
                <Text style={styles.listContent}>
                  Payment details organization on request
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
    );
  }

  openTelAssistance() {
    Communications.phonecall('0080046835033', true)
  }
  
}

let fontSizeTitle = 35,
    buttonWidth = 130,
    btnLabelFont = 13,
    titleSecondary = 22,
    titleSecondaryMargin = 30,
    listContentFont = 13

if (width <= 320 ) {
  fontSizeTitle = 30
  buttonWidth = 120
  btnLabelFont = 12
  titleSecondary = 20
  titleSecondaryMargin = 30
  listContentFont = 12
}

const styles = StyleSheet.create({
  safeAreaStyle: {
    backgroundColor: '#F9F9F9',
  },
  container: {
    height: '100%',
    paddingTop: 65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    paddingLeft: 8,
    position: 'absolute',
    top: 0,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
    paddingBottom: 10,
    paddingTop: 20,
  },
  mainTitle: {
    fontSize: fontSizeTitle,
    color: '#000000',
    letterSpacing: -0.39,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  btnAssistance: {
    height: buttonWidth,
    width: buttonWidth,
    borderRadius: 20,
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  btnContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnLabel: {
    fontSize: btnLabelFont,
    color: '#021A3E',
    letterSpacing: 0.08,
    marginTop: 15,
    fontWeight: 'bold',
  },
  secondaryTitle: {
    marginTop: titleSecondaryMargin,
    fontSize: titleSecondary,
    color: '#000000',
    letterSpacing: 0.14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  list: {
    marginTop: 30,
  },
  listLabel: {
    fontSize: 16,
    color: '#000000',
    letterSpacing: 0.09,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  listItem: {
    display: 'flex',
    flexDirection: 'row',
    textAlign: 'left',
    alignItems: 'center',
    marginTop: 10,
  },
  listImage: {
    width: 13,
    resizeMode: "contain",
    marginRight: 10,
  },
  listContent: {
    fontSize: listContentFont,
    color: '#000000',
    letterSpacing: 0.08,
  }
});
