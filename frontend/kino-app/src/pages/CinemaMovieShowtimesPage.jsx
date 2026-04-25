import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Container, Divider, Stack, Typography } from '@mui/material';
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

export default function CinemaMovieShowtimesPage() {
  const { cinemaId, movieId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useContext(ToastContext);

  const cId = Number(cinemaId);
  const mId = Number(movieId);

  const [cinema, setCinema] = useState(null);
  const [movie, setMovie] = useState(null);
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDate, setShowDate] = useState(() => ymdToday());

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([http.get(`/cinema/${cId}`), http.get('/movie'), http.get('/screenings')])
      .then(([cinemaRes, moviesRes, screeningsRes]) => {
        if (!mounted) return;
        setCinema(cinemaRes.data ?? null);
        const movies = Array.isArray(moviesRes.data) ? moviesRes.data : [];
        setMovie(movies.find((m) => Number(m.movieId) === mId) ?? null);
        const all = Array.isArray(screeningsRes.data) ? screeningsRes.data : [];
        const forCinemaMovie = all.filter((s) => Number(s.cinemaId) === cId && Number(s.movieId) === mId);
        setScreenings(forCinemaMovie);
        setShowDate(pickDefaultShowDateYmd(forCinemaMovie));
      })
      .catch((err) => {
        notify(err.backendMessage || 'Failed to load showtimes.', 'error');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [cId, mId, notify]);

  const showDateObj = useMemo(() => parseYmdToLocalDate(showDate), [showDate]);
  const showDayjs = useMemo(() => dayjs(showDateObj), [showDateObj]);

  const filteredScreenings = useMemo(() => {
    return screenings.filter((s) => {
      const t = new Date(s.startTime);
      if (Number.isNaN(t.getTime())) return false;
      return sameLocalDay(t, showDateObj);
    });
  }, [screenings, showDateObj]);

  const groupedByHall = useMemo(() => {
    const byHall = new Map();
    for (const s of filteredScreenings) {
      const hall = s.hallName || `Hall ${s.hallId ?? ''}`.trim();
      if (!byHall.has(hall)) byHall.set(hall, []);
      byHall.get(hall).push(s);
    }
    for (const [, arr] of byHall) {
      arr.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
    }
    return byHall;
  }, [filteredScreenings]);

  if (loading) {
    return (
      <Container className="mx-auto max-w-6xl px-4" sx={{ py: 4 }}>
        <Typography color="text.secondary">Loading…</Typography>
      </Container>
    );
  }

  return (
    <Container className="mx-auto max-w-6xl px-4" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button variant="contained" onClick={() => navigate(`/cinema/${cId}`)} sx={{ mb: 0.5 }}>
            Back to cinema
          </Button>
          {cinema?.name && (
            <Typography color="text.secondary" sx={{ ml: 1 }}>
              {cinema.name}
            </Typography>
          )}
        </Stack>

        {!movie ? (
          <Typography variant="h5">Movie not found.</Typography>
        ) : (
          <Card sx={{ overflow: 'hidden', borderRadius: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' } }}>
              <PosterImage src={movie.posterUrl} alt={movie.title} height={420} />
              <Box sx={{ p: 2.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: -0.4 }}>
                  {movie.title}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  {movie.premieredAt} • {versionLabel(movie.movieVersion)}
                  {movie.runtimeMinutes != null ? ` • ${movie.runtimeMinutes} min` : ''}
                </Typography>
                {(movie.description || movie.plot) && (
                  <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                    {movie.description || movie.plot}
                  </Typography>
                )}
              </Box>
            </Box>
          </Card>
        )}

        <Box>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="flex-start"
            flexWrap="wrap"
            sx={{ mb: 1 }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, mr: { sm: 1 } }}>
              Halls & showtimes
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
          {!movie ? null : screenings.length === 0 ? (
            <Typography color="text.secondary">No screenings for this movie in this cinema.</Typography>
          ) : filteredScreenings.length === 0 ? (
            <Typography color="text.secondary">No showtimes on this date.</Typography>
          ) : (
            <Stack spacing={2}>
              {Array.from(groupedByHall.entries()).map(([hallName, times]) => (
                <Card key={hallName}>
                  <CardContent>
                    <Typography variant="h6">{hallName}</Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {times.map((s) => (
                        <Button
                          key={s.screeningId}
                          variant="contained"
                          size="small"
                          onClick={() =>
                            navigate(`/screenings/${s.screeningId}/seats`, {
                              state: {
                                from: 'cinemaShowtimes',
                                movieId: mId,
                                cinemaId: cId,
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
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Container>
  );
}

