import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import PosterImage from '../components/PosterImage';
import { http } from '../api/http';
import { ToastContext } from '../ui/ToastProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

function fmtTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function versionLabel(v) {
  if (!v) return '';
  return v === 'D2D' ? '2D' : v === 'R3D' ? '3D' : v === 'DBOX' ? '5D' : String(v);
}

function prettyYear(y) {
  if (y == null) return '';
  const s = String(y).trim();
  return s;
}

function ymdToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function ymdFromDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseYmdToLocalDate(ymd) {
  const d = new Date(`${ymd}T12:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function sameLocalDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function pickDefaultShowDateYmd(screenings) {
  const ymds = new Set();
  for (const s of screenings) {
    const t = new Date(s.startTime);
    if (Number.isNaN(t.getTime())) continue;
    ymds.add(ymdFromDate(t));
  }
  const sorted = Array.from(ymds).sort();
  if (sorted.length > 0) return sorted[0];
  return ymdToday();
}

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useContext(ToastContext);

  const movieId = Number(id);
  const [movie, setMovie] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDate, setShowDate] = useState(() => ymdToday());

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([http.get('/movie'), http.get('/screenings'), http.get('/cinema')])
      .then(([moviesRes, screeningsRes, cinemasRes]) => {
        if (!mounted) return;
        const movies = Array.isArray(moviesRes.data) ? moviesRes.data : [];
        const found = movies.find((m) => Number(m.movieId) === movieId);
        setMovie(found ?? null);
        const allScreenings = Array.isArray(screeningsRes.data) ? screeningsRes.data : [];
        const forMovie = allScreenings.filter((s) => Number(s.movieId) === movieId);
        setScreenings(forMovie);
        setShowDate(pickDefaultShowDateYmd(forMovie));
        setCinemas(Array.isArray(cinemasRes.data) ? cinemasRes.data : []);
      })
      .catch((err) => {
        notify(err.backendMessage || 'Failed to load movie.', 'error');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [movieId, notify]);

  const showDateObj = useMemo(() => parseYmdToLocalDate(showDate), [showDate]);
  const showDayjs = useMemo(() => dayjs(showDateObj), [showDateObj]);

  const backTarget = useMemo(() => {
    const from = location.state?.from;
    if (from === 'cinema') {
      const cid = location.state?.cinemaId != null ? Number(location.state.cinemaId) : null;
      return cid ? `/cinema/${cid}` : '/cinema';
    }
    return '/';
  }, [location.state]);

  const filteredScreenings = useMemo(() => {
    return screenings.filter((s) => {
      const t = new Date(s.startTime);
      if (Number.isNaN(t.getTime())) return false;
      return sameLocalDay(t, showDateObj);
    });
  }, [screenings, showDateObj]);

  const grouped = useMemo(() => {
    const byCinema = new Map();
    for (const s of filteredScreenings) {
      const cinema = s.cinemaName || 'Theater';
      const hall = s.hallName || `Hall ${s.hallId ?? ''}`.trim();
      if (!byCinema.has(cinema)) byCinema.set(cinema, new Map());
      const halls = byCinema.get(cinema);
      if (!halls.has(hall)) halls.set(hall, []);
      halls.get(hall).push(s);
    }
    for (const [, halls] of byCinema) {
      for (const [, arr] of halls) {
        arr.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
      }
    }
    return byCinema;
  }, [filteredScreenings]);

  const cinemaIdByName = useMemo(() => {
    const map = new Map();
    for (const c of cinemas) {
      if (c?.name) map.set(String(c.name), Number(c.cinemaId));
    }
    return map;
  }, [cinemas]);

  const resolveCinemaId = (cinemaName) => {
    const direct = screenings.find((s) => (s.cinemaName || '') === cinemaName)?.cinemaId;
    if (direct != null) return Number(direct);
    const byList = cinemaIdByName.get(String(cinemaName));
    return byList != null ? Number(byList) : null;
  };

  const showtimesPanel = (opts) => {
    const dense = !!opts?.dense;
    if (screenings.length === 0) {
      return <Typography color="text.secondary">No screenings available.</Typography>;
    }

    return (
      <Stack spacing={dense ? 1.25 : 2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Typography variant={dense ? 'subtitle1' : 'h5'} sx={{ fontWeight: 800 }}>
            Showtimes
          </Typography>
          <DatePicker
            label="Date"
            value={showDayjs}
            onChange={(v) => setShowDate(v ? v.format('YYYY-MM-DD') : ymdToday())}
            format="YYYY-MM-DD"
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: { xs: '100%', sm: 220 } },
              },
            }}
          />
        </Stack>

        {filteredScreenings.length === 0 ? (
          <Typography color="text.secondary">No showtimes on this date.</Typography>
        ) : null}

        <Stack spacing={dense ? 1.25 : 2}>
          {Array.from(grouped.entries()).map(([cinemaName, halls]) => (
            <Card key={cinemaName} variant="outlined" sx={{ bgcolor: 'background.paper' }}>
              <CardContent sx={{ py: dense ? 1.5 : 2 }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Typography variant="h6">{cinemaName}</Typography>
                  {(() => {
                    const cid = resolveCinemaId(cinemaName);
                    if (!cid) return null;
                    return (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/cinema/${cid}/movie/${movieId}`, { state: { from: 'movie' } })}
                      >
                        Halls & times
                      </Button>
                    );
                  })()}
                </Stack>
                <Divider sx={{ my: dense ? 1 : 1.5 }} />
                <Stack spacing={1.25}>
                  {Array.from(halls.entries()).map(([hallName, times]) => (
                    <Box key={hallName}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.75 }}>
                        {hallName}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {times.map((s) => (
                          <Button
                            key={s.screeningId}
                            variant="contained"
                            size="small"
                            onClick={() =>
                              navigate(`/screenings/${s.screeningId}/seats`, {
                                state: {
                                  from: 'movieDetail',
                                  movieId,
                                  cinemaId: Number(s.cinemaId),
                                  screeningId: Number(s.screeningId),
                                },
                              })
                            }
                            sx={{ mb: 1 }}
                          >
                            {fmtTime(s.startTime)}
                          </Button>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
    );
  };

  if (loading) {
    return (
      <Container className="mx-auto max-w-6xl px-4" sx={{ py: 4 }}>
        <Typography color="text.secondary">Loading…</Typography>
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container className="mx-auto max-w-6xl px-4" sx={{ py: 4 }}>
        <Typography variant="h5">Movie not found.</Typography>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate('/')}>
          Back
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          borderBottom: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, minHeight: 420 }}>
          <Box sx={{ opacity: 0.18, filter: 'blur(2px)', height: '100%' }}>
            <PosterImage
              src={movie.posterUrl}
              alt={movie.title}
              height="100%"
              sx={{ minHeight: 420, width: '100%' }}
            />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.72) 55%, rgba(0,0,0,0.25) 100%)',
            }}
          />
        </Box>

        <Container className="mx-auto max-w-6xl px-4" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Button variant="contained" onClick={() => navigate(backTarget)} sx={{ mb: 2 }}>
            Back to movies
          </Button>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
            <Box sx={{ width: { xs: '100%', md: 280 }, maxWidth: 320, flex: '0 0 auto' }}>
              <Stack spacing={2}>
                <Card sx={{ overflow: 'hidden' }}>
                  <PosterImage src={movie.posterUrl} alt={movie.title} height={420} />
                </Card>

                {showtimesPanel({ dense: true })}
              </Stack>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  {movie.movieVersion && (
                    <Chip label={versionLabel(movie.movieVersion)} color="primary" size="small" />
                  )}
                  {movie.genre && <Chip label={movie.genre} variant="outlined" size="small" />}
                  {movie.runtimeMinutes != null && (
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={`${movie.runtimeMinutes} min`}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {movie.premieredAt && (
                    <Chip
                      icon={<EventIcon />}
                      label={prettyYear(movie.premieredAt)}
                      variant="outlined"
                      size="small"
                    />
                  )}
                  {movie.mainCharacter && (
                    <Chip
                      icon={<PersonIcon />}
                      label={movie.mainCharacter}
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Stack>

                <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                  {movie.title}
                </Typography>

                {(movie.description || movie.plot) && (
                  <Stack spacing={1} sx={{ maxWidth: 900 }}>
                    {movie.description && (
                      <Typography variant="body1" color="text.secondary">
                        {movie.description}
                      </Typography>
                    )}
                    {movie.plot && movie.plot !== movie.description && (
                      <Typography variant="body2" color="text.secondary">
                        {movie.plot}
                      </Typography>
                    )}
                  </Stack>
                )}
              </Stack>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

