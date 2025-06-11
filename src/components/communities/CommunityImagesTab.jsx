// src/components/communities/CommunityImagesTab.jsx
import React from 'react';
import ImageUploader from './ImageUploader'; // Importamos el componente reutilizable
import { Grid } from '@mui/material';

const CommunityImagesTab = (props) => {
  const {
    communityName,
    // Props para el Logo
    currentLogoUrl, selectedLogoFile, logoUploading, logoDeleting, logoError, logoSuccessMessage,
    logoFileInputRef, handleLogoFileChange, handleUploadLogo, handleDeleteLogo,
    // Props para el Banner
    currentBannerUrl, selectedBannerFile, bannerUploading, bannerDeleting, bannerError, bannerSuccessMessage,
    bannerFileInputRef, handleBannerFileChange, handleUploadBanner, handleDeleteBanner,
  } = props;

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        <ImageUploader
          title="Logo"
          currentImageUrl={currentLogoUrl}
          communityName={communityName}
          selectedFile={selectedLogoFile}
          uploading={logoUploading}
          deleting={logoDeleting}
          error={logoError}
          successMessage={logoSuccessMessage}
          inputRef={logoFileInputRef}
          onFileChange={handleLogoFileChange}
          onUpload={handleUploadLogo}
          onDelete={handleDeleteLogo}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <ImageUploader
          title="Banner"
          isBanner={true}
          currentImageUrl={currentBannerUrl}
          communityName={communityName}
          selectedFile={selectedBannerFile}
          uploading={bannerUploading}
          deleting={bannerDeleting}
          error={bannerError}
          successMessage={bannerSuccessMessage}
          inputRef={bannerFileInputRef}
          onFileChange={handleBannerFileChange}
          onUpload={handleUploadBanner}
          onDelete={handleDeleteBanner}
        />
      </Grid>
    </Grid>
  );
};

export default CommunityImagesTab;