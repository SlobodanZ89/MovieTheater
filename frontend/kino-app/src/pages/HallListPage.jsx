import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addHallToCurrentCinema, fetchCinemaById } from '../features/cinemas/cinemaSlice';
import { createHall } from '../features/halls/hallSlice';
import { ToastContext } from '../ui/ToastProvider';
import { AuthContext } from '../auth/AuthContext';
import {
    Container,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
} from '@mui/material';

const movieVersions = [
    { value: 'D2D', label: 'Digital 2D' },
    { value: 'R3D', label: 'Real D 3D' },
    { value: 'DBOX', label: 'D-Box 5D' },
];

const HallListPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { notify } = React.useContext(ToastContext);
    const { current: cinema, status } = useSelector((state) => state.cinemas);
    const hallStatus = useSelector((state) => state.halls.status);
    const { role } = useContext(AuthContext);
    const isAdmin = useMemo(() => role === 'ROLE_ADMIN', [role]);

    const [form, setForm] = useState({
        cinemaId: id || '',
        rows: '',
        cols: '',
        layoutRowsText: '',
        supportedMovieVersion: '',
    });

    const [createdHall, setCreatedHall] = useState(null);
    const [openHallId, setOpenHallId] = useState('');

    useEffect(() => {
        if (id) {
            dispatch(fetchCinemaById(id));
            setForm((prev) => ({ ...prev, cinemaId: id }));
        }
    }, [dispatch, id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (value) => {
        setForm({ ...form, supportedMovieVersion: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const rows = Number(form.rows);
        const cols = Number(form.cols);
        const layoutRows = form.layoutRowsText
            .split('\n')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        const payload = {
            cinemaId: Number(form.cinemaId),
            rows,
            cols,
            layoutRows,
            supportedMovieVersion: form.supportedMovieVersion,
        };

        const resultAction = await dispatch(createHall(payload));

        // Check if the API call was successful
        if (createHall.fulfilled.match(resultAction)) {
            setCreatedHall(resultAction.payload);
            // Dispatch the action to add the new hall to the cinema's list
            dispatch(addHallToCurrentCinema(resultAction.payload));
            notify('Hall created.', 'success');

            // Reset the form
            setForm({
                cinemaId: id || '',
                rows: '',
                cols: '',
                layoutRowsText: '',
                supportedMovieVersion: '',
            });
        } else {
            notify(resultAction.payload?.message || 'Failed to create hall.', 'error');
        }
    };

    if (status === 'loading' || hallStatus === 'loading') return <p>Loading...</p>;

    return (
        <Container sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Halls {cinema?.name ? `for ${cinema.name}` : ''}
            </Typography>

            {!isAdmin ? (
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Login as admin to create or edit halls.
                </Typography>
            ) : (
                <>
                    <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Open hall by ID"
                                value={openHallId}
                                onChange={(e) => setOpenHallId(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    const hid = Number(openHallId);
                                    if (!hid) {
                                        notify('Enter a hall ID.', 'warning');
                                        return;
                                    }
                                    navigate(`/hall/${hid}`);
                                }}
                                sx={{ height: 56 }}
                            >
                                Open hall
                            </Button>
                        </Grid>
                    </Grid>

                    {Array.isArray(cinema?.hallList) && cinema.hallList.length > 0 ? (
                        <Grid container spacing={2} sx={{ mb: 1 }}>
                            {cinema.hallList.map((h) => (
                                <Grid item xs={12} md={4} key={h.hallId}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography sx={{ fontWeight: 800 }}>
                                            {h.name || `Hall #${h.hallId}`}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            #{h.hallId} · {h.rows}×{h.cols} · {h.supportedMovieVersion}
                                        </Typography>
                                        <Button
                                            variant="text"
                                            onClick={() => navigate(`/hall/${h.hallId}`)}
                                            sx={{ mt: 1 }}
                                        >
                                            Edit
                                        </Button>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    ) : null}

                    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                        <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Cinema ID"
                                name="cinemaId"
                                value={form.cinemaId}
                                onChange={handleChange}
                                fullWidth
                                required
                                disabled={!!id}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Rows"
                                name="rows"
                                type="number"
                                value={form.rows}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                label="Cols"
                                name="cols"
                                type="number"
                                value={form.cols}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl
                                fullWidth
                                required
                                variant="outlined"
                                sx={{ minWidth: 200 }}
                            >
                                <InputLabel id="movie-version-label">Supported Movie Version</InputLabel>
                                <Select
                                    labelId="movie-version-label"
                                    value={form.supportedMovieVersion}
                                    onChange={(e) => handleSelectChange(e.target.value)}
                                    label="Supported Movie Version"
                                    sx={{ minWidth: '100%', height: '56px' }}
                                >
                                    {movieVersions.map((version) => (
                                        <MenuItem key={version.value} value={version.value}>
                                            {version.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Layout rows (one string per row, only 0/1)"
                                name="layoutRowsText"
                                value={form.layoutRowsText}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                minRows={4}
                                placeholder={'Example for rows=3, cols=5:\n11111\n11011\n11111'}
                                helperText="0 = aisle, 1 = seat. Must match exactly: number of lines = rows, each line length = cols."
                            />
                            <Button
                                variant="outlined"
                                sx={{ mt: 1 }}
                                onClick={() => {
                                    const rows = Number(form.rows);
                                    const cols = Number(form.cols);
                                    if (!rows || !cols || rows <= 0 || cols <= 0) {
                                        notify('Set rows and cols first.', 'warning');
                                        return;
                                    }
                                    const line = '1'.repeat(cols);
                                    const text = Array.from({ length: rows }, () => line).join('\n');
                                    setForm((f) => ({ ...f, layoutRowsText: text }));
                                }}
                            >
                                Generate full seating layout
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                sx={{ height: '56px' }}
                            >
                                Create Hall
                            </Button>
                        </Grid>
                    </Grid>
                    </form>
                </>
            )}

            {createdHall && (
                <Paper sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="h6">Hall Created Successfully:</Typography>
                    <pre>{JSON.stringify(createdHall, null, 2)}</pre>
                </Paper>
            )}
        </Container>
    );
};

export default HallListPage;