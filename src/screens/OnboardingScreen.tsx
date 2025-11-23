// src/screens/OnboardingScreen.tsx
import React, { useRef, useState, useCallback } from 'react'
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
  ViewToken,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

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
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 })
  const insets = useSafeAreaInsets()
  const { width, height } = useWindowDimensions()

  // dynamic sizes
  const imageSize = Math.min(width * 0.78, height * 0.42) // keep image reasonably sized on tall & wide screens
  const dotSize = Math.max(6, Math.round(width * 0.018))
  const paginationGap = Math.max(6, Math.round(width * 0.015))
  const bottomButtonHorizontal = Math.max(20, Math.round(width * 0.07))

  // viewable change handler (more reliable than scroll math)
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems && viewableItems.length > 0) {
        const index = viewableItems[0].index ?? 0
        setCurrentIndex(index)
        // set accessibility focus to the title of the new slide (web)
        if (Platform.OS === 'web') {
          // try focusing the first focusable element (best-effort)
          AccessibilityInfo.setAccessibilityFocus && AccessibilityInfo.setAccessibilityFocus(0 as any)
        }
      }
    }
  )

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true })
    } else {
      navigation.replace('NIM')
    }
  }

  const handleSkip = () => {
    navigation.replace('NIM')
  }

  const renderSlide = useCallback(
    ({ item }: { item: typeof slides[number] }) => (
      <View style={[styles.slide, { width, paddingHorizontal: Math.max(18, width * 0.06) }]}>
        <Image
          source={item.image}
          style={[
            styles.image,
            {
              width: imageSize,
              height: imageSize,
              maxWidth: '100%',
            },
          ]}
          resizeMode="contain"
          accessible
          accessibilityLabel={item.title}
        />
        <Text style={[styles.title, { fontSize: Math.max(18, Math.round(width * 0.05)) }]}>
          {item.title}
        </Text>
        <Text
          style={[
            styles.description,
            { fontSize: Math.max(13, Math.round(width * 0.036)), paddingHorizontal: Math.max(8, width * 0.03) },
          ]}
        >
          {item.description}
        </Text>
      </View>
    ),
    [width, imageSize]
  )

  return (
    <SafeAreaView style={styles.safe}>
      {/* Skip button */}
      <TouchableOpacity
        style={[
          styles.skipButton,
          { top: insets.top + 12, right: Math.max(14, width * 0.04) },
        ]}
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
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        initialNumToRender={1}
        windowSize={2}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        style={{ flex: 1 }}
      />

      {/* Pagination */}
      <View style={[styles.pagination, { gap: paginationGap }]}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                width: currentIndex === index ? dotSize * 2.2 : dotSize,
                height: dotSize,
                borderRadius: dotSize,
                backgroundColor: currentIndex === index ? '#4F46E5' : '#D1D5DB',
              },
            ]}
            accessibilityElementsHidden={currentIndex !== index}
            importantForAccessibility={currentIndex === index ? 'yes' : 'no'}
            accessible={false}
          />
        ))}
      </View>

      {/* Next / Start button (sticky bottom) */}
      <View style={{ paddingBottom: Math.max(insets.bottom, 12), paddingHorizontal: bottomButtonHorizontal }}>
        <TouchableOpacity
          style={[styles.nextButton, { opacity: 1 }]}
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={currentIndex < slides.length - 1 ? 'Lanjut' : 'Mulai'}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>{currentIndex < slides.length - 1 ? 'Next' : 'Mulai'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  skipButton: {
    position: 'absolute',
    zIndex: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  skipText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    marginBottom: 18,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
    color: '#111827',
  },
  description: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 10,
    lineHeight: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  dot: {
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
})
