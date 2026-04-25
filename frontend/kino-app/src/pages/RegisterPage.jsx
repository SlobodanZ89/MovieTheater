import React, { useContext, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { http } from '../api/http';
import { AuthContext } from '../auth/AuthContext';
import { ToastContext } from '../ui/ToastProvider';

export default function RegisterPage() {
  const { setAuth } = useContext(AuthContext);
  const { notify } = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = useMemo(() => {
    const stateFrom = location.state?.from;
    if (stateFrom?.pathname) {
      return `${stateFrom.pathname || ''}${stateFrom.search || ''}${stateFrom.hash || ''}`;
    }
    return '/';
  }, [location.state]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <Container className="mx-auto max-w-2xl px-4" sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Create account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Registers a user via the backend and signs you in.
          </Typography>

          <Box className="grid gap-4">
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              autoComplete="username"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              autoComplete="new-password"
            />
            <TextField
              label="Confirm password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              fullWidth
              autoComplete="new-password"
            />

            <Button
              variant="contained"
              disabled={loading}
              onClick={async () => {
                const u = username.trim();
                const p = password.trim();
                if (!u || !p) {
                  notify('Username and password are required.', 'warning');
                  return;
                }
                if (p !== confirm) {
                  notify('Passwords do not match.', 'warning');
                  return;
                }

                setLoading(true);
                try {
                  const res = await http.post('/auth/register', { username: u, password: p });
                  const token = res.data?.token;
                  const role = res.data?.role;
                  if (!token || !role) {
                    notify('Registration failed: missing token/role.', 'error');
                    return;
                  }
                  setAuth({ token, role });
                  notify('Account created.', 'success');
                  navigate(from, { replace: true });
                } catch (err) {
                  notify(err.backendMessage || 'Registration failed.', 'error');
                } finally {
                  setLoading(false);
                }
              }}
            >
              Create account
            </Button>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button variant="text" component={Link} to="/login" state={{ from: location.state?.from }}>
                Back to login
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

