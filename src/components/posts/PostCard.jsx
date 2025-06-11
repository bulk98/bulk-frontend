// src/components/posts/PostCard.jsx
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Card, CardMedia, Box, Typography, Link, Chip, IconButton, Tooltip, CircularProgress, Stack, Avatar, CardContent, CardActions, Button } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const PostCard = ({ post, layout = 'list', interaction, onImageClick, onLike, onComment, onShare }) => {
    if (!post) return null;

    const [isExpanded, setIsExpanded] = useState(false);
    const characterLimit = 120;
    const isExpandable = post.content && post.content.length > characterLimit;
    const displayedContent = isExpanded ? post.content : post.content?.substring(0, characterLimit);

    const timeAgo = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es }) : '';

    const cardActions = (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
            <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                <Tooltip title={interaction?.userHasLiked ? "Quitar Me gusta" : "Me gusta"}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <IconButton onClick={() => onLike && onLike(post.id)} size="small" disabled={interaction?.likeLoading || !onLike} color={interaction?.userHasLiked ? "primary" : "default"}>
                            {interaction?.likeLoading ? <CircularProgress size={16} /> : <ThumbUpAltIcon sx={{ fontSize: '1.2rem' }} />}
                        </IconButton>
                        <Typography variant="body2">{interaction?.likesCount ?? 0}</Typography>
                    </Stack>
                </Tooltip>
                <Tooltip title="Comentar">
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <IconButton onClick={() => onComment && onComment(post)} size="small" disabled={!onComment}><ChatBubbleOutlineIcon sx={{ fontSize: '1.2rem' }} /></IconButton>
                        <Typography variant="body2">{post._count?.comments ?? 0}</Typography>
                    </Stack>
                </Tooltip>
                 <Tooltip title="Compartir">
                    <span><IconButton onClick={() => onShare && onShare(post.id)} size="small" disabled={!onShare}><ShareIcon sx={{ fontSize: '1.2rem' }} /></IconButton></span>
                </Tooltip>
            </Stack>
        </Stack>
    );

    if (layout === 'list') {
        // --- VISTA DE LISTA (USADA EN COMMUNITYDETAILPAGE) ---
        return (
            <Card variant="outlined" sx={{ display: 'flex', width: '100%' }}>
                <CardMedia
                    component="img"
                    image={post.imageUrl || 'https://placehold.co/150x150/ECEFF1/B0BEC5?text=Bulk'}
                    onClick={() => onImageClick && post.imageUrl && onImageClick(post.imageUrl)}
                    sx={{ width: 150, minWidth: 150, aspectRatio: '1 / 1', objectFit: 'cover', cursor: post.imageUrl ? 'pointer' : 'default' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2, overflow: 'hidden' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                        <Avatar src={post.author?.avatarUrl} sx={{ width: 24, height: 24 }}>{post.author?.name?.charAt(0)}</Avatar>
                        <Typography variant="body2" color="text.secondary" noWrap>
                           <Link component={RouterLink} to={`/perfil/${post.author?.id}`} sx={{fontWeight:'medium', color:'text.primary'}} underline="hover">
                               {post.author?.username ? `@${post.author.username}` : (post.author?.name || 'Usuario Anónimo')}
                           </Link>
                        </Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.3, mb: 1, wordBreak: 'break-word' }}>
                        <Link component={RouterLink} to={`/posts/${post.id}`} underline="hover" color="inherit">{post.title}</Link>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                        {displayedContent}
                        {isExpandable && !isExpanded && '...'}
                    </Typography>
                    {isExpandable && (
                        <Button size="small" onClick={() => setIsExpanded(!isExpanded)} sx={{ alignSelf: 'flex-start', p: 0, mt: 0.5, lineHeight: 1.2 }}>
                            {isExpanded ? 'Ver menos' : 'Ver más'}
                        </Button>
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1.5 }}>
                        {cardActions}
                        <Stack direction="row" alignItems="center" spacing={1}>
                             {post.esPremium && <Chip label="Premium" color="premium" size="small" />}
                             <Typography variant="caption" color="text.secondary">{timeAgo}</Typography>
                             <Button component={RouterLink} to={`/posts/${post.id}`} size="small" variant="text">Ver Post</Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        );
    }
    
    // --- VISTA DE MOSAICO (USADA EN HOMEPAGE) CON ALTURA FIJA ---
    return (
        <Card variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: '390px' }}>
            <CardMedia
                component="img"
                image={post.imageUrl || 'https://placehold.co/600x400/ECEFF1/B0BEC5?text=Bulk'}
                alt={`Imagen de ${post.title}`}
                onClick={() => onImageClick && post.imageUrl && onImageClick(post.imageUrl)}
                sx={{ height: 180, objectFit: 'cover', cursor: post.imageUrl ? 'pointer' : 'default' }}
            />
            <CardContent sx={{ flexGrow: 1, display:'flex', flexDirection:'column', p: 2, overflow: 'hidden' }}>
                 <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                    <Avatar src={post.author?.avatarUrl} sx={{ width: 32, height: 32 }}>{post.author?.name?.charAt(0)}</Avatar>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', lineHeight:1.2, noWrap: true }}>{post.author?.name || 'Autor'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            en <Link component={RouterLink} to={`/comunidades/${post.community?.id}`} sx={{ fontWeight: 'medium' }} underline="hover">{post.community?.name}</Link>
                        </Typography>
                    </Box>
                </Stack>
                <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.3, wordBreak: 'break-word', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', textOverflow: 'ellipsis', minHeight: '3rem' }}>
                    <Link component={RouterLink} to={`/posts/${post.id}`} underline="hover" color="inherit">{post.title}</Link>
                </Typography>
                
                <Box sx={{ flexGrow: 1 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    {post.esPremium && <Chip label="Premium" color="premium" size="small" />}
                    <Typography variant="caption" color="text.secondary">{timeAgo}</Typography>
                </Stack>

                <Divider sx={{ my: 1 }} />
                
                {cardActions}
            </CardContent>
        </Card>
    );
};

export default React.memo(PostCard);