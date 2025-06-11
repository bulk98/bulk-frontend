// src/components/communities/CommunityCardSkeleton.jsx
import React from 'react';
import { Card, CardContent, Skeleton, Stack, Grid } from '@mui/material';

const CommunityCardSkeleton = () => {
    return (
        <Card sx={{ height: '100%' }}>
            <Skeleton variant="rectangular" height={120} />
            <CardContent>
                <Stack spacing={1}>
                    <Skeleton variant="text" sx={{ fontSize: '1.25rem' }} width="80%" />
                    <Skeleton variant="rectangular" height={60} />
                    <Skeleton variant="text" width="50%" />
                </Stack>
            </CardContent>
        </Card>
    );
};

export default CommunityCardSkeleton;