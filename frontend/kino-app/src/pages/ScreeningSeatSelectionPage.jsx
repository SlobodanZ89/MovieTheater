import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Card, CardContent, Container, Divider, Stack, Typography } from '@mui/material';
import { http } from '../api/http';
import SeatMap from '../components/SeatMap';
import { ToastContext } from '../ui/ToastProvider';
import { AuthContext } from '../auth/AuthContext';

const PENDING_BOOKING_KEY = 'pendingBooking';

export default function ScreeningSeatSelectionPage() {
  const { id } = useParams();
  const { notify } = useContext(ToastContext);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [seatMap, setSeatMap] = useState(null);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [backMovieId, setBackMovieId] = useState(() =>
    location.state?.movieId != null ? Number(location.state.movieId) : null
  );
  const [backCinemaId, setBackCinemaId] = useState(() =>
    location.state?.cinemaId != null ? Number(location.state.cinemaId) : null
  );
  const [backFrom, setBackFrom] = useState(() => (location.state?.from ? String(location.state.from) : null));

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_BOOKING_KEY);
      if (!raw) return;
      const pending = JSON.parse(raw);
      if (!pending || String(pending.screeningId) !== String(id)) return;
      if (Array.isArray(pending.selectedSeats) && pending.selectedSeats.length > 0) {
        setSelected(pending.selectedSeats);
      }
      if (pending.movieId != null) setBackMovieId(Number(pending.movieId));
      if (pending.cinemaId != null) setBackCinemaId(Number(pending.cinemaId));
      if (pending.from != null) setBackFrom(String(pending.from));
    } catch {
      // ignore invalid session storage
    }
  }, [id]);

  useEffect(() => {
    let mounted = true;
    http
      .get(`/screenings/${id}/seat-map`)
      .then((res) => {
        if (!mounted) return;
        setSeatMap(res.data);
      })
      .catch((err) => {
        notify(err.backendMessage || 'Failed to load seat map.', 'error');
      });
    return () => {
      mounted = false;
    };
  }, [id, notify]);

  const selectedLabel = useMemo(() => {
    if (!selected.length) return 'None';
    return selected.map((s) => `R${s.row + 1}-S${s.col + 1}`).join(', ');
  }, [selected]);

  return (
    <Container className="mx-auto max-w-6xl px-4" sx={{ py: 4 }}>
      <Button
        variant="contained"
        onClick={() => {
          if (backFrom === 'cinemaShowtimes' && backCinemaId && backMovieId) {
            navigate(`/cinema/${backCinemaId}/movie/${backMovieId}`);
            return;
          }
          if (backMovieId) {
            navigate(`/movie/${backMovieId}`);
            return;
          }
          navigate(-1);
        }}
        sx={{ mb: 2 }}
      >
        Back to movie
      </Button>
      <Box className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Box>
          <Typography variant="h4">Seat selection</Typography>
          <Typography variant="body2" color="text.secondary">
            Screening #{id}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Selected: {selectedLabel}
        </Typography>
      </Box>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <SeatMap seatMap={seatMap} selectedSeats={selected} onSelectionChange={setSelected} />
          {!seatMap && (
            <Typography sx={{ mt: 2 }} color="text.secondary">
              Loading…
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mt: 2, position: 'sticky', bottom: 12 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {selected.length} seat{selected.length === 1 ? '' : 's'} selected
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selected.length ? selectedLabel : 'Pick your seats to continue.'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
              <Button
                variant="contained"
                disabled={!seatMap || selected.length === 0 || saving}
                onClick={async () => {
                  if (!isAuthenticated) {
                    notify('Please login to confirm booking.', 'warning');
                    try {
                      sessionStorage.setItem(
                        PENDING_BOOKING_KEY,
                        JSON.stringify({
                          screeningId: Number(id),
                          selectedSeats: selected,
                          returnUrl: location.pathname + location.search,
                          movieId: backMovieId,
                          cinemaId: backCinemaId,
                          from: backFrom,
                        })
                      );
                    } catch {
                      // ignore storage errors
                    }
                    navigate('/login', { state: { from: location } });
                    return;
                  }
                  setSaving(true);
                  try {
                    await http.post('/bookings', {
                      screeningId: Number(id),
                      seats: selected.map((s) => ({ rowIdx: s.row, colIdx: s.col })),
                    });
                    notify('Booking confirmed.', 'success');
                    try {
                      sessionStorage.removeItem(PENDING_BOOKING_KEY);
                    } catch {
                      // ignore storage errors
                    }
                    const res = await http.get(`/screenings/${id}/seat-map`);
                    setSeatMap(res.data);
                    setSelected([]);
                  } catch (err) {
                    notify(err.backendMessage || 'Failed to create booking.', 'error');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Confirm booking
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

