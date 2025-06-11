// src/components/posts/PostCardSkeleton.jsx
import React from 'react';
import { Card, CardContent, Skeleton, Box, Stack } from '@mui/material';

const PostCardSkeleton = () => {
    return (
        <Card variant="outlined" sx={{ display: 'flex', width: '100%' }}>
            <Skeleton 
                variant="rectangular" 
                sx={{ 
                    width: 150, 
                    minWidth: 150, 
                    aspectRatio: '1 / 1' 
                }} 
            />
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
                <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="text" width="40%" />
                    </Stack>
                    <Skeleton variant="text" sx={{ fontSize: '1.25rem' }} />
                    <Skeleton variant="rectangular" height={40} />
                    <Skeleton variant="text" width="60%" />
                </Stack>
            </CardContent>
        </Card>
    );
};

// ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ PRESENTE AL FINAL DEL ARCHIVO
export default PostCardSkeleton;