import React, { useContext, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import { ToastContext } from '../ui/ToastProvider';
import { http } from '../api/http';

const PENDING_BOOKING_KEY = 'pendingBooking';

export default function LoginPage() {
  const { setAuth } = useContext(AuthContext);
  const { notify } = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => {
    const stateFrom = location.state?.from;
    if (stateFrom?.pathname) {
      return `${stateFrom.pathname || ''}${stateFrom.search || ''}${stateFrom.hash || ''}`;
    }
    const params = new URLSearchParams(location.search || '');
    const returnUrl = params.get('returnUrl');
    if (returnUrl) return returnUrl;
    try {
      const raw = sessionStorage.getItem(PENDING_BOOKING_KEY);
      if (raw) {
        const pending = JSON.parse(raw);
        if (pending?.returnUrl) return pending.returnUrl;
      }
    } catch {
      // ignore invalid session storage
    }
    return '/';
  }, [location.state, location.search]);

  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('user');
  const [loading, setLoading] = useState(false);

  return (
    <Container className="mx-auto max-w-2xl px-4" sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Admin login using JWT (Spring Boot).
          </Typography>

          <Box className="grid gap-4">
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />

            <Button
              variant="contained"
              disabled={loading}
              onClick={async () => {
                if (!username.trim() || !password.trim()) {
                  notify('Username and password are required.', 'warning');
                  return;
                }
                setLoading(true);
                try {
                  const res = await http.post('/auth/login', {
                    username: username.trim(),
                    password: password.trim(),
                  });
                  const token = res.data?.token;
                  const role = res.data?.role;
                  if (!token || !role) {
                    notify('Login failed: missing token/role.', 'error');
                    return;
                  }
                  setAuth({ token, role });
                  notify('Signed in.', 'success');
                  navigate(from, { replace: true });
                } catch (err) {
                  notify(err.backendMessage || 'Login failed.', 'error');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Sign in
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

