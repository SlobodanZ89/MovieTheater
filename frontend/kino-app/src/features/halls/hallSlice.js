import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { http } from '../../api/http';

const BASE_URL = '/hall';

// Thunk for creating a new hall
export const createHall = createAsyncThunk(
    'halls/createHall',
    async (hallData, { rejectWithValue }) => {
        try {
            const response = await http.post(BASE_URL, hallData);
            return response.data;
        } catch (error) {
            // Return a more specific error message if the API provides one
            return rejectWithValue({
                status: error.response?.status,
                message: error.backendMessage || error.message
            });
        }
    }
);

// Thunk for updating an existing hall
export const updateHall = createAsyncThunk(
    'halls/updateHall',
    async ({ id, hallData }, { rejectWithValue }) => {
        try {
            const response = await http.put(`${BASE_URL}/${id}`, hallData);
            return response.data;
        } catch (error) {
            const status = error.response?.status;

            if (status === 409) {
                return rejectWithValue({
                    status,
                    message: error.backendMessage || "Hall cannot be updated because there are movies assigned."
                });
            }

            return rejectWithValue({
                status: status || 500,
                message: error.backendMessage || error.message || "Failed to update hall."
            });
        }
    }
);

// Thunk for fetching a hall by its ID
export const fetchHallById = createAsyncThunk(
    'halls/fetchHallById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await http.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue({
                status: error.response?.status,
                message: error.backendMessage || error.message
            });
        }
    }
);

const hallSlice = createSlice({
    name: 'halls',
    initialState: {
        current: null,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Handle fetchHallById actions
            .addCase(fetchHallById.pending, (state) => {
                state.status = 'loading';
                state.error = null; // Clear previous errors
            })
            .addCase(fetchHallById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.current = action.payload;
            })
            .addCase(fetchHallById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Handle createHall actions
            .addCase(createHall.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createHall.fulfilled, (state) => {
                state.status = 'succeeded';
                // Note: The created hall isn't stored in 'current' here, as that's for the fetched hall.
            })
            .addCase(createHall.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

            // Handle updateHall actions
            .addCase(updateHall.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateHall.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.current = action.payload; // Update 'current' with the new hall data
            })
            .addCase(updateHall.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    },
});

export default hallSlice.reducer;