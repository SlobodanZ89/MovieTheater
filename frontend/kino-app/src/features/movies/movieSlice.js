import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { http } from '../../api/http';

const BASE_URL = '/movie';

export const fetchMovies = createAsyncThunk(
    'movies/fetchMovies',
    async () => {
        const response = await http.get(BASE_URL);
        return response.data;
    }
);

export const fetchMoviesByVersion = createAsyncThunk(
    'movies/fetchMoviesByVersion',
    async (version) => {
        const response = await http.get(`${BASE_URL}/${version}`);
        return response.data;
    }
);

export const fetchMoviesByQuery = createAsyncThunk(
    'movies/fetchMoviesByQuery',
    async ({ query, version } = {}) => {
        const params = new URLSearchParams();
        if (query) params.set('query', query);
        if (version) params.set('version', version);
        const qs = params.toString();
        const response = await http.get(`${BASE_URL}/search${qs ? `?${qs}` : ''}`);
        return response.data;
    }
);


export const createMovie = createAsyncThunk(
    'movies/createMovie',
    async (movieData) => {
        const response = await http.post(BASE_URL, movieData);
        return response.data;
    }
);

export const assignMovieToHall = createAsyncThunk(
    'movies/assignMovieToHall',
    async ({ movieId, hallId }) => {
        const response = await http.post(`${BASE_URL}/${movieId}/hall/${hallId}`);
        return response.data;
    }
);

export const refreshPosters = createAsyncThunk(
    'movies/refreshPosters',
    async ({ force = false } = {}) => {
        const response = await http.post(`${BASE_URL}/refresh-posters${force ? '?force=true' : ''}`);
        return response.data;
    }
);

const movieSlice = createSlice({
    name: 'movies',
    initialState: {
        list: [],
        current: null,
        status: 'idle',
        error: null,
        refresh: { status: 'idle', error: null, updated: null, force: false },
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMovies.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchMovies.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(fetchMovies.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(fetchMoviesByVersion.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchMoviesByVersion.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(fetchMoviesByVersion.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(fetchMoviesByQuery.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchMoviesByQuery.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(fetchMoviesByQuery.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            .addCase(createMovie.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })

            .addCase(assignMovieToHall.fulfilled, (state, action) => {
                state.current = action.payload;
            })

            .addCase(refreshPosters.pending, (state, action) => {
                state.refresh.status = 'loading';
                state.refresh.error = null;
                state.refresh.updated = null;
                state.refresh.force = Boolean(action.meta?.arg?.force);
            })
            .addCase(refreshPosters.fulfilled, (state, action) => {
                state.refresh.status = 'succeeded';
                state.refresh.updated = action.payload?.updated ?? null;
                state.refresh.force = Boolean(action.payload?.force);
            })
            .addCase(refreshPosters.rejected, (state, action) => {
                state.refresh.status = 'failed';
                state.refresh.error = action.error.message;
            });
    },
});

export default movieSlice.reducer;
