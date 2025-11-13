import React, { useRef, useState } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native'

const { width } = Dimensions.get('window')

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
  const flatListRef = useRef<FlatList>(null)

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 })
    } else {
      navigation.replace('NIM')
    }
  }

  const handleSkip = () => {
    navigation.replace('NIM')
  }

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* FlatList of slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width)
          setCurrentIndex(index)
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Image source={item.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
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

      {/* Next button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextText}>Next</Text>
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
    top: 60,
    right: 25,
    zIndex: 2,
  },
  skipText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
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
  nextButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 10,
    marginHorizontal: 30,
    marginBottom: 30,
  },
  nextText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
})
