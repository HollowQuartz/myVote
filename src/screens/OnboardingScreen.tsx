// src/screens/OnboardingScreen.tsx
import React, { useRef, useState } from 'react'
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
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  // breakpoint for desktop layout
  const isDesktop = width >= 800

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true })
      // accessibility: move focus to the next slide title on web
      if (Platform.OS === 'web') {
        AccessibilityInfo.setAccessibilityFocus && AccessibilityInfo.setAccessibilityFocus(0 as any)
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

  const renderSlide = ({ item }: { item: typeof slides[number] }) => {
    if (isDesktop) {
      // two-column layout
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

    // mobile layout (stacked)
    return (
      <View style={[styles.slide, { width }]}>
        <Image
          source={item.image}
          style={[styles.image, { width: width * 0.8, height: width * 0.8 }]}
          resizeMode="contain"
          accessible
          accessibilityLabel={item.title}
        />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Skip button (use safe area top offset) */}
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 12 }]}
        onPress={handleSkip}
        accessibilityRole="button"
        accessibilityLabel="Lewati onboarding"
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
      <View style={[styles.pagination, isDesktop && styles.paginationDesktop]}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
            accessibilityElementsHidden={currentIndex !== index}
            importantForAccessibility={currentIndex === index ? 'yes' : 'no'}
          />
        ))}
      </View>

      {/* Next button */}
      <TouchableOpacity
        style={[styles.nextButton, isDesktop && styles.nextButtonDesktop]}
        onPress={handleNext}
        accessibilityRole="button"
        accessibilityLabel="Lanjut"
      >
        <Text style={[styles.nextText, isDesktop && styles.nextTextDesktop]}>
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
    right: 25,
    zIndex: 2,
  },
  skipText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },

  /* Mobile slide */
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    // width/height set dynamically in render to use current width
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
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

  /* Desktop slide */
  desktopSlideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  desktopInner: {
    width: '92%',
    maxWidth: 1100,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 28,
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)', // works on web via react-native-web
  },
  imageWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 20,
  },
  desktopImage: {
    width: '100%',
    maxWidth: 520,
    maxHeight: 520,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  textWrapper: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  desktopTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  desktopDescription: {
    fontSize: 18,
    color: '#6B7280',
    lineHeight: 26,
  },

  /* pagination */
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  paginationDesktop: {
    marginTop: 18,
    marginBottom: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#4F46E5',
  },

  /* Next button */
  nextButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 30,
    marginBottom: 30,
  },
  nextButtonDesktop: {
    width: 260,
    alignSelf: 'center',
    marginBottom: 40,
  },
  nextText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  nextTextDesktop: {
    fontSize: 18,
    fontWeight: '700',
  },
})
