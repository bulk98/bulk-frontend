// RUTA: src/components/posts/LockedPostCard.jsx

import React from 'react';
import { Paper, Box, Typography, Button, Stack, Chip, Tooltip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const LockedPostCard = ({ post, onSubscribeClick }) => {
  if (!post) return null;

  return (
    <Paper elevation={2} sx={{ p: 2, position: 'relative', overflow: 'hidden', borderRadius: 2, my: 1.5 }}>
      {/* Capa semi-transparente para dar efecto de "deshabilitado" */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          zIndex: 1
        }} 
      />
      <Stack sx={{ zIndex: 2, position: 'relative' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
            {post.title}
          </Typography>
          <Chip label="Premium" color="premium" size="small" icon={<LockIcon />} />
        </Stack>

        <Box sx={{ my: 3, textAlign: 'center' }}>
          <LockIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
          <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
            Suscríbete para desbloquear este post
          </Typography>
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} color="text.disabled">
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ThumbUpAltIcon sx={{ fontSize: '1.2rem' }} />
              <Typography variant="body2">{post.likesCount ?? 0}</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <ChatBubbleOutlineIcon sx={{ fontSize: '1.2rem' }} />
              <Typography variant="body2">{post._count?.comments ?? 0}</Typography>
            </Stack>
          </Stack>
          <Button variant="contained" color="premium" onClick={onSubscribeClick}>
            Suscribirse
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default LockedPostCard;