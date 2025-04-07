import {
    View, Text, Image, Dimensions, TouchableOpacity, ScrollView, Platform, Alert
  } from 'react-native';
  import React, { useEffect, useState } from 'react';
  import { useNavigation, useRoute } from '@react-navigation/native';
  import { LinearGradient } from 'expo-linear-gradient';
  import { ChevronLeftIcon, HeartIcon, StarIcon } from 'react-native-heroicons/solid';
  import { StarIcon as StarOutline } from 'react-native-heroicons/outline';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import Cast from '../components/cast';
  import MovieList from '../components/movieList';
  import {
    fallbackMoviePoster,
    fetchMovieCredits,
    fetchMovieDetails,
    fetchSimilarMovies,
    image500,
    createGuestSession,
    rateMovie
  } from '../api/moviedb';
  import { styles, theme } from '../theme';
  import Loading from '../components/loading';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  const ios = Platform.OS == 'ios';
  const topMargin = ios ? '' : ' mt-3';
  var { width, height } = Dimensions.get('window');
  
  export default function MovieScreen() {
    const { params: item } = useRoute();
    const navigation = useNavigation();
    const [movie, setMovie] = useState({});
    const [cast, setCast] = useState([]);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [isFavourite, setIsFavourite] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showRating, setShowRating] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [userRating, setUserRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    useEffect(() => {
      setLoading(true);
      getMovieDetials(item.id);
      getMovieCredits(item.id);
      getSimilarMovies(item.id);
      checkIfFavourite(item.id);
      loadUserRating(item.id);
    }, [item]);
  
    const checkIfFavourite = async (id) => {
      const favs = await AsyncStorage.getItem('favorites');
      const parsed = favs ? JSON.parse(favs) : [];
      setIsFavourite(parsed.some((movie) => movie.id === id));
    };
  
    const loadUserRating = async (id) => {
      try {
        const ratings = await AsyncStorage.getItem('userRatings');
        const parsed = ratings ? JSON.parse(ratings) : {};
        if (parsed[id]) {
          setUserRating(parsed[id]);
        } else {
          setUserRating(0);
        }
      } catch (error) {
        console.error('Error loading user rating:', error);
      }
    };
  
    const saveUserRating = async (id, rating) => {
      try {
        const ratings = await AsyncStorage.getItem('userRatings');
        const parsed = ratings ? JSON.parse(ratings) : {};
        parsed[id] = rating;
        await AsyncStorage.setItem('userRatings', JSON.stringify(parsed));
        setUserRating(rating);
      } catch (error) {
        console.error('Error saving user rating:', error);
      }
    };
  
    const toggleFavourite = async () => {
      const favs = await AsyncStorage.getItem('favorites');
      let parsed = favs ? JSON.parse(favs) : [];
  
      if (isFavourite) {
        parsed = parsed.filter((m) => m.id !== movie.id);
      } else {
        parsed.push({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          vote_average: movie.vote_average,
          release_date: movie.release_date
        });
      }
  
      await AsyncStorage.setItem('favorites', JSON.stringify(parsed));
      setIsFavourite(!isFavourite);
    };
  
    const getMovieDetials = async (id) => {
      const data = await fetchMovieDetails(id);
      setLoading(false);
      if (data) {
        setMovie({ ...movie, ...data });
      }
    };
  
    const getMovieCredits = async (id) => {
      const data = await fetchMovieCredits(id);
      if (data?.cast) {
        setCast(data.cast);
      }
    };
  
    const getSimilarMovies = async (id) => {
      const data = await fetchSimilarMovies(id);
      if (data?.results) {
        setSimilarMovies(data.results);
      }
    };
  
    const handleRating = (rating) => {
      setSelectedRating(rating);
    };
  
    const submitRating = async () => {
      if (selectedRating === 0) {
        Alert.alert("Error", "Por favor selecciona una calificación");
        return;
      }
  
      setIsSubmitting(true);
  
      try {
        // Creando sesion anonima para luego enviar votos
        const guestSessionId = await createGuestSession();
        
        if (!guestSessionId) {
          throw new Error("No se pudo crear la sesión de invitado");
        }
        // enviar el voto del usuario dde manera anonima por medio de la misma API
        // como IMDB usa una escala de 1 a 10 y yo use estrellas cada estrellas equivale a 2 puntos
        await rateMovie(movie.id, selectedRating * 2, guestSessionId);
        
        // Guardar la votacion de los usuarios
        await saveUserRating(movie.id, selectedRating);
        
        Alert.alert("¡Éxito!", `Tu calificación de ${selectedRating} estrellas ha sido registrada.`);
        setShowRating(false);
      } catch (error) {
        console.error("Error submitting rating:", error);
        Alert.alert("Error", "No se pudo enviar tu calificación. Inténtalo de nuevo más tarde.");
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const renderStars = (rating, interactive = true) => {
      return (
        <View className="flex-row justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity 
              key={star}
              onPress={() => interactive && handleRating(star)}
              disabled={!interactive}
              className="mx-1"
            >
              {star <= rating ? (
                <StarIcon size={interactive ? 36 : 28} color="#FFD700" />
              ) : (
                <StarOutline size={interactive ? 36 : 28} color="#FFD700" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      );
    };
  
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} className="flex-1 bg-neutral-900">
        {/* Header */}
        <View className="w-full">
          <SafeAreaView className={`absolute z-20 w-full flex-row justify-between items-center px-4 ${topMargin}`}>
            <TouchableOpacity style={styles.background} className="rounded-xl p-1" onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size="28" strokeWidth={2.5} color="white" />
            </TouchableOpacity>
  
            <TouchableOpacity onPress={toggleFavourite}>
              <HeartIcon size="35" color={isFavourite ? theme.background : 'white'} />
            </TouchableOpacity>
          </SafeAreaView>
  
          {
            loading ? <Loading /> : (
              <View>
                <Image
                  source={{ uri: image500(movie.poster_path) || fallbackMoviePoster }}
                  style={{ width, height: height * 0.55 }}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(23, 23, 23, 0.8)', 'rgba(23, 23, 23, 1)']}
                  style={{ width, height: height * 0.40 }}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  className="absolute bottom-0"
                />
              </View>
            )
          }
        </View>
  
        {/* Detalles */}
        <View style={{ marginTop: -(height * 0.09) }} className="space-y-3">
          <Text className="text-white text-center text-3xl font-bold tracking-widest">{movie?.title}</Text>
  
          {movie?.id && (
            <View className="flex-row justify-center items-center space-x-1">
            <Text className="text-neutral-400 font-semibold text-base text-center">
              {movie?.status} • {movie?.release_date?.split('-')[0] || 'N/A'} • {movie?.runtime} min
            </Text>
            <View className="flex-row items-center ml-2">
              <StarIcon size={18} color="#FFD700" />
              <Text className="text-neutral-400 font-semibold text-base ml-1">
                {(movie?.vote_average).toFixed(1)}
              </Text>
            </View>
          </View>
          )}
  
          {/* Generos */}
          <View className="flex-row justify-center mx-4 space-x-2">
            {movie?.genres?.map((genre, index) => {
              let showDot = index + 1 != movie.genres.length;
              return (
                <Text key={index} className="text-neutral-400 font-semibold text-base text-center">
                  {genre?.name} {showDot ? "•" : null}
                </Text>
              );
            })}
          </View>
  
          {/* Descripcion */}
          <Text className="text-neutral-400 mx-4 tracking-wide">{movie?.overview}</Text>
  
          {/* Votos de estrella que solo aparecera cuando le das al boton */}
          {showRating && (
            <View className="mx-4 mt-2">
              {renderStars(selectedRating)}
              <View className="flex-row justify-center space-x-4 mt-4">
                <TouchableOpacity
                  className="bg-gray-600 rounded-xl py-3 px-6"
                  onPress={() => setShowRating(false)}
                  disabled={isSubmitting}
                >
                  <Text className="text-white font-bold">Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="rounded-xl py-3 px-6"
                  style={{ backgroundColor: theme.background }}
                  onPress={submitRating}
                  disabled={isSubmitting}
                >
                  <Text className="text-white font-bold">
                    {isSubmitting ? "Enviando..." : "Enviar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
  
          {/* User Rating or Vote Button */}
          {!showRating && (
            <View className="mx-4 mt-4">
              {userRating > 0 ? (
                <View className="items-center space-y-2">
                  <Text className="text-white text-center font-semibold">Tu calificación:</Text>
                  {renderStars(userRating, false)}
                  <TouchableOpacity
                    className="mt-2 rounded-xl py-2 px-4"
                    style={{ backgroundColor: theme.background }}
                    onPress={() => setShowRating(true)}
                  >
                    <Text className="text-white text-center">Cambiar calificación</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  className="rounded-xl py-4"
                  style={{ backgroundColor: theme.background }}
                  onPress={() => setShowRating(true)}
                >
                  <Text className="text-white text-center font-bold text-lg">Votar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
  
        {/* Reparto */}
        {movie?.id && cast.length > 0 && <Cast navigation={navigation} cast={cast} />}
  
        {/* Peliculas similares */}
        {movie?.id && similarMovies.length > 0 && (
          <MovieList title={'Películas Similares'} hideSeeAll={true} data={similarMovies} />
        )}
      </ScrollView>
    );
  }