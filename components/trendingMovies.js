import { View, Text, Image, TouchableWithoutFeedback, Dimensions } from 'react-native';
import React from 'react';
import Carousel from 'react-native-snap-carousel';
import { useNavigation } from '@react-navigation/native';
import { image500 } from '../api/moviedb';

const { width, height } = Dimensions.get('window');

export default function TrendingMovies({ data }) {
  const navigation = useNavigation();

  const handleClick = (item) => {
    navigation.navigate('Movie', item);
  };

  return (
    <View className="mb-8">
      <Text className="text-white text-xl mx-4 mb-5">Tendencia</Text>

      <Carousel
        data={data}
        renderItem={({ item }) => <MovieCard handleClick={handleClick} item={item} />}
        firstItem={1}
        inactiveSlideOpacity={0.6}
        sliderWidth={width}
        itemWidth={width * 0.62}
        slideStyle={{ display: 'flex', alignItems: 'center' }}
      />
    </View>
  );
}

const MovieCard = ({ item, handleClick }) => {
  const releaseYear = item.release_date ? item.release_date.split('-')[0] : 'N/A';
  const vote = item.vote_average?.toFixed(1) || '0.0';

  const getVoteColor = (vote) => {
    if (vote <= 5) return 'text-red-500';
    if (vote <= 7) return 'text-yellow-400';
    return 'text-green-400';
  };

  const voteColor = getVoteColor(item.vote_average);

  return (
    <TouchableWithoutFeedback onPress={() => handleClick(item)}>
      <View>
        <Image
          source={{ uri: image500(item.poster_path) }}
          style={{
            width: width * 0.6,
            height: height * 0.4,
          }}
          className="rounded-3xl"
        />

        {/* info Adicional*/}
        <View className="mt-2 px-1">
          <Text
            className="text-neutral-200 text-base font-semibold"
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <View className="flex-row justify-between items-center mt-1">
            <Text className="text-neutral-400 text-xs">{releaseYear}</Text>
            <Text className={`text-xs font-semibold ${voteColor}`}>
              ⭐ {vote}
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
