// src/components/posts/ArticlePostItemSkeleton.jsx
import React from 'react';
import { Box, Skeleton, Stack, Grid } from '@mui/material';

const ArticlePostItemSkeleton = () => {
  return (
    <Box sx={{ py: 2.5 }}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Columna Izquierda: Esqueleto de Texto */}
        <Grid item xs={12} md={8}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Skeleton variant="rounded" width={40} height={40} />
              <Stack sx={{flex: 1}}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
              </Stack>
            </Stack>
            <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} />
            <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} width="80%"/>
            <Stack direction="row" spacing={2} sx={{pt: 1}}>
              <Skeleton variant="text" width={50} />
              <Skeleton variant="text" width={50} />
            </Stack>
          </Stack>
        </Grid>
        {/* Columna Derecha: Esqueleto de Imagen */}
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" sx={{
            width: '100%',
            aspectRatio: '1 / 1',
            borderRadius: 2,
          }} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ArticlePostItemSkeleton;