// src/navigation/AppNavigator.tsx
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

// Build a valid linking config only when running in a browser
const buildLinking = () => {
  if (typeof window === 'undefined') return undefined

  const origin = window.location.origin
  return {
    prefixes: [origin],
    config: {
      // ensure the linking config uses Splash for root '/'
      // and Home is at '/home' (so visiting '/' goes to Splash)
      initialRouteName: 'Splash',
      screens: {
        Splash: '',                // root -> Splash
        Onboarding: 'onboarding',
        NIM: 'nim',
        Home: 'home',              // /home -> Home
        Results: 'results',
        Profile: 'profile/:candidateId',
        Success: 'success',
      },
    },
  }
}

export default function AppNavigator() {
  const linking = buildLinking()

  return (
    // only pass `linking` when it is defined (i.e. browser). This prevents validation errors
    // and avoids any runtime issues in non-browser environments.
    <NavigationContainer {...(linking ? { linking } : {})} fallback={<SplashScreen />}>
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
