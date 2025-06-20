import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { createComment, getCommentsByPost } from '../../services/commentService';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItem, ListItemAvatar,
  Avatar, ListItemText, IconButton, Box, CircularProgress, Typography, Button, Link, Snackbar
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const CommentDialog = ({ open, onClose, post, onCommentAdded }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({ mode: 'onChange' });

  useEffect(() => {
    if (open && post) {
      setLoadingComments(true);
      getCommentsByPost(post.id)
        .then(data => setComments(data.comments || []))
        .catch(() => setSnackbar({ open: true, message: 'Error al cargar comentarios.' }))
        .finally(() => setLoadingComments(false));
    } else if (!open) {
      reset();
      setComments([]);
    }
  }, [open, post, reset]);

  const onSubmitComment = async (data) => {
    if (!data.content?.trim()) return;

    try {
      const newCommentData = await createComment(post.id, { content: data.content.trim() });
      reset();

      const commentWithAuthor = {
        ...newCommentData,
        author: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl
        },
        createdAt: new Date().toISOString()
      };

      setComments(prev => [commentWithAuthor, ...prev]);
      if (onCommentAdded) onCommentAdded(post.id);
      setSnackbar({ open: true, message: 'Comentario publicado.' });
    } catch (error) {
      console.error("❌ Error al comentar desde Dialog:", error);
      setSnackbar({ open: true, message: error?.message || "Error al comentar." });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Comentarios
          <IconButton aria-label="Cerrar" onClick={onClose}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {loadingComments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : comments.length > 0 ? (
            <List>
              {comments.map(comment => (
                <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
                  <ListItemAvatar>
                    <Avatar component={RouterLink} to={`/perfil/${comment.author.id}`} src={comment.author.avatarUrl} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Link component={RouterLink} to={`/perfil/${comment.author.id}`} fontWeight="bold" color="text.primary" underline="hover">
                        { `@${comment.author.username}`}
                      </Link>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {comment.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              Sé el primero en comentar.
            </Typography>
          )}
        </DialogContent>

        {isAuthenticated && (
          <Box component="form" onSubmit={handleSubmit(onSubmitComment)} sx={{ borderTop: 1, borderColor: 'divider', p: 1.5 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder={`Comentar como @${user?.username}...`}
              variant="standard"
              InputProps={{ disableUnderline: true }}
              {...register("content", { required: "El comentario no puede estar vacío." })}
              error={!!errors.content}
              helperText={errors.content?.message}
              disabled={isSubmitting}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Publicar'}
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default CommentDialog;
