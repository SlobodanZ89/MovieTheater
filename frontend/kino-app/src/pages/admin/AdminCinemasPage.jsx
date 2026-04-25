import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { createCinema, deleteCinema, fetchCinemas } from '../../features/cinemas/cinemaSlice';
import { ToastContext } from '../../ui/ToastProvider';

export default function AdminCinemasPage() {
  const dispatch = useDispatch();
  const { notify } = useContext(ToastContext);
  const { list, status, error } = useSelector((s) => s.cinemas);

  const [form, setForm] = useState({
    name: '',
    address: '',
    manager: '',
    maxHalls: '',
  });

  useEffect(() => {
    dispatch(fetchCinemas());
  }, [dispatch]);

  useEffect(() => {
    if (status === 'failed' && error) notify(error, 'error');
  }, [status, error, notify]);

  const rows = useMemo(
    () =>
      list.map((c) => ({
        id: c.cinemaId,
        cinemaId: c.cinemaId,
        name: c.name,
        address: c.address,
        manager: c.manager,
        maxHalls: c.maxHalls,
      })),
    [list]
  );

  const columns = useMemo(
    () => [
      { field: 'cinemaId', headerName: 'ID', width: 90 },
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
      { field: 'address', headerName: 'Address', flex: 1, minWidth: 220 },
      { field: 'manager', headerName: 'Manager', width: 180 },
      { field: 'maxHalls', headerName: 'MaxHalls', width: 120, type: 'number' },
      {
        field: 'actions',
        headerName: '',
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Button
            color="error"
            size="small"
            onClick={async () => {
              try {
                await dispatch(deleteCinema(params.row.cinemaId)).unwrap();
                notify('Cinema deleted.', 'success');
              } catch (err) {
                notify(err?.message || 'Failed to delete cinema.', 'error');
              }
            }}
          >
            Delete
          </Button>
        ),
      },
    ],
    [dispatch, notify]
  );

  return (
    <Container className="mx-auto max-w-6xl px-4" sx={{ py: 4 }}>
      <Box className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <Box>
          <Typography variant="h4">Admin · Cinemas</Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage cinemas.
          </Typography>
        </Box>
      </Box>

      <Box className="grid gap-3 md:grid-cols-5" sx={{ mt: 3 }}>
        <Card className="md:col-span-2">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Add cinema
            </Typography>
            <Box className="grid gap-3">
              <TextField
                label="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="Manager"
                value={form.manager}
                onChange={(e) => setForm((f) => ({ ...f, manager: e.target.value }))}
                fullWidth
                required
              />
              <TextField
                label="MaxHalls"
                type="number"
                value={form.maxHalls}
                onChange={(e) => setForm((f) => ({ ...f, maxHalls: e.target.value }))}
                fullWidth
                required
              />
              <Button
                variant="contained"
                onClick={async () => {
                  try {
                    await dispatch(
                      createCinema({ ...form, maxHalls: Number(form.maxHalls) })
                    ).unwrap();
                    notify('Cinema created.', 'success');
                    setForm({ name: '', address: '', manager: '', maxHalls: '' });
                  } catch (err) {
                    notify(err?.message || 'Failed to create cinema.', 'error');
                  }
                }}
              >
                Create
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Cinemas
            </Typography>
            <Box sx={{ height: 520, width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                loading={status === 'loading'}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 10, page: 0 } },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

