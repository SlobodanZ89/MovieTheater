import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { http } from '../../api/http';
import { ToastContext } from '../../ui/ToastProvider';

function fmtLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function toLocalDateTimeInputValue(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminScreeningsPage() {
  const { notify } = useContext(ToastContext);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 90);
    d.setSeconds(0, 0);
    return {
      cinemaId: '',
      hallId: '',
      movieId: '',
      startTimeLocal: toLocalDateTimeInputValue(d),
    };
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([http.get('/movie'), http.get('/cinema'), http.get('/screenings')])
      .then(([mRes, cRes, sRes]) => {
        if (!mounted) return;
        setMovies(Array.isArray(mRes.data) ? mRes.data : []);
        setCinemas(Array.isArray(cRes.data) ? cRes.data : []);
        setScreenings(Array.isArray(sRes.data) ? sRes.data : []);
      })
      .catch((err) => notify(err.backendMessage || 'Failed to load admin data.', 'error'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [notify]);

  const cinemaById = useMemo(() => {
    const map = new Map();
    for (const c of cinemas) map.set(Number(c.cinemaId), c);
    return map;
  }, [cinemas]);

  const selectedCinema = form.cinemaId ? cinemaById.get(Number(form.cinemaId)) : null;
  const halls = useMemo(() => {
    const list = selectedCinema?.hallList;
    return Array.isArray(list) ? list : [];
  }, [selectedCinema]);

  const movieById = useMemo(() => {
    const map = new Map();
    for (const m of movies) map.set(Number(m.movieId), m);
    return map;
  }, [movies]);

  const createScreening = async () => {
    const payload = {
      movieId: Number(form.movieId),
      hallId: Number(form.hallId),
      startTime: form.startTimeLocal,
    };

    setSaving(true);
    try {
      await http.post('/screenings', payload);
      notify('Screening created.', 'success');
      const sRes = await http.get('/screenings');
      setScreenings(Array.isArray(sRes.data) ? sRes.data : []);
    } catch (err) {
      notify(err.backendMessage || 'Failed to create screening.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const rows = useMemo(() => {
    const arr = Array.isArray(screenings) ? [...screenings] : [];
    arr.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
    return arr;
  }, [screenings]);

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
        <Box>
          <Typography variant="h4">Admin · Screenings</Typography>
          <Typography variant="body2" color="text.secondary">
            Create showtimes by picking a cinema, hall, movie, and start time.
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Create screening
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="cinema-label">Cinema</InputLabel>
                  <Select
                    labelId="cinema-label"
                    label="Cinema"
                    value={form.cinemaId}
                    onChange={(e) => setForm((f) => ({ ...f, cinemaId: e.target.value, hallId: '' }))}
                  >
                    {cinemas.map((c) => (
                      <MenuItem key={c.cinemaId} value={String(c.cinemaId)}>
                        {c.name} (#{c.cinemaId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth disabled={!form.cinemaId}>
                  <InputLabel id="hall-label">Hall</InputLabel>
                  <Select
                    labelId="hall-label"
                    label="Hall"
                    value={form.hallId}
                    onChange={(e) => setForm((f) => ({ ...f, hallId: e.target.value }))}
                  >
                    {halls.map((h) => (
                      <MenuItem key={h.hallId} value={String(h.hallId)}>
                        {h.name || `Hall #${h.hallId}`} (#{h.hallId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="movie-label">Movie</InputLabel>
                  <Select
                    labelId="movie-label"
                    label="Movie"
                    value={form.movieId}
                    onChange={(e) => setForm((f) => ({ ...f, movieId: e.target.value }))}
                  >
                    {movies
                      .slice()
                      .sort((a, b) => String(a.title).localeCompare(String(b.title)))
                      .map((m) => (
                        <MenuItem key={m.movieId} value={String(m.movieId)}>
                          {m.title} (#{m.movieId})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Start time"
                  type="datetime-local"
                  fullWidth
                  value={form.startTimeLocal}
                  onChange={(e) => setForm((f) => ({ ...f, startTimeLocal: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  disabled={saving || !form.cinemaId || !form.hallId || !form.movieId || !form.startTimeLocal}
                  onClick={createScreening}
                  sx={{ height: 56 }}
                >
                  Create
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {form.movieId ? `Movie: ${movieById.get(Number(form.movieId))?.title || ''}` : ' '}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6">Existing screenings</Typography>
            <Divider sx={{ my: 2 }} />
            {rows.length === 0 ? (
              <Typography color="text.secondary">No screenings yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {rows.slice(0, 50).map((s) => (
                  <Box key={s.screeningId} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      #{s.screeningId} · {s.movieTitle || `Movie #${s.movieId}`} · {s.cinemaName || `Cinema #${s.cinemaId}`} · {s.hallName || `Hall #${s.hallId}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {fmtLocal(s.startTime)}
                    </Typography>
                  </Box>
                ))}
                {rows.length > 50 ? (
                  <Typography variant="caption" color="text.secondary">
                    Showing first 50.
                  </Typography>
                ) : null}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

