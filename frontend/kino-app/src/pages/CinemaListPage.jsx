import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Button,
    TextField,
    Box,
    Stack
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchCinemas,
    createCinema,
    deleteCinema
} from '../features/cinemas/cinemaSlice';
import { Link } from 'react-router-dom';
import { ToastContext } from '../ui/ToastProvider';
import { AuthContext } from '../auth/AuthContext';

function cinemaMockImage(cinema) {
    const title = String(cinema?.name ?? 'Cinema').slice(0, 28);
    const subtitle = String(cinema?.address ?? '').slice(0, 40);
    const a = 0.72;
    const b = 0.25;
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#8B1D1D"/>
      <stop offset="0.55" stop-color="#121212"/>
      <stop offset="1" stop-color="#D4AF37"/>
    </linearGradient>
    <radialGradient id="r" cx="70%" cy="25%" r="70%">
      <stop offset="0" stop-color="rgba(255,255,255,${b})"/>
      <stop offset="1" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <pattern id="p" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M0 32h64M32 0v64" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>
      <circle cx="32" cy="32" r="10" fill="rgba(255,255,255,0.04)"/>
    </pattern>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18" />
    </filter>
  </defs>
  <rect width="1600" height="900" fill="url(#g)"/>
  <rect width="1600" height="900" fill="url(#p)" opacity="${a}"/>
  <circle cx="1180" cy="230" r="260" fill="url(#r)"/>
  <circle cx="1300" cy="200" r="180" fill="rgba(255,255,255,0.10)" filter="url(#blur)"/>
  <g fill="rgba(255,255,255,0.14)">
    <path d="M210 660c0-90 80-160 180-160h340c100 0 180 70 180 160v40H210v-40z"/>
    <rect x="270" y="360" width="780" height="90" rx="16"/>
    <rect x="330" y="290" width="120" height="46" rx="10"/>
    <rect x="480" y="290" width="120" height="46" rx="10"/>
    <rect x="630" y="290" width="120" height="46" rx="10"/>
  </g>
  <text x="90" y="120" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="64" font-weight="900" fill="rgba(255,255,255,0.92)">${title}</text>
  <text x="92" y="170" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="26" font-weight="600" fill="rgba(255,255,255,0.70)">${subtitle}</text>
</svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`;
}

const CinemaListPage = () => {
    const dispatch = useDispatch();
    const { notify } = React.useContext(ToastContext);
    const { list, status, error } = useSelector((state) => state.cinemas);
    const { role } = useContext(AuthContext);
    const isAdmin = useMemo(() => role === 'ROLE_ADMIN', [role]);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        manager: '',
        maxHalls: ''
    });

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchCinemas());
        }
    }, [status, dispatch]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name && formData.address && formData.manager && formData.maxHalls) {
            dispatch(createCinema(formData));
            setFormData({
                name: '',
                address: '',
                manager: '',
                maxHalls: ''
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteCinema(id)).unwrap();
            notify('Cinema deleted.', 'success');
        } catch (err) {
            notify(err.message || 'Failed to delete cinema.', err.status === 409 ? 'warning' : 'error');
        }
    };



    return (
        <Container className="mx-auto max-w-6xl px-4" sx={{ py: 4 }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
                    Cinemas
                </Typography>
                <Typography color="text.secondary">
                    Choose a cinema to see what’s playing.
                </Typography>
            </Box>

            {isAdmin && (
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Manager"
                                name="manager"
                                value={formData.manager}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <TextField
                                label="Max Halls"
                                name="maxHalls"
                                type="number"
                                value={formData.maxHalls}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={1}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ height: '56px' }}
                            >
                                Create
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            )}


            {status === 'loading' && <Typography>Loading...</Typography>}
            {status === 'failed' && <Typography color="error">{error}</Typography>}

            <Grid container spacing={3}>
                {list.map((cinema) => {
                    const bg = cinema.imageUrl || cinemaMockImage(cinema);
                    return (
                        <Grid item xs={12} key={cinema.cinemaId} sx={{ width: '100%', minWidth: 0 }}>
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Card
                                    sx={{
                                        height: { xs: 280, sm: 340, md: 380 },
                                        width: 'clamp(280px, 92vw, 980px)',
                                        maxWidth: '100%',
                                        flex: '0 0 auto',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxSizing: 'border-box',
                                        '&:hover .cinemaBg': { transform: 'scale(1.06)' },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundImage: `url(${bg})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            transform: 'scale(1.02)',
                                            transition: 'transform 220ms ease',
                                        }}
                                        className="cinemaBg"
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: {
                                                xs: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.92) 92%)',
                                                md: 'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.62) 55%, rgba(0,0,0,0.10) 100%)',
                                            },
                                        }}
                                    />

                                    <CardActionArea
                                        component={Link}
                                        to={`/cinema/${cinema.cinemaId}`}
                                        sx={{
                                            height: '100%',
                                            width: '100%',
                                            maxWidth: '100%',
                                            minWidth: 0,
                                            display: 'block',
                                        }}
                                    >
                                        <CardContent
                                            sx={{
                                                position: 'relative',
                                                height: '100%',
                                                width: '100%',
                                                maxWidth: '100%',
                                                minWidth: 0,
                                                boxSizing: 'border-box',
                                            }}
                                        >
                                            <Stack sx={{ height: '100%', minWidth: 0 }} spacing={1.25} justifyContent="flex-end">
                                                <Box sx={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
                                                    <Typography
                                                        variant="h3"
                                                        sx={{
                                                            fontWeight: 950,
                                                            letterSpacing: -0.6,
                                                            lineHeight: 1.05,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            overflowWrap: 'anywhere',
                                                            wordBreak: 'break-word',
                                                        }}
                                                        title={cinema.name}
                                                    >
                                                        {cinema.name}
                                                    </Typography>
                                                    <Typography
                                                        color="text.secondary"
                                                        sx={{
                                                            mt: 1,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            overflowWrap: 'anywhere',
                                                            wordBreak: 'break-word',
                                                        }}
                                                        title={cinema.address}
                                                    >
                                                        {cinema.address}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            mt: 0.75,
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                            overflowWrap: 'anywhere',
                                                            wordBreak: 'break-word',
                                                        }}
                                                    >
                                                        Manager: {cinema.manager} • Max halls: {cinema.maxHalls}
                                                    </Typography>
                                                </Box>

                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 0.5 }}>
                                                    <Button variant="contained" color="primary" component="span">
                                                        Open
                                                    </Button>
                                                    {isAdmin && (
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            component="span"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleDelete(cinema.cinemaId);
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Box>
                        </Grid>
                    )
                })}
            </Grid>
        </Container>
    );
};

export default CinemaListPage;
