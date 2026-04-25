import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  Container,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PosterImage from '../components/PosterImage';
import { http } from '../api/http';

function versionChip(v) {
  if (!v) return '';
  return v === 'D2D' ? '2D' : v === 'R3D' ? '3D' : v === 'DBOX' ? '5D' : String(v);
}

export default function HomePage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [query, setQuery] = useState('');
  const [version, setVersion] = useState('ALL');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setLoadError(null);
    http
      .get('/movie')
      .then((mRes) => {
        if (!mounted) return;
        setMovies(Array.isArray(mRes.data) ? mRes.data : []);
      })
      .catch((e) => {
        if (!mounted) return;
        setLoadError(e?.message || 'Failed to load movies.');
        setMovies([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredMovies = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movies.filter((m) => {
      const okQuery = !q || String(m.title ?? '').toLowerCase().includes(q);
      const okVersion = version === 'ALL' || String(m.movieVersion) === version;
      return okQuery && okVersion;
    });
  }, [movies, query, version]);

  return (
    <Container className="mx-auto max-w-6xl px-4" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: -0.5 }}>
            Movies
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Browse movies by title and version. Click a poster for details and showtimes.
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
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

          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            size="small"
            sx={{ width: { xs: '100%', md: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>

      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        {!loading && !!loadError && (
          <Grid item xs={12}>
            <Typography color="error">{loadError}</Typography>
          </Grid>
        )}
        {!loading && !loadError && filteredMovies.length === 0 && (
          <Grid item xs={12}>
            <Typography color="text.secondary">
              No movies matched your filters. Try changing search or version.
            </Typography>
          </Grid>
        )}
        {filteredMovies.map((m) => {
          return (
            <Grid key={m.movieId} item xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ overflow: 'hidden' }}>
                <CardActionArea onClick={() => navigate(`/movie/${m.movieId}`, { state: { from: 'home' } })}>
                  <Box sx={{ position: 'relative' }}>
                    <PosterImage src={m.posterUrl} alt={m.title} height={340} />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.82) 100%)',
                      }}
                    />
                    {m.movieVersion && (
                      <Chip
                        label={versionChip(m.movieVersion)}
                        size="small"
                        color="primary"
                        sx={{ position: 'absolute', top: 10, left: 10 }}
                      />
                    )}
                    <Box sx={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap title={m.title}>
                        {m.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {m.genre || ' '}
                      </Typography>
                    </Box>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
