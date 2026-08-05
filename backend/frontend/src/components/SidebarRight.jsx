import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

const PRESET_SIZES = [
  { name: 'Mini USA', width: 41, height: 63 },
  { name: 'Mini Chimera', width: 43, height: 65 },
  { name: 'Mini Chimeuro', width: 43.5, height: 67.5 },
  { name: 'Mini Euro', width: 45, height: 68 },
  { name: 'Padrão USA', width: 56, height: 87 },
  { name: 'Chimera', width: 57.5, height: 89 },
  { name: 'Yu-Gi-Oh!', width: 59, height: 86 },
  { name: 'Chimeuro', width: 59, height: 91 },
  { name: 'Padrão Euro', width: 59, height: 92 },
  { name: 'French Tarot', width: 61, height: 112 },
  { name: 'Padrão', width: 63.5, height: 88 },
  { name: 'Copper', width: 65, height: 100 },
  { name: 'Quadrado', width: 70, height: 70 },
  { name: 'Silver', width: 70, height: 110 },
  { name: 'Tarot', width: 70, height: 120 },
  { name: 'Quadrado Médio', width: 80, height: 80 },
  { name: 'Gold', width: 80, height: 120 },
];

const BUILTIN_FONTS = ['Helvetica', 'Times', 'Courier'];

