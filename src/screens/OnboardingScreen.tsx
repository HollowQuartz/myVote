import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  AccessibilityInfo,
  Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const slides = [
  {
    id: '1',
    image: require('../../assets/onboard1.png'),
    title: 'Selamat datang di myVote',
    description: 'Aplikasi voting online untuk memilih calon presiden dan wakil presiden mahasiswa PJ.',
  },
  {
    id: '2',
    image: require('../../assets/onboard2.png'),
    title: 'Tetap Update',
    description: 'Ikuti kampanye tiap-tiap kandidat untuk mengetahui visi dan misinya.',
  },
  {
    id: '3',
    image: require('../../assets/onboard3.png'),
    title: 'Buat Pilihanmu',
    description: 'Pilih kandidat favoritmu dan ikuti perkembangannya secara langsung.',
  },
]

export default function OnboardingScreenDesktop({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      })

      if (Platform.OS === 'web') {
        AccessibilityInfo.setAccessibilityFocus &&
          AccessibilityInfo.setAccessibilityFocus(0 as any)
      }
    } else {
      navigation.replace('NIM')
    }
  }

  const handleSkip = () => navigation.replace('NIM')

  const onScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setCurrentIndex(index)
  }

  const renderSlide = ({ item }: any) => {
    return (
      <View style={[styles.desktopSlideContainer, { width }]}>
        <View style={styles.desktopInner}>
          <View style={styles.imageWrapper}>
            <Image
              source={item.image}
              style={styles.desktopImage}
              resizeMode="contain"
              accessible
              accessibilityLabel={item.title}
            />
          </View>

          <View style={styles.textWrapper}>
            <Text style={styles.desktopTitle}>{item.title}</Text>
            <Text style={styles.desktopDescription}>{item.description}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 12 }]}
        onPress={handleSkip}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextText}>
          {currentIndex < slides.length - 1 ? 'Next' : 'Mulai'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },

  skipButton: {
    position: 'absolute',
    right: 30,
    zIndex: 99,
  },
  skipText: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '600',
  },

  desktopSlideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  desktopInner: {
    width: '90%',
    maxWidth: 1200,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 34,
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
  },

  imageWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  desktopImage: {
    width: '100%',
    maxWidth: 500,
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },

  textWrapper: {
    flex: 1,
    paddingLeft: 30,
  },
  desktopTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  desktopDescription: {
    fontSize: 20,
    color: '#6B7280',
    lineHeight: 28,
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#4F46E5',
  },

  nextButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    width: 260,
    alignSelf: 'center',
    marginBottom: 40,
  },
  nextText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
})
