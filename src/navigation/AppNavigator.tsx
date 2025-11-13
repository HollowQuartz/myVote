import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import OnboardingScreen from '../screens/OnboardingScreen'
import NIMScreen from '../screens/NIMScreen'
import HomeScreen from '../screens/HomeScreen'
import SuccessScreen from '../screens/SuccessScreen'
import ResultsScreen from '../screens/ResultsScreen'
import SplashScreen from '../screens/SplashScreen'

export type RootStackParamList = {
  Splash: undefined
  Onboarding: undefined
  NIM: undefined
  Home: { nim?: string }   
  Success: undefined
  Results: undefined
  Profile?: { candidateId: string; nim?: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="NIM" component={NIMScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Success" component={SuccessScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
