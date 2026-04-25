import React, { createContext, useCallback, useMemo, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

export const ToastContext = createContext({
  notify: () => {},
});

export function ToastProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const notify = useCallback((message, severity = 'info') => {
    setState({ open: true, message: String(message ?? ''), severity });
  }, []);

  const handleClose = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        onClose={handleClose}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={state.severity} variant="filled" sx={{ width: '100%' }}>
          {state.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

