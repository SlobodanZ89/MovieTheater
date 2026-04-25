import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { http } from '../../api/http';

const BASE_URL = '/cinema';

export const fetchCinemas = createAsyncThunk(
    'cinemas/fetchCinemas',
    async () => {
        const response = await http.get(BASE_URL);
        return response.data;
    }
);

export const fetchCinemaById = createAsyncThunk(
    'cinemas/fetchCinemaById',
    async (id) => {
        const response = await http.get(`${BASE_URL}/${id}`);
        return response.data;
    }
);

export const createCinema = createAsyncThunk(
    'cinemas/createCinema',
    async (cinemaData) => {
        const response = await http.post(BASE_URL, cinemaData);
        return response.data;
    }
);

export const deleteCinema = createAsyncThunk(
    'cinemas/deleteCinema',
    async (id, { rejectWithValue }) => {
        try {
            const response = await http.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue({
                status: error.response?.status,
                message: error.backendMessage || 'Failed to delete cinema'
            });
        }
    }
);



const cinemaSlice = createSlice({
    name: 'cinemas',
    initialState: {
        list: [],
        current: null,
        status: 'idle',
        error: null,
    },
    reducers: {
        addHallToCurrentCinema: (state, action) => {
            if (state.current) {
                if (!state.current.halls) {
                    state.current.halls = [];
                }
                state.current.halls.push(action.payload);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCinemas.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCinemas.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.list = action.payload;
            })
            .addCase(fetchCinemas.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchCinemaById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCinemaById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.current = {
                    ...action.payload,
                    halls: action.payload.hallList || [],
                };
            })
            .addCase(fetchCinemaById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(createCinema.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })
            .addCase(deleteCinema.fulfilled, (state, action) => {
                const deletedId = action.meta.arg;
                state.list = state.list.filter((cinema) => cinema.cinemaId !== deletedId);
                state.status = 'idle';
            });
    },
});

export const { addHallToCurrentCinema } = cinemaSlice.actions;
export default cinemaSlice.reducer;