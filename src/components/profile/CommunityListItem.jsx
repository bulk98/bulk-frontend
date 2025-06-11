import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Paper, Avatar, Typography, Box, Stack, Button } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';

const CommunityListItem = ({ community }) => {
    return (
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
                variant="rounded" 
                src={community.logoUrl}
                sx={{ width: 60, height: 60, bgcolor: 'primary.light' }}
            >
                {community.name.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {community.name}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
                    <PeopleIcon sx={{ fontSize: '1rem' }} />
                    <Typography variant="body2">
                        {community._count?.memberships || 0} Miembros
                    </Typography>
                </Stack>
            </Box>
            <Button component={RouterLink} to={`/comunidades/${community.id}`} variant="outlined" size="small">
                Visitar
            </Button>
        </Paper>
    );
};

export default CommunityListItem;