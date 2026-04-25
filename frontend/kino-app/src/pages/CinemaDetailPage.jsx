import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCinemaById } from '../features/cinemas/cinemaSlice';
import {
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Box,
    Stack
} from '@mui/material';
import { AuthContext } from '../auth/AuthContext';
import PosterImage from '../components/PosterImage';
import { http } from '../api/http';

function versionLabel(v) {
    if (!v) return '';
    return v === 'D2D' ? '2D' : v === 'R3D' ? '3D' : v === 'DBOX' ? '5D' : String(v);
}

const CinemaDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { role } = useContext(AuthContext);
    const isAdmin = useMemo(() => role === 'ROLE_ADMIN', [role]);

    const { current, status, error } = useSelector((state) => state.cinemas);
    const [movies, setMovies] = useState([]);
    const [screenings, setScreenings] = useState([]);

    useEffect(() => {
        dispatch(fetchCinemaById(id));
    }, [dispatch, id]);

    useEffect(() => {
        let mounted = true;
        Promise.all([http.get('/movie'), http.get('/screenings')]).then(([mRes, sRes]) => {
            if (!mounted) return;
            setMovies(Array.isArray(mRes.data) ? mRes.data : []);
            setScreenings(Array.isArray(sRes.data) ? sRes.data : []);
        });
        return () => {
            mounted = false;
        };
    }, []);

    const cinemaIdNum = Number(id);
    const moviesPlaying = useMemo(() => {
        const ids = new Set(
            screenings
                .filter((s) => Number(s.cinemaId) === cinemaIdNum)
                .map((s) => Number(s.movieId))
        );
        const list = movies.filter((m) => ids.has(Number(m.movieId)));
        list.sort((a, b) => String(a.title).localeCompare(String(b.title)));
        return list;
    }, [movies, screenings, cinemaIdNum]);

    if (status === 'loading') {
        return <Typography sx={{ m: 4 }}>Loading...</Typography>;
    }

    if (status === 'failed') {
        return <Typography sx={{ m: 4 }} color="error">{error}</Typography>;
    }

    if (!current) {
        return <Typography sx={{ m: 4 }}>No cinema found.</Typography>;
    }

    return (
        <Container className="mx-auto max-w-6xl px-4" sx={{ py: 4 }}>
            <Button variant="contained" onClick={() => navigate('/cinema')} sx={{ mb: 2 }}>
                Back to cinemas
            </Button>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                    {current.name}
                </Typography>
                <Typography color="text.secondary">{current.address}</Typography>
            </Box>

            <Typography variant="h5" sx={{ mt: 3, mb: 2 }}>
                Movies playing here
            </Typography>

            {moviesPlaying.length === 0 ? (
                <Typography color="text.secondary">
                    No screenings in this cinema yet.
                </Typography>
            ) : (
                <Grid container spacing={2.5}>
                    {moviesPlaying.map((m) => (
                        <Grid item xs={12} sm={6} md={4} key={m.movieId}>
                            <Card sx={{ overflow: 'hidden', borderRadius: 3 }}>
                                <Box
                                    sx={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() =>
                                        navigate(`/cinema/${cinemaIdNum}/movie/${m.movieId}`, {
                                            state: { from: 'cinema' },
                                        })
                                    }
                                >
                                    <PosterImage src={m.posterUrl} alt={m.title} height={340} />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            background:
                                                'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.88) 100%)',
                                        }}
                                    />
                                    <Box sx={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                            {m.movieVersion && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {versionLabel(m.movieVersion)}
                                                </Typography>
                                            )}
                                            {m.premieredAt && (
                                                <Typography variant="caption" color="text.secondary">
                                                    • {m.premieredAt}
                                                </Typography>
                                            )}
                                        </Stack>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap title={m.title}>
                                            {m.title}
                                        </Typography>
                                    </Box>
                                </Box>
                                <CardContent>
                                    <Stack direction="row" spacing={1}>
                                        <Button
                                            variant="contained"
                                            component={Link}
                                            to={`/cinema/${cinemaIdNum}/movie/${m.movieId}`}
                                            state={{ from: 'cinema' }}
                                            fullWidth
                                        >
                                            Showtimes
                                        </Button>
                                        {isAdmin && (
                                            <Button
                                                variant="outlined"
                                                component={Link}
                                                to={`/movie/${m.movieId}`}
                                                state={{ from: 'cinema', cinemaId: cinemaIdNum }}
                                                sx={{ whiteSpace: 'nowrap' }}
                                            >
                                                Admin view
                                            </Button>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default CinemaDetailPage;