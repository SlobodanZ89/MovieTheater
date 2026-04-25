import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PosterImage from '../components/PosterImage';
import { fetchMovies, refreshPosters } from '../features/movies/movieSlice';
import { AuthContext } from '../auth/AuthContext';

function versionLabel(v) {
  if (!v) return '';
  return v === 'D2D' ? '2D' : v === 'R3D' ? '3D' : v === 'DBOX' ? '5D' : String(v);
}

export default function MovieGalleryPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, status, error } = useSelector((s) => s.movies);
  const { refresh } = useSelector((s) => s.movies);
  const { role } = useContext(AuthContext);
  const isAdmin = role === 'ROLE_ADMIN';
  const [query, setQuery] = useState('');
  const [version, setVersion] = useState('ALL');

  useEffect(() => {
    dispatch(fetchMovies());
  }, [dispatch]);

  useEffect(() => {
    if (localStorage.getItem('debug.movies') !== '1') return;
    // eslint-disable-next-line no-console
    console.log('[debug.movies] /api/movie payload:', list);
    // eslint-disable-next-line no-console
    console.log(
      '[debug.movies] posters:',
      list.map((m) => ({ id: m.movieId, title: m.title, posterUrl: m.posterUrl }))
    );
  }, [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((m) => {
      const title = String(m.title ?? '').toLowerCase();
      const desc = String(m.description ?? '').toLowerCase();
      const main = String(m.mainCharacter ?? '').toLowerCase();
      const okQuery = !q || title.includes(q) || desc.includes(q) || main.includes(q);
      const okVersion = version === 'ALL' || String(m.movieVersion) === version;
      return okQuery && okVersion;
    });
  }, [list, query, version]);

  return (
    <Container className="mx-auto max-w-6xl px-4" sx={{ py: 4 }}>
      <Box className="flex flex-col gap-3">
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
            Now showing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Browse movies, search titles, and pick your screening.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies…"
            size="small"
            sx={{ width: { xs: '100%', md: 420 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <ToggleButtonGroup
            value={version}
            exclusive
            onChange={(_, v) => v && setVersion(v)}
            size="small"
            sx={{ flexWrap: 'wrap' }}
          >
            <ToggleButton value="ALL">All</ToggleButton>
            <ToggleButton value="D2D">2D</ToggleButton>
            <ToggleButton value="R3D">3D</ToggleButton>
            <ToggleButton value="DBOX">5D</ToggleButton>
          </ToggleButtonGroup>

          {isAdmin && (
            <Button
              variant="outlined"
              disabled={refresh.status === 'loading'}
              onClick={async () => {
                await dispatch(refreshPosters({ force: true }));
                dispatch(fetchMovies());
              }}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Refresh posters
            </Button>
          )}
        </Stack>
      </Box>

      {status === 'loading' && (
        <Typography sx={{ mt: 3 }} color="text.secondary">
          Loading…
        </Typography>
      )}
      {status === 'failed' && (
        <Typography sx={{ mt: 3 }} color="error">
          {error}
        </Typography>
      )}

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        {filtered.map((movie) => (
          <Grid key={movie.movieId ?? movie.id ?? movie.title} item xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                height: '100%',
                overflow: 'hidden',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 8 },
              }}
            >
              <CardActionArea
                onClick={() => navigate(`/movie/${movie.movieId}`, { state: { from: 'home' } })}
                sx={{ height: '100%', alignItems: 'stretch' }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      transform: 'scale(1)',
                      transition: 'transform 240ms ease',
                      '.MuiCardActionArea-root:hover &': { transform: 'scale(1.04)' },
                    }}
                  >
                    <PosterImage src={movie.posterUrl} alt={movie.title} height={360} />
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.82) 100%)',
                    }}
                  />
                  {movie.movieVersion && (
                    <Chip
                      label={versionLabel(movie.movieVersion)}
                      size="small"
                      color="primary"
                      sx={{ position: 'absolute', top: 10, left: 10 }}
                    />
                  )}
                  <Box sx={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap title={movie.title}>
                      {movie.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {movie.mainCharacter || ' '}
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ display: 'none' }} />
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

