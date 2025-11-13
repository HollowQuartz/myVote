// App.tsx
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import AppNavigator from './src/navigation/AppNavigator'
import { UserProvider } from './src/contexts/UserContext'

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <AppNavigator />
      </UserProvider>
    </GestureHandlerRootView>
  )
}
