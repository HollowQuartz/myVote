// App.tsx
import React from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import AppNavigator from './src/navigation/AppNavigator'
import { UserProvider } from './src/contexts/UserContext'   // <-- IMPORTANT
import { isWeb } from './src/lib/platform'

const RootWrapper = (props: any) =>
  isWeb
    ? <>{props.children}</>
    : <GestureHandlerRootView style={{ flex: 1 }}>{props.children}</GestureHandlerRootView>

export default function App() {
  return (
    <RootWrapper>
      <SafeAreaProvider>
        {/* MUST wrap here */}
        <UserProvider>
          <AppNavigator />
        </UserProvider>
      </SafeAreaProvider>
    </RootWrapper>
  )
}
