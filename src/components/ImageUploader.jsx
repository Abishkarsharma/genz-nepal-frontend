import React, { useRef } from 'react';
import useImageUpload from '../hooks/useImageUpload';
import './ImageUploader.css';

/**
 * Reusable drag-and-drop image uploader.
 * Props:
 *   token       - JWT token for auth
 *   onUpload    - callback(url) called when upload succeeds
 *   currentUrl  - existing image URL (for edit mode)
 *   folder      - optional label shown in UI
 */
export default function ImageUploader({ token, onUpload, currentUrl = '' }) {
  const { uploading, uploadImage, preview, setPreview, error } = useImageUpload(token);
  const fileRef = useRef();
  const [dragging, setDragging] = React.useState(false);

  const displayUrl = preview || currentUrl;

  const handleFile = async (file) => {
    const url = await uploadImage(file);
    if (url) onUpload(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="img-uploader">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      {displayUrl ? (
        <div className="img-uploader-preview">
          <img src={displayUrl} alt="Product" />
          {uploading && (
            <div className="img-uploader-overlay">
              <div className="img-uploader-spinner" />
              <span>Uploading...</span>
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              className="img-change-btn"
              onClick={() => fileRef.current.click()}
            >
              Change Image
            </button>
          )}
        </div>
      ) : (
        <div
          className={`img-uploader-zone ${dragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileRef.current.click()}
        >
          {uploading ? (
            <div className="img-uploader-loading">
              <div className="img-uploader-spinner" />
              <span>Uploading to cloud...</span>
            </div>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <p className="img-uploader-text">
                Drag &amp; drop or <span className="img-uploader-link">browse</span>
              </p>
              <p className="img-uploader-hint">JPG, PNG, WEBP · Max 5MB</p>
            </>
          )}
        </div>
      )}

      {error && <p className="img-uploader-error">{error}</p>}
    </div>
  );
}
