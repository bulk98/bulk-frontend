import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Importar Link de react-router-dom
import { useAuth } from '../../contexts/AuthContext';
import { getCommentsByPost, createComment, deleteComment, updateComment } from '../../services/commentService';

// Importaciones de MUI (incluyendo Link)
import { Paper, Typography, Box, CircularProgress, Alert, Button, Stack, Avatar, List, ListItem, ListItemAvatar, ListItemText, TextField, IconButton, Tooltip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const CommentSection = ({ postId, postAuthorId, communityCreatorId }) => {
    const { isAuthenticated, user: authUser } = useAuth();
    
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [errorComments, setErrorComments] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalComments, setTotalComments] = useState(0);
    
    const [newCommentContent, setNewCommentContent] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    
    const [editingComment, setEditingComment] = useState(null);
    const [editedContent, setEditedContent] = useState('');

    const [deletingComment, setDeletingComment] = useState(null);
    const [isConfirmOpen, setConfirmOpen] = useState(false);


    const fetchComments = useCallback(async (pageNum) => {
        setLoadingComments(true);
        try {
            const data = await getCommentsByPost(postId, pageNum);
            setComments(data.comments || []);
            setPage(data.currentPage || 1);
            setTotalPages(data.totalPages || 0);
            setTotalComments(data.totalComments || 0);
        } catch (err) {
            setErrorComments('No se pudieron cargar los comentarios.');
        } finally {
            setLoadingComments(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments(1);
    }, [fetchComments]);

    const handleCreateComment = async (e) => {
        e.preventDefault();
        if (!newCommentContent.trim()) return;
        setSubmittingComment(true);
        try {
            await createComment(postId, { content: newCommentContent.trim() });
            setNewCommentContent('');
            fetchComments(1); 
        } catch (error) {
            console.error("Error creando comentario:", error);
        } finally {
            setSubmittingComment(false);
        }
    };
    
    const canManageComment = (commentAuthorId) => {
        if (!isAuthenticated || !authUser) return false;
        return authUser.id === commentAuthorId || authUser.id === communityCreatorId;
    };

    const handleEditStart = (comment) => {
        setEditingComment(comment);
        setEditedContent(comment.content);
    };

    const handleEditCancel = () => {
        setEditingComment(null);
        setEditedContent('');
    };

    const handleEditSave = async () => {
        if (!editedContent.trim() || !editingComment) return;
        try {
            await updateComment(editingComment.id, { content: editedContent.trim() });
            handleEditCancel();
            fetchComments(page);
        } catch (error) {
            console.error("Error editando comentario:", error);
        }
    };

    const handleDeleteClick = (comment) => {
        setDeletingComment(comment);
        setConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingComment) return;
        try {
            await deleteComment(deletingComment.id);
            fetchComments(1);
        } catch (error) {
            console.error("Error borrando comentario:", error);
        } finally {
            setConfirmOpen(false);
            setDeletingComment(null);
        }
    };


    return (
        <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, mt: 4 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'medium', mb: 3 }}>
                Comentarios ({totalComments})
            </Typography>

            {isAuthenticated && (
                <Box component="form" onSubmit={handleCreateComment} sx={{ mb: 4 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Avatar src={authUser?.avatarUrl} sx={{ mt: 1 }} />
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Añadir un comentario..."
                            value={newCommentContent}
                            onChange={(e) => setNewCommentContent(e.target.value)}
                            disabled={submittingComment}
                        />
                    </Stack>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                        <Button type="submit" variant="contained" disabled={submittingComment || !newCommentContent.trim()}>
                            {submittingComment ? <CircularProgress size={24} /> : 'Publicar'}
                        </Button>
                    </Box>
                </Box>
            )}

            {loadingComments && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
            {errorComments && <Alert severity="warning">{errorComments}</Alert>}
            {!loadingComments && comments.length === 0 && (
                <Typography sx={{ fontStyle: 'italic', textAlign: 'center', py: 3, color: 'text.secondary' }}>
                    Aún no hay comentarios. ¡Sé el primero!
                </Typography>
            )}

            {!loadingComments && comments.length > 0 && (
                <List sx={{ width: '100%', p: 0 }}>
                    {comments.map((comment) => (
                        <ListItem key={comment.id} alignItems="flex-start" sx={{ py: 1.5, px: 0, gap: 2 }} divider>
                            <ListItemAvatar>
                                <Link component={RouterLink} to={`/perfil/${comment.author?.id}`}>
                                    <Avatar src={comment.author?.avatarUrl} />
                                </Link>
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Link component={RouterLink} to={`/perfil/${comment.author?.id}`} underline="hover" color="text.primary">
                                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                {comment.author?.username ? `@${comment.author.username}` : (comment.author?.name || 'Usuario Anónimo')}
                                            </Typography>
                                        </Link>
                                        {canManageComment(comment.author?.id) && (
                                            <Stack direction="row">
                                                <Tooltip title="Editar"><IconButton size="small" onClick={() => handleEditStart(comment)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Eliminar"><IconButton size="small" onClick={() => handleDeleteClick(comment)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                            </Stack>
                                        )}
                                    </Stack>
                                }
                                secondary={
                                    editingComment?.id === comment.id ? (
                                        <Box sx={{width: '100%', mt:1}}>
                                            <TextField fullWidth multiline value={editedContent} onChange={(e) => setEditedContent(e.target.value)} autoFocus size="small" />
                                            <Box sx={{mt:1, display:'flex', gap:1, justifyContent:'flex-end'}}>
                                                <Button onClick={handleEditCancel} size="small">Cancelar</Button>
                                                <Button onClick={handleEditSave} variant="contained" size="small">Guardar</Button>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Typography sx={{ whiteSpace: 'pre-wrap', pt: 0.5 }} component="span" variant="body2">{comment.content}</Typography>
                                    )
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}
            
            <Dialog open={isConfirmOpen} onClose={() => setConfirmOpen(false)}>
                 <DialogTitle>Confirmar Eliminación</DialogTitle>
                <DialogContent><DialogContentText>¿Estás seguro de que quieres eliminar este comentario?</DialogContentText></DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
                    <Button onClick={handleDeleteConfirm} color="error">Eliminar</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default CommentSection;