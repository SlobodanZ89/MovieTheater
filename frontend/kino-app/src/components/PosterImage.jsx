import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { posterSrcOrPlaceholder, POSTER_PLACEHOLDER } from '../utils/posterUrl';

export default function PosterImage({ src, alt, height = 360, sx }) {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setUseFallback(false);
  }, [src]);

  const image = useFallback ? POSTER_PLACEHOLDER : posterSrcOrPlaceholder(src);

  return (
    <Box
      component="img"
      src={image}
      alt={alt || ''}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setUseFallback(true)}
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
