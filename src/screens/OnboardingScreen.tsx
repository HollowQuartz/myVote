import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Platform,
  AccessibilityInfo,
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

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList<any> | null>(null)
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  // Breakpoint for desktop layout
  const isDesktop = width >= 900

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true })

      if (Platform.OS === 'web') {
        AccessibilityInfo.setAccessibilityFocus?.(0 as any)
      }
    } else {
      navigation.replace('NIM')
    }
  }

  const handleSkip = () => {
    navigation.replace('NIM')
  }

  const onScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width)
    setCurrentIndex(index)
  }

  // Desktop keyboard support (← →)
  useEffect(() => {
    if (!isDesktop) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentIndex, isDesktop])

  // Renders slide for desktop or mobile
  const renderSlide = ({ item }: { item: typeof slides[number] }) => {
    if (isDesktop) {
      return (
        <View style={[styles.desktopSlide, { width }]}>
          <View style={styles.desktopInner}>
            <View style={styles.imageWrapper}>
              <Image
                source={item.image}
                style={styles.desktopImage}
                resizeMode="contain"
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

    // MOBILE layout
    return (
      <View style={[styles.slide, { width }]}>
        <Image
          source={item.image}
          style={[styles.mobileImage, { width: width * 0.8, height: width * 0.8 }]}
          resizeMode="contain"
        />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
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
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialNumToRender={1}
        windowSize={3}
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
      <TouchableOpacity
        style={[
          styles.nextButton,
          isDesktop && styles.nextButtonDesktop
        ]}
        onPress={handleNext}
      >
        <Text style={styles.nextText}>
          {currentIndex < slides.length - 1 ? 'Next' : 'Mulai'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },

  /** ------------------ MOBILE ------------------ **/
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  mobileImage: {},
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: '#111827',
  },
  description: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 10,
    fontSize: 15,
    paddingHorizontal: 30,
  },

  /** ------------------ DESKTOP ------------------ **/
  desktopSlide: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  desktopInner: {
    width: '92%',
    maxWidth: 1100,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    gap: 32,
  },
  imageWrapper: {
    flex: 1,
    maxWidth: 520,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopImage: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '60vh',
    aspectRatio: 1,
  },
  textWrapper: {
    flex: 1,
    paddingLeft: 28,
    minWidth: 320,
  },
  desktopTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  desktopDescription: {
    fontSize: 18,
    color: '#6B7280',
    lineHeight: 26,
  },

  /** ------------------ SHARED ELEMENTS ------------------ **/
  skipButton: { position: 'absolute', right: 25, zIndex: 2 },
  skipText: { color: '#4F46E5', fontSize: 16, fontWeight: '600' },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 5,
  },
  activeDot: { backgroundColor: '#4F46E5' },

  nextButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 30,
    marginBottom: 30,
  },

  nextButtonDesktop: {
    width: 320,
    alignSelf: 'center',
    borderRadius: 12,
  },

  nextText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
})
