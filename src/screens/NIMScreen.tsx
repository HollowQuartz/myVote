// src/screens/NIMScreen.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useUser } from '../contexts/UserContext' // <- adjust path if your file is in ../contexts
import { isWeb } from '../lib/platform'

export default function NIMScreen() {
  const navigation = useNavigation<any>()
  const { nim: nimFromCtx, setNim } = useUser()

  // local input state, initialized from context if available
  const [nim, setNimLocal] = useState<string>(nimFromCtx ?? '')

  useEffect(() => {
    // keep local input synced if context nim changes externally
    if (nimFromCtx && nimFromCtx !== nim) {
      setNimLocal(nimFromCtx)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nimFromCtx])

  const handleContinue = () => {
    const trimmed = nim.trim()
    // Check NIM length (12 chars)
    if (trimmed.length !== 12) {
      Alert.alert('NIM tidak valid', 'NIM harus terdiri dari 12 karakter.')
      return
    }

    // Save NIM to global context
    setNim(trimmed)

    // Navigate to Home — context will provide the nim for Home
    navigation.navigate('Home')
  }

  const isValid = nim.trim().length === 12

  // Use KeyboardAvoidingView on native iOS, otherwise use a simple View on web/Android
  const Wrapper: any = isWeb ? View : KeyboardAvoidingView
  const wrapperProps = isWeb
    ? { style: styles.container }
    : { behavior: Platform.OS === 'ios' ? 'padding' : undefined, style: styles.container }

  return (
    <Wrapper {...wrapperProps}>
      <View style={styles.inner}>
        {/* Logo */}
        <Image source={require('../../assets/logo1.png')} style={styles.logo} />

        {/* Title */}
        <Text style={styles.title}>Selamat datang di myVote</Text>

        {/* Input field */}
        <View style={styles.inputWrapper}>
          <TextInput
            value={nim}
            onChangeText={setNimLocal}
            placeholder="Masukkan NIM Anda"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            maxLength={12}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={() => {
              if (isValid) handleContinue()
            }}
            // center input for web too
            textContentType="none"
            autoComplete="off"
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.button, isValid ? styles.buttonEnabled : styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>Masuk</Text>
        </TouchableOpacity>
      </View>
    </Wrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#4F46E5',
  },
  buttonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
})
