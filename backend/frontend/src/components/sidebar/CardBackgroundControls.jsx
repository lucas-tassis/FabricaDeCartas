import React, { useRef } from 'react';
import { api } from '../../api/client';

function CardBackgroundControls({ template, setTemplate, uploadedImages, refreshImages }) {
  const bgImageInputRef = useRef(null);

  const handleBgImageUpload = async (e) => {
    const bgFile = e.target.files?.[0];
    if (!bgFile) return;
    try {
      const storedList = await api.uploadImages([bgFile]);
      if (refreshImages) refreshImages();
      const uploadedName = storedList?.[0] || bgFile.name;
      setTemplate(prev => ({ ...prev, cardBackgroundImage: uploadedName }));
    } catch (err) {
      alert(err.serverDetail || err.message || String(err));
    } finally {
      if (bgImageInputRef.current) bgImageInputRef.current.value = '';
    }
  };

  return (
    <div className="sidebar-group">
      <div className="props-divider" />
      <h3>Imagem de Fundo (Frente)</h3>

      <div className="control-group">
        <label>Escolher Imagem de Fundo</label>
        <select
          value={template.cardBackgroundImage || ''}
          onChange={(e) => setTemplate({ ...template, cardBackgroundImage: e.target.value })}
        >
          <option value="">-- Sem Imagem de Fundo --</option>
          {uploadedImages.map((img) => (
            <option key={img} value={img}>
              {img}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <input
          type="file"
          accept="image/*"
          ref={bgImageInputRef}
          style={{ display: 'none' }}
          onChange={handleBgImageUpload}
        />
        <button
          type="button"
          className="btn btn-outline"
          style={{ width: '100%', fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
          onClick={() => bgImageInputRef.current?.click()}
        >
          + Enviar Imagem de Fundo
        </button>
      </div>

      {template.cardBackgroundImage && (
        <>
          <div className="control-group">
            <label>Ajuste do Fundo</label>
            <select
              value={template.cardBackgroundFit || 'cover'}
              onChange={(e) => setTemplate({ ...template, cardBackgroundFit: e.target.value })}
            >
              <option value="cover">Cobre tudo (Cover)</option>
              <option value="contain">Contido (Contain)</option>
              <option value="fill">Preencher (Fill)</option>
            </select>
          </div>
          <div className="control-group">
            <button
              type="button"
              className="clear-color-btn"
              style={{ width: '100%' }}
              onClick={() => setTemplate({ ...template, cardBackgroundImage: '' })}
            >
              🗑️ Remover Fundo
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CardBackgroundControls;
