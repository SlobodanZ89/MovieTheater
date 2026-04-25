// HallDetailPage.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHallById, updateHall } from '../features/halls/hallSlice';
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
    Card,
    CardContent,
} from '@mui/material';

const movieVersions = [
    { value: 'D2D', label: 'Digital 2D' },
    { value: 'R3D', label: 'Real D 3D' },
    { value: 'DBOX', label: 'D-Box 5D' },
];

const HallDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { notify } = React.useContext(ToastContext);
    const { role } = useContext(AuthContext);
    const isAdmin = useMemo(() => role === 'ROLE_ADMIN', [role]);

    const { current: hall, status, error } = useSelector((state) => state.halls);

    const [showForm, setShowForm] = useState(false);
    const [originalVersion, setOriginalVersion] = useState(null);
    const [form, setForm] = useState({
        rows: '',
        cols: '',
        layoutRowsText: '',
        supportedMovieVersion: '',
    });

    // Fetch hall on mount
    useEffect(() => {
        dispatch(fetchHallById(id));
    }, [dispatch, id]);

    // Fill form when hall loads
    useEffect(() => {
        if (hall) {
            setOriginalVersion(hall.supportedMovieVersion);
            setForm({
                rows: hall.rows,
                cols: hall.cols,
                layoutRowsText: Array.isArray(hall.layoutRows) ? hall.layoutRows.join('\n') : '',
                supportedMovieVersion: hall.supportedMovieVersion,
            });
        }
    }, [hall]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleSelectChange = (value) => setForm({ ...form, supportedMovieVersion: value });

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        if (
            originalVersion &&
            form.supportedMovieVersion !== originalVersion &&
            !(originalVersion === 'DBOX' && form.supportedMovieVersion === 'R3D')
        ) {
            notify('Only a version change from DBOX → R3D is allowed.', 'warning');
            return;
        }

        const payload = {
            rows: Number(form.rows),
            cols: Number(form.cols),
            layoutRows: form.layoutRowsText
                .split('\n')
                .map((s) => s.trim())
                .filter((s) => s.length > 0),
            supportedMovieVersion: form.supportedMovieVersion,
        };

        const resultAction = await dispatch(updateHall({ id, hallData: payload }));
        if (updateHall.fulfilled.match(resultAction)) {
            setShowForm(false);
            notify('Hall updated.', 'success');
        } else {
            notify(resultAction.payload?.message || 'Failed to update hall.', 'error');
        }
    };

    if (status === 'loading') return <p>Loading...</p>;
    if (!hall) return <p>No hall found</p>;

    return (
        <Container sx={{ mt: 4 }}>
            <Button variant="contained" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                Back to Cinema
            </Button>

            {status === 'failed' && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {typeof error === 'string' ? error : error?.message}
                </Typography>
            )}

            {!showForm ? (
                <Card>
                    <CardContent>
                        <Typography variant="h4" gutterBottom>
                            Hall #{hall.hallId}
                        </Typography>
                        <Typography>Rows: {hall.rows}</Typography>
                        <Typography>Cols: {hall.cols}</Typography>
                        <Typography>Capacity: {hall.capacity}</Typography>
                        <Typography>Supported Movie Version: {hall.supportedMovieVersion}</Typography>
                        {Array.isArray(hall.layoutRows) && hall.layoutRows.length > 0 && (
                            <Typography sx={{ mt: 1 }} variant="body2" color="text.secondary">
                                Layout rows: {hall.layoutRows.length} lines
                            </Typography>
                        )}

                        {isAdmin && (
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ mt: 2 }}
                                onClick={() => setShowForm(true)}
                            >
                                Update
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : isAdmin ? (
                <form onSubmit={handleUpdateSubmit}>
                    <Grid container spacing={2}>
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
                        <Grid item xs={12}>
                            <TextField
                                label="Layout rows (one string per row, only 0/1)"
                                name="layoutRowsText"
                                value={form.layoutRowsText}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                minRows={4}
                                helperText="0 = aisle, 1 = seat. Must match exactly: number of lines = rows, each line length = cols."
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth required>
                                <InputLabel>Supported Movie Version</InputLabel>
                                <Select
                                    value={form.supportedMovieVersion}
                                    onChange={(e) => handleSelectChange(e.target.value)}
                                    disabled={Boolean(originalVersion && originalVersion !== 'DBOX')}
                                >
                                    {(originalVersion === 'DBOX'
                                        ? movieVersions.filter((v) => v.value === 'DBOX' || v.value === 'R3D')
                                        : movieVersions
                                    ).map((version) => (
                                        <MenuItem key={version.value} value={version.value}>
                                            {version.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {originalVersion && originalVersion !== 'DBOX' && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Version changes are blocked unless the current version is DBOX.
                                    </Typography>
                                )}
                                {originalVersion === 'DBOX' && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                        Allowed change: DBOX → R3D.
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Button type="submit" variant="contained" color="primary" sx={{ mr: 2 }}>
                                Save
                            </Button>
                            <Button variant="outlined" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            ) : (
                <Typography color="text.secondary">
                    Login as admin to edit halls.
                </Typography>
            )}
        </Container>
    );
};

export default HallDetailPage;
