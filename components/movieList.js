import { View, Text, TouchableWithoutFeedback, Image, Dimensions, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { fallbackMoviePoster, image185 } from '../api/moviedb';
import { styles } from '../theme';

const { width } = Dimensions.get('window');

export default function MovieList({ title, hideSeeAll, data }) {
  const navigation = useNavigation();

  const getVoteColor = (vote) => {
    if (vote <= 5) return 'text-red-500';
    if (vote <= 7) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <View className="mb-8 px-4 space-y-4">
      {/* Header */}
      <View className="flex-row justify-between items-center">
        <Text className="text-white text-lg">{title}</Text>
        {!hideSeeAll && (
          <TouchableOpacity>
            <Text style={styles.text} className="text-lg">See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Grid */}
      <View className="flex-row flex-wrap justify-between">
        {data.map((item, index) => {
          const releaseYear = item.release_date ? item.release_date.split('-')[0] : 'N/A';
          const vote = item.vote_average?.toFixed(1) || '0.0';
          const voteColor = getVoteColor(item.vote_average);

          return (
            <TouchableWithoutFeedback
              key={index}
              onPress={() => navigation.push('Movie', item)}
            >
              <View
                className="mb-6"
                style={{ width: (width - 48) / 2 }}
              >
                <Image
                  source={{ uri: image185(item.poster_path) || fallbackMoviePoster }}
                  className="rounded-xl"
                  style={{ width: '100%', height: 220 }}
                />

                <Text
                  className="text-neutral-300 mt-1 text-sm font-semibold"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>

                {/* Año de estreno y votos */}
                <View className="flex-row justify-between items-center mt-0.5">
                  <Text className="text-neutral-400 text-xs">{releaseYear}</Text>
                  <Text className={`text-xs font-semibold ${voteColor}`}>
                    ⭐ {vote}
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </View>
    </View>
  );
}
