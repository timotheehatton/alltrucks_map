import React from 'react';
import { Image, View } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import MapScreen from '../screens/MapScreen';
import ListeScreen from '../screens/ListeScreen';
import AssistanceScreen from '../screens/AssistanceScreen';

import Svg,{Path} from 'react-native-svg';

const MapStack = createStackNavigator({
  Map: MapScreen,
});

MapStack.navigationOptions = {
  tabBarLabel: 'Map',
  tabBarIcon: ({ tintColor, focused }) => (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center',}}>
      <Svg width={23} height={21}>
        <Path
          d="M13.624 5.422a.938.938 0 1 1-1.876 0 .938.938 0 0 1 1.876 0zm-.938 8.828a.688.688 0 0 1-.527-.238c-1.379-1.563-4.973-5.867-4.973-8.227C7.186 2.867 9.647.5 12.686.5c3.04 0 5.5 2.367 5.5 5.285 0 2.363-3.593 6.664-4.972 8.227a.688.688 0 0 1-.528.238zm0-11.875c-2 0-3.625 1.531-3.625 3.41 0 .836 1.243 3.09 3.625 5.961 2.383-2.871 3.625-5.125 3.625-5.96 0-1.88-1.625-3.411-3.625-3.411zm9.375 4.375c.332 0 .625.266.625.625v9.777c0 .512-.308.97-.785 1.16l-5.933 2.067a2.514 2.514 0 0 1-1.563-.008L7.686 18l-6.64 2.453a.624.624 0 0 1-.86-.578v-9.777c0-.512.313-.973.786-1.16L6.175 7.12c.164.555.402 1.137.714 1.738l-4.828 1.68v7.54l4.977-1.837.023-.008V9.195c.516.938 1.168 1.903 1.875 2.844v4.414l5 1.766v-3.18c.075-.062.149-.125.215-.2a47.489 47.489 0 0 0 1.66-1.984v5.594l5-1.738V9.17l-3.191 1.18c.547-.851 1.016-1.695 1.336-2.492l2.87-1.062a.627.627 0 0 1 .235-.047z"
          fill={focused ? "#01B5E2" : "#021A3E"}
          fillRule="nonzero"
        />
      </Svg>
    </View>
  ),
};

const ListeStack = createStackNavigator({
  Liste: ListeScreen,
});

ListeStack.navigationOptions = {
  tabBarLabel: 'List',
  tabBarIcon: ({ tintColor, focused }) => (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center',}}>
      <Svg width={21} height={17}>
        <Path
          d="M4.186 2.25a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0zM2.311 6.625a1.875 1.875 0 1 1 0 3.75 1.875 1.875 0 0 1 0-3.75zm0 6.25a1.875 1.875 0 1 1 0 3.75 1.875 1.875 0 0 1 0-3.75zm18.125-10c0 .259-.21.469-.468.469H5.905a.469.469 0 0 1-.469-.469v-1.25c0-.259.21-.469.47-.469h14.062c.258 0 .468.21.468.469v1.25zm0 6.25c0 .259-.21.469-.468.469H5.905a.469.469 0 0 1-.469-.469v-1.25c0-.259.21-.469.47-.469h14.062c.258 0 .468.21.468.469v1.25zm0 6.25c0 .259-.21.469-.468.469H5.905a.469.469 0 0 1-.469-.469v-1.25c0-.259.21-.469.47-.469h14.062c.258 0 .468.21.468.469v1.25z"
          fill={focused ? "#01B5E2" : "#021A3E"}
          fillRule="nonzero"
        />
      </Svg>
    </View>
  ),
};

const AssistanceStack = createStackNavigator({
  Assistance: AssistanceScreen,
});

AssistanceStack.navigationOptions = {
  tabBarLabel: 'Assistance',
  tabBarIcon: ({ tintColor, focused }) => (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center',}}>
      <Svg width={26} height={21}>
        <Path
          d="M25.854 8.465c.172.3.07.68-.23.855l-4.801 2.793a2.189 2.189 0 0 1-1.45 1.422v.559a2.973 2.973 0 0 1-2.136 2.843 3.14 3.14 0 0 1-3.023 2.313H9.69l-2.015 1.168a.626.626 0 0 1-.856-.23l-.312-.543a.626.626 0 0 1 .23-.856l2.453-1.418h5.024c.695 0 1.257-.562 1.257-1.258v-.937h.942c.598 0 1.086-.485 1.086-1.086v-2.344h1.25c.172 0 .312-.14.312-.312v-1.25a.313.313 0 0 0-.312-.313h-4.063v.625c0 1.832-1.578 3.3-3.449 3.11-1.629-.165-2.8-1.66-2.8-3.293V8.664L7.17 9.43c-.38.226-.61.636-.61 1.078v2.414l-4.375 2.527a.626.626 0 0 1-.855-.23l-.313-.543a.626.626 0 0 1 .23-.856l3.438-1.984v-1.332c0-1.102.578-2.121 1.52-2.688l2.32-1.39c.18-.797.66-1.5 1.375-1.945l1.309-.817A4.374 4.374 0 0 1 13.526 3h3.621L21.393.578c.301-.172.68-.066.852.235l.309.543c.171.3.066.68-.235.851l-4.68 2.664h-4.113c-.469 0-.926.129-1.324.379l-1.305.816a1.25 1.25 0 0 0-.586 1.059v3.371a1.251 1.251 0 0 0 2.5 0v-2.5h5.938c1.11 0 2.015.828 2.16 1.899l3.777-2.204c.301-.171.684-.07.856.23l.312.544z"
          fill={focused ? "#01B5E2" : "#021A3E"}
          fillRule="nonzero"
        />
      </Svg>
    </View>
  ),
};


export default createBottomTabNavigator(
  {
    MapStack,
    ListeStack,
    AssistanceStack,
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) =>
        getTabBarIcon(navigation, focused, tintColor),
    }),
    tabBarOptions: {
      activeTintColor: '#0BB3E0',
      inactiveTintColor: '#000',
      style: {
        backgroundColor: '#FFF',
        height: 75,
      },
      tabStyle: {
        paddingBottom: 10
      },
      labelStyle: {
        fontSize: 12,
        fontWeight: '700',
        paddingTop: 0,
        marginTop: -10,
      },
    },
  }
);
