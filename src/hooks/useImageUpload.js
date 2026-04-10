import { useState } from 'react';
import api from '../api';

/**
 * Reusable hook for uploading images to Cloudinary via backend.
 * Usage:
 *   const { uploading, uploadImage, preview, clearPreview } = useImageUpload(token);
 *   const url = await uploadImage(file);  // returns Cloudinary URL
 */
export default function useImageUpload(token) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  const uploadImage = async (file) => {
    if (!file) return null;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB');
      return null;
    }

    // Show local preview immediately while uploading
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await api.post('/api/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Replace blob URL with real Cloudinary URL
      setPreview(data.url);
      return data.url;
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      setPreview('');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreview('');
    setError('');
  };

  return { uploading, uploadImage, preview, setPreview, error, clearPreview };
}
