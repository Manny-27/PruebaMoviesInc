import axios from "axios";
import { apiKey } from "../constants";

// endpoints
const apiBaseUrl = 'https://api.themoviedb.org/3';
const trendingMoviesEndpoint = `${apiBaseUrl}/trending/movie/day?api_key=${apiKey}&language=es-ES`;
const upcomingMoviesEndpoint = `${apiBaseUrl}/movie/upcoming?api_key=${apiKey}&language=es-ES`;
const topRatedMoviesEndpoint = `${apiBaseUrl}/movie/top_rated?api_key=${apiKey}&language=es-ES`;
const searchMoviesEndpoint = `${apiBaseUrl}/search/movie?api_key=${apiKey}&language=es-ES`;

// authentication endpoints
const createGuestSessionEndpoint = `${apiBaseUrl}/authentication/guest_session/new?api_key=${apiKey}`;

// endpoints with dynamic params

// movie
const movieDetailsEndpoint = id=> `${apiBaseUrl}/movie/${id}?api_key=${apiKey}&language=es-ES`;
const movieCreditsEndpoint = id=> `${apiBaseUrl}/movie/${id}/credits?api_key=${apiKey}&language=es-ES`;
const similarMoviesEndpoint = id=> `${apiBaseUrl}/movie/${id}/similar?api_key=${apiKey}&language=es-ES`;
const movieRatingEndpoint = (id, guestSessionId) => 
  `${apiBaseUrl}/movie/${id}/rating?api_key=${apiKey}&guest_session_id=${guestSessionId}`;

// person
const personDetailsEndpoint = id=> `${apiBaseUrl}/person/${id}?api_key=${apiKey}&language=es-ES`;
const personMoviesEndpoint = id=> `${apiBaseUrl}/person/${id}/movie_credits?api_key=${apiKey}&language=es-ES`;

// functions to get images of different widths, (show images using these to improve the loading times)
export const image500 = posterPath=> posterPath? 'https://image.tmdb.org/t/p/w500'+posterPath : null;
export const image342 = posterPath=> posterPath? 'https://image.tmdb.org/t/p/w342'+posterPath : null;
export const image185 = posterPath=> posterPath? 'https://image.tmdb.org/t/p/w185'+posterPath : null;


// fallback images 
export const fallbackMoviePoster = 'https://img.myloview.com/stickers/white-laptop-screen-with-hd-video-technology-icon-isolated-on-grey-background-abstract-circle-random-dots-vector-illustration-400-176057922.jpg';
export const fallbackPersonImage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmUiF-YGjavA63_Au8jQj7zxnFxS_Ay9xc6pxleMqCxH92SzeNSjBTwZ0l61E4B3KTS7o&usqp=CAU';

const apiCall = async (endpoint, params)=>{
    const options = {
        method: 'GET',
        url: endpoint,
        params: params? params: {}
    };

    try{
        const response = await axios.request(options);
        return response.data;
    }catch(error){
        console.log('error: ',error);
        return {};
    }
}

// home screen apis
export const fetchTrendingMovies = ()=>{
    return apiCall(trendingMoviesEndpoint);
}
export const fetchUpcomingMovies = ()=>{
    return apiCall(upcomingMoviesEndpoint);
}
export const fetchTopRatedMovies = ()=>{
    return apiCall(topRatedMoviesEndpoint);
}


// movie screen apis
export const fetchMovieDetails = (id)=>{
    return apiCall(movieDetailsEndpoint(id));
}
export const fetchMovieCredits = (movieId)=>{
    return apiCall(movieCreditsEndpoint(movieId));
}
export const fetchSimilarMovies = (movieId)=>{
    return apiCall(similarMoviesEndpoint(movieId));
}

// person screen apis
export const fetchPersonDetails = (personId)=>{
    return apiCall(personDetailsEndpoint(personId));
}
export const fetchPersonMovies = (personId)=>{
    return apiCall(personMoviesEndpoint(personId));
}

// search screen apis
export const searchMovies = (params)=>{
    return apiCall(searchMoviesEndpoint, params);
}

// rating apis
export const createGuestSession = async () => {
    try {
        const response = await axios.get(createGuestSessionEndpoint);
        return response.data.guest_session_id;
    } catch (error) {
        console.log('error creating guest session:', error);
        return null;
    }
};

export const rateMovie = async (movieId, rating, guestSessionId) => {
    try {
        const response = await axios.post(
            movieRatingEndpoint(movieId, guestSessionId),
            { value: rating },
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (error) {
        console.log('error rating movie:', error);
        throw error;
    }
};