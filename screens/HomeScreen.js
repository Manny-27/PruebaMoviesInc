import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bars3CenterLeftIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import TrendingMovies from '../components/trendingMovies';
import MovieList from '../components/movieList';
import { StatusBar } from 'expo-status-bar';
import { fetchTopRatedMovies, fetchTrendingMovies, fetchUpcomingMovies } from '../api/moviedb';
import { useNavigation } from '@react-navigation/native';
import Loading from '../components/loading';
import { styles } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions, FlatList, Image } from 'react-native';
import { fallbackMoviePoster, image185 } from '../api/moviedb';

const ios = Platform.OS === 'ios';
const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [trending, setTrending] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    getMoviesData();
    getFavorites();
    
    // Add a listener para refrescar la section de peliculas guardadas
    const unsubscribe = navigation.addListener('focus', () => {
      getFavorites();
    });
    
    return unsubscribe;
  }, [navigation]);

  const getFavorites = async () => {
    try {
      const favs = await AsyncStorage.getItem('favorites');
      const parsedFavs = favs ? JSON.parse(favs) : [];
      setFavorites(parsedFavs);
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const getMoviesData = async () => {
    try {
      const [trendingData, upcomingData, topRatedData] = await Promise.all([
        fetchTrendingMovies(),
        fetchUpcomingMovies(),
        fetchTopRatedMovies()
      ]);

      // Set trending movies separately
      if (trendingData?.results) setTrending(trendingData.results);

      // Combine upcoming + topRated
      const combined = [...(upcomingData?.results || [])];

      // Eliminar duplicados por id (opcional)
      const uniqueMoviesMap = {};
      combined.forEach(movie => {
        uniqueMoviesMap[movie.id] = movie;
      });
      const uniqueMovies = Object.values(uniqueMoviesMap);

      // Ordenar alfabéticamente por título
      const sorted = uniqueMovies.sort((a, b) => a.title.localeCompare(b.title));


      setAllMovies(sorted);
    } catch (error) {
      console.error("Error fetching movie data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Horizontal carousel for favorites
  const renderFavoriteItem = ({ item }) => {
    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('Movie', item)}
        className="mr-4"
      >
        <Image 
          source={{uri: image185(item.poster_path) || fallbackMoviePoster}}
          className="rounded-lg"
          style={{width: width * 0.28, height: height * 0.2}}
        />
        <Text className="text-neutral-300 ml-1 mt-1" numberOfLines={1}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#121212]">
      {/* search bar */}
      <SafeAreaView className={ios ? "-mb-2" : "mb-3"}>
        <StatusBar style="light" />
        <View className="flex-row justify-between items-center mx-4">
          <Text className="text-white text-3xl font-bold">
            Movies<Text style={styles.text}>I</Text>nc
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Search')}>
            <MagnifyingGlassIcon size="30" strokeWidth={2} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {loading ? (
        <Loading />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Trending Carousel */}
          {trending.length > 0 && <TrendingMovies data={trending} />}
          
          {/* Carrusel de favoritos - solo aparece cuando tienes como minimo una pelicula agregada a favoritos */}
          {favorites.length > 0 && (
            <View className="mb-8">
              <View className="flex-row justify-between items-center mx-4 mb-3">
                <Text className="text-white text-xl font-bold">Guardados</Text>
              </View>
              <FlatList
                data={favorites}
                renderItem={renderFavoriteItem}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingHorizontal: 15}}
              />
            </View>
          )}

          {/* Lista combinada y ordenada alfabéticamente */}
          {allMovies.length > 0 && (
            <MovieList title="Películas" data={allMovies} />
          )}
        </ScrollView>
      )}
    </View>
  );
}