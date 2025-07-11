import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import MapScreen from '../screens/MapScreen';
import ListeScreen from '../screens/ListeScreen';
import AssistanceScreen from '../screens/AssistanceScreen';

import Svg, { Path } from 'react-native-svg';


const MapStack = createStackNavigator();
function MapStackNavigator() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen
        name="MapScreen"
        component={MapScreen}
        options={
          {
            tabBarIcon: ({ focused }) => (
              <Svg width={23} height={21}>
                <Path
                  d="M13.624 5.422a.938.938 0 1 1-1.876 0 .938.938 0 0 1 1.876 0zm..."
                  fill={focused ? "#01B5E2" : "#021A3E"}
                  fillRule="nonzero"
                />
              </Svg>
            ),
          }
        } />
    </MapStack.Navigator>
  );
}

const ListeStack = createStackNavigator();
function ListeStackNavigator() {
  return (
    <ListeStack.Navigator screenOptions={{ headerShown: false }}>
      <ListeStack.Screen
        name="ListScreen"
        component={ListeScreen}
        options={
          {
            tabBarIcon: ({ focused }) => (
              <Svg width={21} height={17}>
                <Path
                  d="M4.186 2.25a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0zM2.311 6.625a1.875 1.875 0 1 1 0 3.75 1.875 1.875 0 0 1 0-3.75zm..."
                  fill={focused ? "#01B5E2" : "#021A3E"}
                  fillRule="nonzero"
                />
              </Svg>
            ),
          }
        } />
    </ListeStack.Navigator>
  );
}

const AssistanceStack = createStackNavigator();
function AssistanceStackNavigator() {
  return (
    <AssistanceStack.Navigator screenOptions={{ headerShown: false }}>
      <AssistanceStack.Screen
        name="AssistanceScreen"
        component={AssistanceScreen}
        options={
          {
            tabBarIcon: ({ focused }) => (
              <Svg width={26} height={21}>
                <Path
                  d="M25.854 8.465c.172.3.07.68-.23.855l-4.801 2.793a2.189 2.189 0 0 1-1.45 1.422v..."
                  fill={focused ? "#01B5E2" : "#021A3E"}
                  fillRule="nonzero"
                />
              </Svg>
            ),
          }
        } />
    </AssistanceStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            let iconName;

            if (route.name === 'Map') {
              iconName = focused ? 'map' : 'map-outline';
            } else if (route.name === 'List') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'Assistance') {
              iconName = focused ? 'help-circle' : 'help-circle-outline';
            }

            return <Ionicons name={iconName} size={25} color={color} />;
          },
          headerShown: false,
          tabBarActiveTintColor: '#0BB3E0',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { height: 95 },
          tabBarItemStyle: { paddingBottom: 10, paddingTop: 10 },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '700',
          }
        })}
      >
        <Tab.Screen name="Map" component={MapStackNavigator} />
        <Tab.Screen name="List" component={ListeStackNavigator} />
        <Tab.Screen name="Assistance" component={AssistanceStackNavigator} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;