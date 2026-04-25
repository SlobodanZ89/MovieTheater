import React, { useEffect, useMemo, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';

function keyOf(r, c) {
  return `${r},${c}`;
}

export default function SeatMap({
  seatMap,
  seatSize = 32,
  gap = 6,
  onSelectionChange,
  selectedSeats,
}) {
  const [selected, setSelected] = useState(() => new Set());

  const rows = seatMap?.length ?? 0;
  const cols = seatMap?.[0]?.length ?? 0;

  useEffect(() => {
    if (!Array.isArray(selectedSeats)) return;
    const next = new Set(selectedSeats.map((s) => keyOf(s.row, s.col)));
    setSelected(next);
  }, [selectedSeats]);

  const selectedArray = useMemo(() => {
    return Array.from(selected).map((k) => {
      const [r, c] = k.split(',').map(Number);
      return { row: r, col: c };
    });
  }, [selected]);

  const emit = (nextSet) => {
    if (typeof onSelectionChange === 'function') {
      const nextArray = Array.from(nextSet).map((k) => {
        const [r, c] = k.split(',').map(Number);
        return { row: r, col: c };
      });
      onSelectionChange(nextArray);
    }
  };

  if (!Array.isArray(seatMap) || rows === 0 || cols === 0) {
    return null;
  }

  return (
    <Box>
      <Box
        sx={{
          mx: 'auto',
          width: 'min(720px, 100%)',
          height: 44,
          borderRadius: '999px',
          background:
            'radial-gradient(80% 160% at 50% 0%, rgba(229,9,20,0.45) 0%, rgba(229,9,20,0.10) 45%, rgba(0,0,0,0) 70%)',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          transform: 'perspective(800px) rotateX(32deg)',
        }}
      >
        <Box sx={{ fontSize: 12, letterSpacing: 2, color: 'text.secondary' }}>SCREEN</Box>
      </Box>

      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${seatSize}px)`,
            gap: `${gap}px`,
            alignItems: 'center',
            width: 'fit-content',
            maxWidth: '100%',
            overflowX: 'auto',
            py: 1,
          }}
        >
        {seatMap.map((row, r) =>
          row.map((cell, c) => {
            if (cell === 0) {
              return <Box key={keyOf(r, c)} sx={{ width: seatSize, height: seatSize }} />;
            }

            if (cell === 2) {
              return (
                <Tooltip key={keyOf(r, c)} title="Occupied">
                  <span>
                    <IconButton
                      size="small"
                      disabled
                      sx={{
                        width: seatSize,
                        height: seatSize,
                        borderRadius: 2,
                        color: 'error.main',
                        opacity: 0.9,
                      }}
                    >
                      <EventSeatIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              );
            }

            const k = keyOf(r, c);
            const isSelected = selected.has(k);

            return (
              <Tooltip
                key={k}
                title={isSelected ? `Selected (Row ${r + 1}, Seat ${c + 1})` : `Row ${r + 1}, Seat ${c + 1}`}
              >
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (next.has(k)) next.delete(k);
                      else next.add(k);
                      emit(next);
                      return next;
                    });
                  }}
                  sx={{
                    width: seatSize,
                    height: seatSize,
                    borderRadius: 2,
                    color: isSelected ? 'success.main' : 'grey.400',
                    bgcolor: isSelected ? 'rgba(18, 183, 106, 0.14)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid',
                    borderColor: isSelected ? 'rgba(18, 183, 106, 0.35)' : 'rgba(255,255,255,0.12)',
                    '&:hover': {
                      bgcolor: isSelected ? 'rgba(18, 183, 106, 0.18)' : 'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  <EventSeatIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            );
          })
        )}
        </Box>
      </Box>
    </Box>
  );
}

