import { configureStore } from "@reduxjs/toolkit";
import cinemaReducer from '../features/cinemas/cinemaSlice';
import hallReducer from '../features/halls/hallSlice';
import movieReducer from '../features/movies/movieSlice';

const store = configureStore({
    reducer: {
        cinemas: cinemaReducer,
        halls: hallReducer,
        movies: movieReducer,
    }
});

export default store;