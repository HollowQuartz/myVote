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
import InfoScreen from '../screens/InfoScreen'

export type RootStackParamList = {
  Splash: undefined
  Onboarding: undefined
  NIM: undefined
  Home: { nim?: string }
  Success: undefined
  Results: undefined
  Profile?: { candidateId: string; nim?: string }
  Info: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

// Build linking config for web
const buildLinking = () => {
  if (typeof window === 'undefined') return undefined

  const origin = window.location.origin

  return {
    prefixes: [origin],
    config: {
      initialRouteName: 'Splash',
      screens: {
        Splash: '',
        Onboarding: 'onboarding',
        NIM: 'nim',
        Home: 'home',
        Results: 'results',
        Profile: 'profile/:candidateId',
        Success: 'success',
        Info: 'info',
      },
    },
  }
}

export default function AppNavigator() {
  const linking = buildLinking()

  return (
    <NavigationContainer
      {...(linking ? { linking } : {})}
      fallback={<SplashScreen />}

      // 👇 **FORCE STATIC WEB TAB TITLE**
      documentTitle={{
        enabled: true,
        formatter: () => 'My-Vote',
      }}
    >
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="NIM" component={NIMScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Success" component={SuccessScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Info" component={InfoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
