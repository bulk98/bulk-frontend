// src/components/communities/CommunityDetailsTab.jsx
import React from 'react';
import { Box, TextField, FormControlLabel, Switch, Button, CircularProgress, Alert, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const languages = ["Español", "Inglés", "Portugués", "Francés", "Alemán", "Italiano", "Chino", "Japonés"];

const CommunityDetailsTab = ({
  name, description, isPublic,
  idiomaPrincipal, idiomaSecundario, 
  onNameChange, onDescriptionChange, onIsPublicChange,
  onIdiomaPrincipalChange, onIdiomaSecundarioChange,
  onSubmit, saving, error, successMessage,
  hasChanges,
  isAnyImageActionLoading,
}) => {
  return (
    <Box component="form" onSubmit={onSubmit} noValidate sx={{ maxWidth: '700px' }}>
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <TextField fullWidth required label="Nombre de la Comunidad" value={name} onChange={onNameChange} margin="normal" disabled={saving || isAnyImageActionLoading} />
      <TextField fullWidth multiline rows={4} label="Descripción" value={description} onChange={onDescriptionChange} margin="normal" disabled={saving || isAnyImageActionLoading} />
      
      {/* === INICIO DE LA CORRECCIÓN CON FLEXBOX === */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 1 }}>
        <FormControl fullWidth required disabled={saving || isAnyImageActionLoading}>
            <InputLabel>Idioma Principal</InputLabel>
            <Select value={idiomaPrincipal} label="Idioma Principal" onChange={onIdiomaPrincipalChange}>
                {languages.map((lang) => <MenuItem key={lang} value={lang}>{lang}</MenuItem>)}
            </Select>
        </FormControl>
        <FormControl fullWidth disabled={saving || isAnyImageActionLoading || !idiomaPrincipal}>
            <InputLabel>Idioma Secundario (Opcional)</InputLabel>
            <Select value={idiomaSecundario} label="Idioma Secundario (Opcional)" onChange={onIdiomaSecundarioChange}>
                <MenuItem value=""><em>Ninguno</em></MenuItem>
                {languages.filter(l => l !== idiomaPrincipal).map((lang) => <MenuItem key={lang} value={lang}>{lang}</MenuItem>)}
            </Select>
        </FormControl>
      </Box>
      
      <FormControlLabel control={<Switch checked={isPublic} onChange={onIsPublicChange} disabled={saving || isAnyImageActionLoading} />} label={isPublic ? "Pública (Visible para todos)" : "Privada (Solo para miembros)"} sx={{ display: 'block', my: 1 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button type="submit" variant="contained" disabled={saving || !hasChanges || isAnyImageActionLoading}>
          {saving ? <CircularProgress size={24} /> : 'Guardar Cambios'}
        </Button>
      </Box>
    </Box>
  );
};

export default CommunityDetailsTab;