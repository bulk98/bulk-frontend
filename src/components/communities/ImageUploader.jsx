// src/components/communities/ImageUploader.jsx
import React from 'react';

// Importaciones de Material-UI
import { Typography, Paper, Box, Avatar, Button, Stack, CircularProgress, Alert } from '@mui/material';

// Iconos
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';

const ImageUploader = ({
  title,
  isBanner = false,
  currentImageUrl,
  communityName,
  selectedFile,
  uploading,
  deleting,
  error,
  successMessage,
  inputRef,
  onFileChange,
  onUpload,
  onDelete,
}) => {

  const anyActionLoading = uploading || deleting;

  return (
    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>

      {/* --- Contenedor de la Imagen/Preview --- */}
      <Box sx={{
        width: '100%',
        height: isBanner ? 120 : 'auto', // Altura fija para banner
        aspectRatio: isBanner ? 'auto' : '1 / 1', // Cuadrado para logo
        maxWidth: isBanner ? '100%' : 120, // Ancho máximo para logo
        m: 'auto',
        mb: 2,
        borderRadius: 1,
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'action.hover'
      }}>
        {currentImageUrl ? (
          isBanner ? (
            <img src={currentImageUrl} alt={`Vista previa del ${title}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Avatar src={currentImageUrl} sx={{ width: '100%', height: '100%' }} variant="rounded">{communityName?.charAt(0)}</Avatar>
          )
        ) : (
          <Typography color="text.secondary" variant="caption">Sin {title}</Typography>
        )}
      </Box>

      {/* --- Mensajes de Feedback --- */}
      {error && <Alert severity="error" sx={{ mb: 1, textAlign: 'left' }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 1, textAlign: 'left' }}>{successMessage}</Alert>}
      
      {/* Input de archivo oculto */}
      <input type="file" accept="image/jpeg, image/png, image/webp" ref={inputRef} hidden onChange={onFileChange} />

      {/* --- Botones de Acción --- */}
      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 'auto' }}>
        <Button
          variant="outlined"
          onClick={() => inputRef.current.click()}
          startIcon={<PhotoCamera />}
          disabled={anyActionLoading}
          size="small"
        >
          Cambiar
        </Button>
        <Button
          color="error"
          variant="outlined"
          onClick={onDelete}
          disabled={anyActionLoading || !currentImageUrl || selectedFile}
          startIcon={<DeleteIcon />}
          size="small"
        >
          {deleting ? <CircularProgress size={20} /> : 'Eliminar'}
        </Button>
      </Stack>

      {/* Botón de Confirmación de Subida */}
      {selectedFile && (
        <Button sx={{ mt: 2 }} variant="contained" color="primary" onClick={onUpload} disabled={anyActionLoading}>
          {uploading ? <CircularProgress size={24} /> : `Confirmar ${title}`}
        </Button>
      )}
    </Paper>
  );
};

export default ImageUploader;