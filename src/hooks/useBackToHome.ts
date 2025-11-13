// src/hooks/useBackToHome.ts
import { useEffect, useCallback } from 'react'
import { BackHandler } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import type { NavigationProp } from '@react-navigation/native'
import type { RootStackParamList } from '../navigation/AppNavigator'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

type Nav = NativeStackNavigationProp<RootStackParamList, keyof RootStackParamList> | NavigationProp<any>

/**
 * When used on a screen, intercepts hardware back & navigation "beforeRemove"
 * and routes to 'Home' instead of popping normally.
 *
 * Usage: call useBackToHome(navigation) inside a screen component.
 */
export default function useBackToHome(navigation: Nav) {
  // Android hardware back button
  useEffect(() => {
    const onHardwareBack = () => {
      // If not already on Home, navigate to Home and consume the event
      // Return true to indicate we've handled it.
      try {
        // You can also guard: if navigation.canGoBack() then ... but we want Home
        navigation.navigate('Home' as any)
        return true
      } catch (e) {
        return false
      }
    }

    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack)
    return () => sub.remove()
  }, [navigation])

  // Navigation "back" events (swipe back, header back button, back action)
  useFocusEffect(
    useCallback(() => {
      const beforeRemove = (e: any) => {
        // Prevent the default behavior (pop)
        e.preventDefault()
        // Navigate to Home instead
        navigation.navigate('Home' as any)
      }

      const unsubscribe = navigation.addListener('beforeRemove', beforeRemove)

      return () => {
        try {
          unsubscribe()
        } catch {}
      }
    }, [navigation])
  )
}
