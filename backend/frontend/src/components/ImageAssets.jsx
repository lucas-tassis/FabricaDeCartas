import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

/**
 * ImageAssets — manages upload of image files used in card generation.
 * Images are stored server-side; PdfService resolves them by matching the
 * spreadsheet cell value to the uploaded filename (with or without extension).
 */
function ImageAssets() {
  const { t } = useTranslation();
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  // Load existing images from server on mount — silently fails if server is offline
  useEffect(() => {
    api.listImages().then(setUploadedImages).catch(() => {
      // Server offline on startup — images will load after first successful request
    });
  }, []);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const stored = await api.uploadImages(Array.from(files));
      setUploadedImages(prev => {
        const merged = [...prev];
        stored.forEach(name => { if (!merged.includes(name)) merged.push(name); });
        return merged.sort();
      });
    } catch (err) {
      api.listImages().then(setUploadedImages).catch(() => {});
      if (err.serverDetail) {
        const blob = new Blob([err.serverDetail], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'error.log';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
      alert(t('error_server'));
    } finally {
      setIsUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClear = async () => {
    await api.clearImages();
    setUploadedImages([]);
  };

  const getExt = (name) => name.split('.').pop().toLowerCase();
  const getBasename = (name) => name.replace(/\.[^/.]+$/, '');
  const extColor = { png: '#3b82f6', jpg: '#f59e0b', jpeg: '#f59e0b', webp: '#10b981', gif: '#8b5cf6' };

  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '850px', padding: '0.75rem 1rem', marginTop: '0.75rem', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{t('image_assets')}</h2>
        {uploadedImages.length > 0 && (
          <button
            onClick={handleClear}
            style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', borderRadius: '6px', padding: '0.15rem 0.5rem',
              cursor: 'pointer', fontSize: '0.7rem'
            }}
          >
            {t('clear_images')}
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
        {/* Left Side: Upload zone */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
          onDragLeave={(e) => { e.stopPropagation(); setIsDragging(false); }}
          onDrop={handleDrop}
          style={{
            flex: '0 0 220px',
            border: `2px dashed ${isDragging ? 'var(--primary)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '8px', padding: '0.5rem', textAlign: 'center', cursor: 'pointer',
            background: isDragging ? 'rgba(139,92,246,0.08)' : 'transparent',
            transition: 'all 0.2s',
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }}>
            {isUploading ? '⏳' : '🖼️'}
          </div>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.78rem' }}>
            {isUploading ? '...' : t('upload_images')}
          </p>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.65rem', color: '#888', lineHeight: '1.2' }}>
            {t('upload_images_hint')}
          </p>
        </div>

        {/* Right Side: Image grid list */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {uploadedImages.length === 0 ? (
            <p style={{ color: '#666', fontSize: '0.75rem', textAlign: 'center', margin: 'auto' }}>
              {t('no_images_yet')}
            </p>
          ) : (
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              gap: '0.35rem',
              maxHeight: '85px',
              overflowY: 'auto',
              alignContent: 'start'
            }}>
              {uploadedImages.map(name => {
                const ext = getExt(name);
                const color = extColor[ext] || '#888';
                return (
                  <li key={name} style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    background: 'rgba(255,255,255,0.04)', borderRadius: '4px',
                    padding: '0.25rem 0.45rem', fontSize: '0.72rem',
                    minWidth: 0
                  }}>
                    <span style={{
                      background: color + '22', color, border: `1px solid ${color}44`,
                      borderRadius: '3px', padding: '0.05rem 0.2rem', fontSize: '0.58rem',
                      fontWeight: 'bold', textTransform: 'uppercase', flexShrink: 0
                    }}>{ext}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title={name}>{getBasename(name)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

export default ImageAssets;