function SidebarRight({ template, setTemplate, gridSize, setGridSize, activeSection, updateSectionConfig, columnTypes, sections, saveHistory, columns, showBleedGuides, setShowBleedGuides, snapToGrid, setSnapToGrid }) {
  const { t } = useTranslation();
  const [systemFonts, setSystemFonts] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);

  const refreshImages = () => {
    api.listImages().then(setUploadedImages).catch(() => {});
  };

  useEffect(() => {
    api.listFonts()
      .then(fonts => setSystemFonts(fonts))
      .catch(() => {}); // silently ignore — builtin fonts still work
    refreshImages();
  }, []);

  const fontInputRef = React.useRef(null);

  const refreshFonts = () => {
    api.listFonts().then(fonts => setSystemFonts(fonts)).catch(() => {});
  };

  const handleFontUpload = async (e) => {
    const fontFile = e.target.files?.[0];
    if (!fontFile) return;

    try {
      await api.uploadFont(fontFile);

      const familyName = fontFile.name.replace(/\.[^/.]+$/, "");
      const fontUrl = URL.createObjectURL(fontFile);
      const fontFace = new FontFace(familyName, `url(${fontUrl})`);
      await fontFace.load();
      document.fonts.add(fontFace);

      refreshFonts();
      if (activeSection) {
        saveHistory(sections);
        updateSectionConfig(activeSection.id, { fontFamily: familyName });
      }
      alert(t('font_uploaded_success'));
    } catch (err) {
      alert(err.serverDetail || err.message || String(err));
    } finally {
      if (fontInputRef.current) fontInputRef.current.value = '';
    }
  };

  const handleScanLocalFonts = async () => {
    if (!('queryLocalFonts' in window)) {
      alert("A busca automática de fontes não é suportada por este navegador. Por favor, utilize o botão '+ Enviar Fonte (.ttf/.otf)'!");
      return;
    }
    try {
      const localFonts = await window.queryLocalFonts();
      if (!localFonts || localFonts.length === 0) {
        alert("Nenhuma fonte encontrada ou a permissão foi negada.");
        return;
      }
      const uniqueFamilies = Array.from(new Set(localFonts.map(f => f.family))).sort();
      setSystemFonts(prev => Array.from(new Set([...prev, ...uniqueFamilies])).sort());
      alert(`${uniqueFamilies.length} famílias de fontes do seu computador foram adicionadas à lista!`);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        alert("Permissão negada para acessar as fontes do computador.");
      } else {
        alert("Erro ao buscar fontes locais: " + (err.message || String(err)));
      }
    }
  };

  const effectiveType = activeSection?.linkedColumn
    ? (columnTypes?.[activeSection.linkedColumn] || 'text')
    : 'text';

  const isBordas = effectiveType === 'bordas';
  const isImage  = effectiveType === 'image';

  return (
    <div className="sidebar glass-panel sidebar-padding" onClick={(e) => e.stopPropagation()}>
      <h2>{t('properties')}</h2>

      <div className="control-group">
        <label>{t('card_size_preset')}</label>
        <select
          onChange={(e) => {
            const size = PRESET_SIZES.find((s) => s.name === e.target.value);
            if (size) setTemplate({ ...template, cardWidth: size.width, cardHeight: size.height });
          }}
          defaultValue=""
        >
          <option value="">{t('custom_points')}</option>
          {PRESET_SIZES.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} ({s.width} x {s.height} mm)
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label>{t('card_size')}</label>
        <div className="card-size-inputs">
          <input type="text" value={template.cardWidth}
            onChange={(e) => setTemplate({ ...template, cardWidth: e.target.value })}
            title={t('width')} />
          <input type="text" value={template.cardHeight}
            onChange={(e) => setTemplate({ ...template, cardHeight: e.target.value })}
            title={t('height')} />
        </div>
      </div>

      <div className="control-group">
        <label>{t('grid_size')}</label>
        <input type="text" value={gridSize}
          onChange={(e) => setGridSize(e.target.value)} />
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={showBleedGuides || false}
            onChange={(e) => setShowBleedGuides(e.target.checked)}
            style={{ width: 'auto', marginRight: '0.5rem' }}
          />
          {t('show_bleed_guides')}
        </label>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={snapToGrid !== false}
            onChange={(e) => setSnapToGrid(e.target.checked)}
            style={{ width: 'auto', marginRight: '0.5rem' }}
          />
          {t('snap_to_grid')}
        </label>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={template.rotate90ForPrint || false}
            onChange={(e) => setTemplate({ ...template, rotate90ForPrint: e.target.checked })}
            style={{ width: 'auto', marginRight: '0.5rem' }}
          />
          {t('rotate_90_for_print')}
        </label>
      </div>

      <div className="control-group">
        <label>{t('card_border_thickness')}</label>
        <input type="text" value={template.cardBorderThickness ?? 0.3}
          onChange={(e) => setTemplate({ ...template, cardBorderThickness: e.target.value })} />
      </div>

      <div className="control-group">
        <label>{t('card_border_color')}</label>
        <input
          type="color"
          value={template.cardBorderColor || '#000000'}
          title={t('card_border_color')}
          onChange={(e) => setTemplate({ ...template, cardBorderColor: e.target.value })}
          style={{ width: '2rem', height: '2rem', padding: '0.1rem', cursor: 'pointer', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}
        />
      </div>

      <div className="control-group">
        <label>{t('card_back_type')}</label>
        <select
          value={template.cardBackType || 'none'}
          onChange={(e) => setTemplate({
            ...template,
            cardBackType: e.target.value,
            cardBackValue: ''
          })}
        >
          <option value="none">{t('card_back_type_none')}</option>
          <option value="default">{t('card_back_type_default')}</option>
          <option value="column">{t('card_back_type_column')}</option>
        </select>
      </div>

      {template.cardBackType === 'default' && (
        <div className="control-group">
          <label>{t('card_back_value')}</label>
          <select
            value={template.cardBackValue || ''}
            onFocus={refreshImages}
            onChange={(e) => setTemplate({ ...template, cardBackValue: e.target.value })}
          >
            <option value="">{t('select_image_hint')}</option>
            {uploadedImages.map(img => (
              <option key={img} value={img}>{img}</option>
            ))}
          </select>
        </div>
      )}

      {template.cardBackType === 'column' && (
        <div className="control-group">
          <label>{t('card_back_value')}</label>
          <select
            value={template.cardBackValue || ''}
            onChange={(e) => setTemplate({ ...template, cardBackValue: e.target.value })}
          >
            <option value="">{t('select_column_hint')}</option>
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      )}

      {template.cardBackType && template.cardBackType !== 'none' && (
        <>
          <div className="control-group">
            <label>{t('card_back_direction')}</label>
            <select
              value={template.cardBackDirection || 'separate'}
              onChange={(e) => setTemplate({ ...template, cardBackDirection: e.target.value })}
            >
              <option value="separate">{t('card_back_direction_separate')}</option>
              <option value="interleaved">{t('card_back_direction_interleaved')}</option>
            </select>
          </div>
          <div className="control-group">
            <label>{t('card_back_fit')}</label>
            <select
              value={template.cardBackFit || 'cover'}
              onChange={(e) => setTemplate({ ...template, cardBackFit: e.target.value })}
            >
              <option value="cover">{t('image_fit_cover')}</option>
              <option value="contain">{t('image_fit_contain')}</option>
              <option value="fill">{t('image_fit_fill')}</option>
              <option value="smart">{t('image_fit_smart')}</option>
              <option value="none">{t('image_fit_none')}</option>
            </select>
          </div>
        </>
      )}

      <hr className="props-divider" />

      {activeSection ? (
        <div>
          <h3>{activeSection.name}</h3>

          {/* ── BORDAS: color space selector ── */}
          {isBordas && (
            <div className="control-group">
              <label>{t('color_space')}</label>
              <div className="segmented-control">
                {['RGB', 'CMYK'].map(cs => (
                  <button
                    key={cs}
                    className={`segmented-btn${(activeSection.colorSpace || 'RGB') === cs ? ' segmented-btn--active' : ''}`}
                    onClick={() => { saveHistory(sections); updateSectionConfig(activeSection.id, { colorSpace: cs }); }}
                  >
                    {t(`color_space_${cs.toLowerCase()}`)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── TEXT / IMAGE: background color ── */}
          {!isBordas && (
            <div className="control-group">
              <label>{t('background_color')}</label>
              <input
                type="color"
                value={activeSection.backgroundColor || '#ffffff'}
                title={t('background_color')}
                onFocus={() => saveHistory(sections)}
                onChange={(e) => updateSectionConfig(activeSection.id, { backgroundColor: e.target.value })}
                style={{ width: '2rem', height: '2rem', padding: '0.1rem', cursor: 'pointer', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}
              />
            </div>
          )}

          {/* ── IMAGE: fit mode & brightness/contrast filters ── */}
          {isImage && (
            <>
              <div className="control-group">
                <label>{t('image_fit')}</label>
                <select
                  value={activeSection.imageFit || 'smart'}
                  onChange={(e) => { saveHistory(sections); updateSectionConfig(activeSection.id, { imageFit: e.target.value }); }}
                >
                  <option value="smart">{t('image_fit_smart')}</option>
                  <option value="contain">{t('image_fit_contain')}</option>
                  <option value="cover">{t('image_fit_cover')}</option>
                  <option value="fill">{t('image_fit_fill')}</option>
                  <option value="none">{t('image_fit_none')}</option>
                </select>
              </div>

              <div className="control-group">
                <label>{t('brightness')}: {activeSection.brightness ?? 100}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={activeSection.brightness ?? 100}
                  onMouseDown={() => saveHistory(sections)}
                  onTouchStart={() => saveHistory(sections)}
                  onChange={(e) => updateSectionConfig(activeSection.id, { brightness: Number(e.target.value) })}
                />
              </div>

              <div className="control-group">
                <label>{t('contrast')}: {activeSection.contrast ?? 100}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={activeSection.contrast ?? 100}
                  onMouseDown={() => saveHistory(sections)}
                  onTouchStart={() => saveHistory(sections)}
                  onChange={(e) => updateSectionConfig(activeSection.id, { contrast: Number(e.target.value) })}
                />
              </div>
            </>
          )}

          {/* ── TEXT: alignment, font, bold ── */}
          {!isBordas && !isImage && (
            <>
              <div className="control-group">
                <label>{t('rotation')}</label>
                <input
                  type="text"
                  value={activeSection.rotation || 0}
                  onFocus={() => saveHistory(sections)}
                  onChange={(e) => updateSectionConfig(activeSection.id, { rotation: e.target.value })}
                />
              </div>

              <div className="control-group">
                <label>{t('font_family')}</label>
                <select
                  value={activeSection.fontFamily || 'Helvetica'}
                  onChange={(e) => { saveHistory(sections); updateSectionConfig(activeSection.id, { fontFamily: e.target.value }); }}
                >
                  <optgroup label="Padrão PDF">
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times">Times New Roman</option>
                    <option value="Courier">Courier</option>
                  </optgroup>
                  {systemFonts.filter(f => !BUILTIN_FONTS.includes(f)).length > 0 && (
                    <optgroup label="Fontes do sistema / enviadas">
                      {systemFonts
                        .filter(f => !BUILTIN_FONTS.includes(f))
                        .map(f => <option key={f} value={f}>{f}</option>)}
                    </optgroup>
                  )}
                </select>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', flex: 1 }}
                    onClick={() => fontInputRef.current?.click()}
                  >
                    + {t('upload_font')}
                  </button>
                  {'queryLocalFonts' in window && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', flex: 1 }}
                      onClick={handleScanLocalFonts}
                    >
                      🔍 {t('scan_local_fonts')}
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept=".ttf,.otf"
                  ref={fontInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFontUpload}
                />
              </div>

              <div className="control-group">
                <label>{t('text_align')}</label>
                <select value={activeSection.textAlign}
                  onChange={(e) => { saveHistory(sections); updateSectionConfig(activeSection.id, { textAlign: e.target.value }); }}>
                  <option value="left">{t('align_left')}</option>
                  <option value="center">{t('align_center')}</option>
                  <option value="right">{t('align_right')}</option>
                </select>
              </div>

              <div className="control-group">
                <label>{t('valign')}</label>
                <select value={activeSection.vAlign}
                  onChange={(e) => { saveHistory(sections); updateSectionConfig(activeSection.id, { vAlign: e.target.value }); }}>
                  <option value="top">{t('valign_top')}</option>
                  <option value="center">{t('valign_center')}</option>
                  <option value="bottom">{t('valign_bottom')}</option>
                </select>
              </div>

              <div className="control-group">
                <label>{t('font_size')}</label>
                <input type="text" value={activeSection.fontSize}
                  onFocus={() => saveHistory(sections)}
                  onChange={(e) => updateSectionConfig(activeSection.id, { fontSize: e.target.value })} />
              </div>

              <div className="control-group">
                <label>{t('color')}</label>
                <input
                  type="color"
                  value={activeSection.fontColor || '#000000'}
                  title={t('color')}
                  onFocus={() => saveHistory(sections)}
                  onChange={(e) => updateSectionConfig(activeSection.id, { fontColor: e.target.value })}
                  style={{ width: '2rem', height: '2rem', padding: '0.1rem', cursor: 'pointer', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)' }}
                />
              </div>

              <div className="control-group">
                <label>
                  <input type="checkbox" checked={activeSection.bold}
                    onChange={(e) => { saveHistory(sections); updateSectionConfig(activeSection.id, { bold: e.target.checked }); }}
                    style={{ width: 'auto', marginRight: '0.5rem' }} />
                  {t('bold')}
                </label>
              </div>
            </>
          )}

          {/* ── Border thickness (all types) ── */}
          <div className="control-group">
            <label>{t('border_thickness')}</label>
            <input type="text"
              value={activeSection.borderThickness || 0}
              onFocus={() => saveHistory(sections)}
              onChange={(e) => updateSectionConfig(activeSection.id, { borderThickness: e.target.value })} />
          </div>
        </div>
      ) : (
        <p>{t('select_element_prompt')}</p>
      )}
    </div>
  );
}

export default SidebarRight;
