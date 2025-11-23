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
    description:
      'Aplikasi voting online untuk memilih calon presiden dan wakil presiden mahasiswa PJ.',
  },
  {
    id: '2',
    image: require('../../assets/onboard2.png'),
    title: 'Tetap Update',
    description:
      'Ikuti kampanye tiap-tiap kandidat untuk mengetahui visi dan misinya.',
  },
  {
    id: '3',
    image: require('../../assets/onboard3.png'),
    title: 'Buat Pilihanmu',
    description:
      'Pilih kandidat favoritmu dan ikuti perkembangannya secara langsung.',
  },
]

export default function OnboardingScreen({ navigation }: any) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList<any> | null>(null)
  const { width, height } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  const isDesktop = width >= 900

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true })
      // move focus for accessibility on web
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
    // Determine image sizing: desktop uses a max width box, mobile uses width * 0.8
    const imageBoxSize = isDesktop ? Math.min(560, width * 0.45) : width * 0.8
    return (
      <View style={[styles.slide, { width }]}>
        <View style={[styles.slideInner, isDesktop && styles.slideInnerDesktop]}>
          <Image
            source={item.image}
            style={[
              styles.image,
              { width: imageBoxSize, height: imageBoxSize },
            ]}
            resizeMode="contain"
          />
          <View style={[styles.textWrap, isDesktop && styles.textWrapDesktop]}>
            <Text style={[styles.title, isDesktop && styles.titleDesktop]}>{item.title}</Text>
            <Text style={[styles.description, isDesktop && styles.descriptionDesktop]}>
              {item.description}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Skip button (use safe area top offset). On desktop keep it spaced nicely */}
      <TouchableOpacity
        style={[
          styles.skipButton,
          { top: insets.top + (isDesktop ? 24 : 12), right: isDesktop ? 40 : 20 },
          isDesktop && styles.skipButtonDesktop,
        ]}
        onPress={handleSkip}
        accessibilityRole="button"
        accessibilityLabel="Lewati onboarding"
      >
        <Text style={[styles.skipText, isDesktop && styles.skipTextDesktop]}>Skip</Text>
      </TouchableOpacity>

      <View style={[styles.centerWrap, isDesktop && styles.centerWrapDesktop]}>
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
          // on web the FlatList content can be large; keep performance settings sensible
        />
      </View>

      {/* Pagination */}
      <View style={[styles.pagination, isDesktop && styles.paginationDesktop]}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentIndex === index && styles.activeDot,
              isDesktop && styles.dotDesktop,
              isDesktop && currentIndex === index && styles.activeDotDesktop,
            ]}
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

  // Centered container that keeps content readable on very wide screens
  centerWrap: {
    flex: 1,
  },
  centerWrapDesktop: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    maxWidth: 1200,
    alignSelf: 'center',
  },

  skipButton: {
    position: 'absolute',
    zIndex: 20,
  },
  skipButtonDesktop: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6F8',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  skipText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  skipTextDesktop: {
    fontSize: 15,
    fontWeight: '700',
  },

  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  slideInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideInnerDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },

  image: {
    // dimensions set dynamically in renderSlide
    borderRadius: 12,
    backgroundColor: '#F8FAFC', // subtle neutral bg
  },

  textWrap: {
    marginTop: 18,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  textWrapDesktop: {
    marginTop: 0,
    alignItems: 'flex-start',
    maxWidth: 560,
    paddingHorizontal: 0,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
  },
  titleDesktop: {
    fontSize: 28,
    textAlign: 'left',
  },

  description: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 10,
    fontSize: 15,
    paddingHorizontal: 30,
    lineHeight: 22,
  },
  descriptionDesktop: {
    textAlign: 'left',
    paddingHorizontal: 0,
    fontSize: 16,
    lineHeight: 24,
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 8,
  },
  paginationDesktop: {
    marginBottom: 24,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 6,
  },
  dotDesktop: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
  },
  activeDot: {
    backgroundColor: '#4F46E5',
    transform: [{ scale: 1.0 }],
  },
  activeDotDesktop: {
    backgroundColor: '#4F46E5',
    transform: [{ scale: 1.05 }],
    shadowColor: '#4F46E5',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

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
    marginBottom: 48,
    paddingVertical: 16,
  },

  nextText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  nextTextDesktop: {
    fontSize: 17,
    fontWeight: '700',
  },
})
