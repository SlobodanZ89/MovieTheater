import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { posterSrcOrPlaceholder, POSTER_PLACEHOLDER } from '../utils/posterUrl';

export default function PosterImage({ src, alt, height = 360, sx }) {
  const [errorCount, setErrorCount] = useState(0);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    setErrorCount(0);
    setReloadToken(0);
  }, [src]);

  const normalized = posterSrcOrPlaceholder(src);
  const shouldFallback = errorCount >= 3 || normalized === POSTER_PLACEHOLDER;
  const baseImage = shouldFallback ? POSTER_PLACEHOLDER : normalized;

  // Force a re-request on transient failures (e.g. backend restart),
  // without permanently locking into the fallback after a single error.
  const image =
    !shouldFallback && typeof baseImage === 'string' && baseImage.startsWith('http')
      ? `${baseImage}${baseImage.includes('?') ? '&' : '?'}_imgReload=${reloadToken}`
      : baseImage;

  return (
    <Box
      component="img"
      src={image}
      alt={alt || ''}
      loading="lazy"
      referrerPolicy="no-referrer"
      onLoad={() => setErrorCount(0)}
      onError={() => {
        setErrorCount((c) => {
          const next = c + 1;
          if (next < 3) {
            // small delay helps if backend/CDN is still starting up
            setTimeout(() => setReloadToken((t) => t + 1), 600);
          }
          return next;
        });
      }}
      sx={{
        display: 'block',
        width: '100%',
        height,
        objectFit: 'cover',
        ...sx,
      }}
    />
  );
}
