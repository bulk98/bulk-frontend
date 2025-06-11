import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Link, IconButton, Tooltip, CircularProgress, Stack, Avatar, Grid, Chip, Button } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ArticlePostItem = ({ post, interaction, onLike, onComment, onShare, onImageClick }) => {
  if (!post) return null;

  const [isExpanded, setIsExpanded] = useState(false);
  const characterLimit = 250;
  const isExpandable = post.content && post.content.length > characterLimit;
  const displayedContent = isExpanded ? post.content : post.content?.substring(0, characterLimit);

  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es })
    : '';

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

      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', wordBreak: 'break-word', pt: 1 }}>
        <Link component={RouterLink} to={`/posts/${post.id}`} underline="hover" color="inherit">
          {post.title}
        </Link>
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
        {displayedContent}
        {isExpandable && !isExpanded && '...'}
      </Typography>

      {isExpandable && (
          <Button size="small" onClick={() => setIsExpanded(!isExpanded)} sx={{ alignSelf: 'flex-start', p: 0, mt: 0.5 }}>
              {isExpanded ? 'Ver menos' : 'Ver más'}
          </Button>
      )}
      
      <Box sx={{ flexGrow: 1 }} /> 

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" color="text.secondary">
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
          <Button component={RouterLink} to={`/posts/${post.id}`} size="small" variant="text">Ver Post</Button>
        </Stack>
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ py: 2.5 }}>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={post.imageUrl ? 8 : 12}>
          {TextContent}
        </Grid>
        {post.imageUrl && (
          <Grid item xs={12} md={4}>
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
                '&:hover': {
                  transform: 'scale(1.03)'
                }
              }}
            >
              <img src={post.imageUrl} alt={`Imagen de ${post.title}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default React.memo(ArticlePostItem);