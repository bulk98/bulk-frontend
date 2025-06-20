import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link, IconButton, Tooltip, CircularProgress, Stack, Avatar, Grid, Chip, Button, Paper } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import LockIcon from '@mui/icons-material/Lock'; // <-- 1. Importar el ícono de candado

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// 2. Se añade la nueva prop 'onSubscribeClick'
const ArticlePostItem = ({ post, interaction, onLike, onComment, onShare, onImageClick, onSubscribeClick }) => {
  if (!post) return null;

  // 3. Lógica para detectar si el post está bloqueado
  // Comprueba si el contenido del post es el texto placeholder que envía el backend.
  const isLocked = post.content && post.content.startsWith("Este es contenido premium.");

  const [isExpanded, setIsExpanded] = useState(false);
  const characterLimit = 250;
  // La expansión de texto solo es posible si el post NO está bloqueado.
  const isExpandable = !isLocked && post.content && post.content.length > characterLimit;
  const displayedContent = isExpanded ? post.content : post.content?.substring(0, characterLimit);

  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es })
    : '';

  // 4. Componente para el placeholder del contenido bloqueado
  const LockedContentPlaceholder = (
    <Box
        onClick={onSubscribeClick}
        sx={{
            width: '100%',
            aspectRatio: '1 / 1', 
            bgcolor: 'action.hover',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            p: 2,
            border: '2px dashed',
            borderColor: 'divider',
            transition: 'background-color 0.3s',
            '&:hover': {
                backgroundColor: 'action.selected'
            }
        }}
    >
        <LockIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
        <Typography sx={{ mt: 1, fontWeight: 'bold', color: 'text.primary' }}>Contenido Premium</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Haz clic para suscribirte y ver</Typography>
    </Box>
  );

  const TextContent = (
    <Stack spacing={1.5} height="100%" direction="column">
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar variant="rounded" src={post.community?.logoUrl} sx={{ width: 40, height: 40 }} />
        <Box>
            <Link component={RouterLink} to={`/comunidades/${post.community?.id}`} sx={{ fontWeight: 'bold', color: 'text.primary' }} underline="hover">
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{post.community?.name}</Typography>
            </Link>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              publicado por{' '}
              <Link component={RouterLink} to={`/perfil/${post.author?.id}`} underline="hover">
                {post.author?.username ? `@${post.author.username}` : (post.author?.name || 'Usuario Anónimo')}
              </Link>
            </Typography>
        </Box>
      </Stack>
      
      {/* 5. El título solo es un enlace si el post NO está bloqueado */}
      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', wordBreak: 'break-word', pt: 1 }}>
        <Link 
            component={isLocked ? 'span' : RouterLink} 
            to={`/posts/${post.id}`} 
            underline="hover" 
            color="inherit" 
            sx={{ cursor: isLocked ? 'default' : 'pointer' }}
        >
          {post.title}
        </Link>
      </Typography>
      
      {/* 6. El contenido y el botón "Ver más" solo se muestran si el post NO está bloqueado */}
      {!isLocked && (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
              {displayedContent}
              {isExpandable && !isExpanded && '...'}
            </Typography>
          {isExpandable && (
                <Button size="small" onClick={() => setIsExpanded(!isExpanded)} sx={{ alignSelf: 'flex-start', p: 0, mt: 0.5 }}>
                    {isExpanded ? 'Ver menos' : 'Ver más'}
                </Button>
            )}
        </>
      )}
      
      <Box sx={{ flexGrow: 1 }} /> 

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" color="text.secondary">
            {/* Las interacciones se mantienen visibles para todos los posts */}
            <Tooltip title={interaction?.userHasLiked ? "Quitar Me gusta" : "Me gusta"}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton onClick={() => onLike && onLike(post.id)} disabled={interaction?.likeLoading || !onLike} color={interaction?.userHasLiked ? "primary" : "default"}>
                    {interaction?.likeLoading ? <CircularProgress size={20} /> : <ThumbUpAltIcon sx={{ fontSize: '1.2rem' }} />}
                </IconButton>
                <Typography variant="body2">{interaction?.likesCount ?? 0}</Typography>
                </Stack>
            </Tooltip>
            <Tooltip title="Comentar">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton onClick={() => onComment && onComment(post)} disabled={!onComment}><ChatBubbleOutlineIcon sx={{ fontSize: '1.2rem' }} /></IconButton>
                <Typography variant="body2">{post._count?.comments ?? 0}</Typography>
                </Stack>
            </Tooltip>
            <Tooltip title="Compartir">
                <IconButton onClick={() => onShare && onShare(post.id)} disabled={!onShare}><ShareIcon sx={{ fontSize: '1.2rem' }} /></IconButton>
            </Tooltip>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {post.esPremium && <Chip label="Premium" color="premium" size="small" />}
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>{timeAgo}</Typography>
          {/* Se oculta el botón "Ver Post" si está bloqueado */}
          {!isLocked && <Button component={RouterLink} to={`/posts/${post.id}`} size="small" variant="text">Ver Post</Button>}
        </Stack>
      </Stack>
    </Stack>
  );

  return (
    <Paper sx={{ py: 1.5, px:2, my: 1.5 }} elevation={2}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* 7. El Grid se ajusta si la imagen no se muestra */}
        <Grid item xs={12} md={post.imageUrl && !isLocked ? 8 : 12}>
          {TextContent}
        </Grid>
        {/* 8. Se muestra la imagen o el placeholder según el estado 'isLocked' */}
        {post.imageUrl && (
          <Grid item xs={12} md={4}>
            {isLocked ? (
                LockedContentPlaceholder
            ) : (
                <Box
                  onClick={() => onImageClick && onImageClick(post.imageUrl)}
                  sx={{
                    width: '100%',
                    aspectRatio: '1 / 1', 
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': { transform: 'scale(1.03)' }
                  }}
                >
                  <img src={post.imageUrl} alt={`Imagen de ${post.title}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
                </Box>
            )}
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default React.memo(ArticlePostItem);