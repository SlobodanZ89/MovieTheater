import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchMovies,
    fetchMoviesByVersion,
    createMovie,
    assignMovieToHall,
    refreshPosters
} from '../features/movies/movieSlice';
import {
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    Chip,
    Box,
    Stack
} from '@mui/material';
import PosterImage from '../components/PosterImage';
import { AuthContext } from '../auth/AuthContext';

const movieVersions = [
    { value: 'D2D', label: 'Digital 2D' },
    { value: 'R3D', label: 'Real D 3D' },
    { value: 'DBOX', label: 'D-Box 5D' },
];

const MovieListPage = () => {
    const dispatch = useDispatch();
    const { list, status, error } = useSelector((state) => state.movies);
    const { refresh } = useSelector((state) => state.movies);
    const { role } = useContext(AuthContext);
    const isAdmin = role === 'ROLE_ADMIN';

    const [form, setForm] = useState({
        title: '',
        mainCharacter: '',
        description: '',
        premieredAt: '',
        movieVersion: '',
        halls: ['']
    });

    const [filterVersion, setFilterVersion] = useState('');

    const [hallInputs, setHallInputs] = useState({});


    useEffect(() => {
        if (!filterVersion) {
            dispatch(fetchMovies());
        } else {
            dispatch(fetchMoviesByVersion(filterVersion));
        }
    }, [filterVersion, dispatch]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSelectChange = (value) => setForm({ ...form, movieVersion: value });

    const handleHallChange = (index, value) => {
        const newHalls = [...form.halls];
        newHalls[index] = value;
        setForm({ ...form, halls: newHalls });
    };

    const addHallField = () => {
        setForm({ ...form, halls: [...form.halls, ''] });
    };

    const removeHallField = (index) => {
        const newHalls = form.halls.filter((_, i) => i !== index);
        setForm({ ...form, halls: newHalls });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const resultAction = await dispatch(createMovie(form));
        if (createMovie.fulfilled.match(resultAction)) {
            setForm({
                title: '',
                mainCharacter: '',
                description: '',
                premieredAt: '',
                movieVersion: '',
                halls: ['']
            });
            if (filterVersion) {
                dispatch(fetchMoviesByVersion(filterVersion));
            } else {
                dispatch(fetchMovies());
            }
        }
    };

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} spacing={2}>
                <Typography variant="h4">
                    Movies
                </Typography>
                {isAdmin && (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                            variant="outlined"
                            disabled={refresh.status === 'loading'}
                            onClick={async () => {
                                await dispatch(refreshPosters({ force: false }));
                                dispatch(fetchMovies());
                            }}
                        >
                            Refresh posters
                        </Button>
                        <Button
                            variant="outlined"
                            color="warning"
                            disabled={refresh.status === 'loading'}
                            onClick={async () => {
                                await dispatch(refreshPosters({ force: true }));
                                dispatch(fetchMovies());
                            }}
                        >
                            Force refresh
                        </Button>
                        {refresh.updated != null && (
                            <Typography variant="body2" color="text.secondary">
                                Updated: {refresh.updated}
                            </Typography>
                        )}
                    </Stack>
                )}
            </Stack>

            <FormControl fullWidth variant="outlined" sx={{ minWidth: 200, mb: 2 }}>
                <InputLabel id="filter-movie-version-label">
                    Filter Movies by Version
                </InputLabel>
                <Select
                    labelId="filter-movie-version-label"
                    value={filterVersion}
                    onChange={(e) => setFilterVersion(e.target.value)}
                    label="Filter Movies by Version"
                    sx={{ minWidth: '100%', height: '56px' }}
                >
                    <MenuItem value="">
                        <em>All</em>
                    </MenuItem>
                    {movieVersions.map((version) => (
                        <MenuItem key={version.value} value={version.value}>
                            {version.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {isAdmin && (
                <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Title"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                fullWidth
                                required
                                helperText={form.title ? 'Poster URL will be fetched by the backend on save.' : ' '}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Main Character"
                                name="mainCharacter"
                                value={form.mainCharacter}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                fullWidth
                                required
                                multiline
                                rows={1}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Premiered At"
                                name="premieredAt"
                                type="date"
                                value={form.premieredAt}
                                onChange={handleChange}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl
                                fullWidth
                                required
                                variant="outlined"
                                sx={{ minWidth: 200 }}
                            >
                                <InputLabel id="movie-version-label">
                                    Supported Movie Version
                                </InputLabel>
                                <Select
                                    labelId="movie-version-label"
                                    value={form.movieVersion}
                                    onChange={(e) => handleSelectChange(e.target.value)}
                                    label="Supported Movie Version"
                                    sx={{ minWidth: '100%', height: '56px' }}
                                >
                                    {movieVersions.map((version) => (
                                        <MenuItem key={version.value} value={version.value}>
                                            {version.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {form.halls.map((hall, index) => (
                            <Grid item xs={12} md={3} key={index}>
                                <TextField
                                    label={`Hall ${index + 1}`}
                                    value={hall}
                                    onChange={(e) => handleHallChange(index, e.target.value)}
                                    fullWidth
                                />
                                {index > 0 && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => removeHallField(index)}
                                        sx={{ mt: 1 }}
                                    >
                                        Delete Hall
                                    </Button>
                                )}
                            </Grid>
                        ))}

                        <Grid item xs={12} md={3}>
                            <Button
                                variant="contained"
                                onClick={addHallField}
                                sx={{ mt: 2 }}
                            >
                                Add New Hall Field
                            </Button>
                        </Grid>

                        <Grid item xs={12} md={3}>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{ height: '56px', mt: 2 }}
                            >
                                Create Movie
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            )}

            {status === 'loading' && <Typography sx={{ mt: 2 }}>Loading...</Typography>}
            {status === 'failed' && <Typography sx={{ mt: 2 }} color="error">{error}</Typography>}

            <Grid container spacing={3}>
                {list.map((movie) => (
                    <Grid item xs={12} md={4} key={movie.movieId}>
                        <Card sx={{ height: '100%', maxWidth: 345, mx: 'auto' }}>
                            <Box sx={{ position: 'relative' }}>
                                <PosterImage src={movie.posterUrl} alt={movie.title} height={220} />
                                {movie.movieVersion && (
                                    <Chip
                                        label={movie.movieVersion}
                                        color="primary"
                                        size="small"
                                        sx={{ position: 'absolute', top: 10, left: 10 }}
                                    />
                                )}
                            </Box>
                            <CardContent>
                                <Typography variant="h6">{movie.title}</Typography>
                                <Typography variant="body2">Main Character: {movie.mainCharacter}</Typography>
                                <Typography variant="body2">Description: {movie.description}</Typography>
                                <Typography variant="body2">Premiered At: {movie.premieredAt}</Typography>
                                <Typography variant="body2">Version: {movie.movieVersion}</Typography>
                                {movie.halls && movie.halls.length > 0 && (
                                    <Typography variant="body2">
                                        Halls: {movie.halls.map(hall => hall.hallId).join(', ')}
                                    </Typography>
                                )}
                                {isAdmin && (
                                    <div style={{ marginTop: '10px' }}>
                                        <TextField
                                            label="Hall ID"
                                            size="small"
                                            value={hallInputs[movie.movieId] || ""}
                                            onChange={(e) =>
                                                setHallInputs({ ...hallInputs, [movie.movieId]: e.target.value })
                                            }
                                        />
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            sx={{ mt: 1 }}
                                            onClick={async () => {
                                                const hallId = hallInputs[movie.movieId];
                                                if (!hallId) return;

                                                const resultAction = await dispatch(
                                                    assignMovieToHall({ movieId: movie.movieId, hallId })
                                                );

                                                if (assignMovieToHall.fulfilled.match(resultAction)) {
                                                    setHallInputs((prev) => ({ ...prev, [movie.movieId]: '' }));
                                                    dispatch(fetchMovies());
                                                }
                                            }}
                                        >
                                            Assign to Hall
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default MovieListPage;
