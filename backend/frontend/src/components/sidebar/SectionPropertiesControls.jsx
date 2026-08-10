import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../api/client';
import { safeParse } from '../../utils';

const BUILTIN_FONTS = ['Helvetica', 'Times', 'Courier'];

function SectionPropertiesControls({
  activeSection,
  updateSectionConfig,
  columnTypes,
  sections,
  saveHistory,
  systemFonts,
  setSystemFonts,
  refreshFonts,
  moveSectionUp,
  moveSectionDown,
  moveSectionToFront,
  moveSectionToBack,
}) {
  const { t } = useTranslation();
  const fontInputRef = useRef(null);

  if (!activeSection) {
    return (
      <div className="sidebar-group">
        <div className="props-divider" />
        <p className="no-selection-hint">{t('select_section_to_edit')}</p>
      </div>
    );
  }

  const sectionIndex = sections ? sections.findIndex(s => s.id === activeSection.id) : 0;
  const totalSections = sections ? sections.length : 1;

  const effectiveType = activeSection.linkedColumn
    ? columnTypes?.[activeSection.linkedColumn] || 'text'
    : 'text';

  const isBordas = effectiveType === 'bordas';
  const isImage = effectiveType === 'image';
  const allFonts = Array.from(new Set([...BUILTIN_FONTS, ...systemFonts])).sort();

  const handleFontUpload = async (e) => {
    const fontFile = e.target.files?.[0];
    if (!fontFile) return;

    try {
      await api.uploadFont(fontFile);
      const familyName = fontFile.name.replace(/\.[^/.]+$/, '');
      const fontUrl = URL.createObjectURL(fontFile);
      const fontFace = new FontFace(familyName, `url(${fontUrl})`);
      await fontFace.load();
      document.fonts.add(fontFace);

      if (refreshFonts) refreshFonts();
      saveHistory(sections);
      updateSectionConfig(activeSection.id, { fontFamily: familyName });
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
      const uniqueFamilies = Array.from(new Set(localFonts.map((f) => f.family))).sort();
      setSystemFonts((prev) => Array.from(new Set([...prev, ...uniqueFamilies])).sort());
      alert(`${uniqueFamilies.length} famílias de fontes do seu computador foram adicionadas à lista!`);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        alert("Permissão negada para acessar as fontes do computador.");
      } else {
        alert("Erro ao buscar fontes locais: " + (err.message || String(err)));
      }
    }
  };

  return (
    <div className="sidebar-group">
      <div className="props-divider" />
      <h3>{activeSection.name}</h3>

      {/* Camadas (Ordem de Sobreposição) */}
      <div className="control-group" style={{ marginBottom: '0.8rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-color)' }}>
        <label>Camada ({sectionIndex + 1} / {totalSections})</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '4px' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.25rem' }}
            disabled={sectionIndex >= totalSections - 1}
            onClick={() => moveSectionUp && moveSectionUp(activeSection.id)}
            title="Subir Camada"
          >
            ⬆️ Subir
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.25rem' }}
            disabled={sectionIndex <= 0}
            onClick={() => moveSectionDown && moveSectionDown(activeSection.id)}
            title="Descer Camada"
          >
            ⬇️ Descer
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.25rem' }}
            disabled={sectionIndex >= totalSections - 1}
            onClick={() => moveSectionToFront && moveSectionToFront(activeSection.id)}
            title="Trazer para o Topo"
          >
            🔝 Topo
          </button>
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.25rem' }}
            disabled={sectionIndex <= 0}
            onClick={() => moveSectionToBack && moveSectionToBack(activeSection.id)}
            title="Enviar ao Fundo"
          >
            🔚 Fundo
          </button>
        </div>
      </div>

      <div className="control-group">
        <label>{t('section_bg_color')}</label>
        <div className="color-with-clear">
          <input
            type="color"
            value={activeSection.backgroundColor || '#ffffff'}
            onChange={(e) => updateSectionConfig(activeSection.id, { backgroundColor: e.target.value })}
          />
          {activeSection.backgroundColor ? (
            <button
              type="button"
              className="clear-color-btn"
              onClick={() => updateSectionConfig(activeSection.id, { backgroundColor: '' })}
            >
              {t('clear_bg_color')}
            </button>
          ) : (
            <span className="no-bg-label">{t('transparent_bg')}</span>
          )}
        </div>
      </div>

      <div className="control-group">
        <label>{t('rotation')}</label>
        <input
          type="number"
          value={activeSection.rotation ?? 0}
          onChange={(e) => updateSectionConfig(activeSection.id, { rotation: safeParse(e.target.value, 0) })}
          placeholder="0"
        />
      </div>

      {!isBordas && !isImage && (
        <>
          <div className="control-group">
            <label>{t('font')}</label>
            <select
              value={activeSection.fontFamily || 'Helvetica'}
              onChange={(e) => updateSectionConfig(activeSection.id, { fontFamily: e.target.value })}
            >
              {allFonts.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <input
              type="file"
              accept=".ttf,.otf"
              ref={fontInputRef}
              style={{ display: 'none' }}
              onChange={handleFontUpload}
            />
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '0.78rem', padding: '0.35rem 0.6rem', marginBottom: '0.4rem' }}
              onClick={() => fontInputRef.current?.click()}
            >
              + {t('upload_font')}
            </button>

            {'queryLocalFonts' in window && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ width: '100%', fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                onClick={handleScanLocalFonts}
              >
                🔍 {t('scan_local_fonts')}
              </button>
            )}
          </div>

          <div className="control-group">
            <label>{t('horizontal_align')}</label>
            <select
              value={activeSection.textAlign || 'center'}
              onChange={(e) => updateSectionConfig(activeSection.id, { textAlign: e.target.value })}
            >
              <option value="left">{t('align_left')}</option>
              <option value="center">{t('align_center')}</option>
              <option value="right">{t('align_right')}</option>
            </select>
          </div>

          <div className="control-group">
            <label>{t('vertical_align')}</label>
            <select
              value={activeSection.vAlign || 'center'}
              onChange={(e) => updateSectionConfig(activeSection.id, { vAlign: e.target.value })}
            >
              <option value="top">{t('valign_top')}</option>
              <option value="center">{t('valign_middle')}</option>
              <option value="bottom">{t('valign_bottom')}</option>
            </select>
          </div>

          <div className="control-group">
            <label>{t('font_size')}</label>
            <input
              type="number"
              value={activeSection.fontSize}
              onChange={(e) => updateSectionConfig(activeSection.id, { fontSize: e.target.value })}
            />
          </div>

          <div className="control-group">
            <label>{t('color')}</label>
            <input
              type="color"
              value={activeSection.fontColor}
              onChange={(e) => updateSectionConfig(activeSection.id, { fontColor: e.target.value })}
            />
          </div>

          <div className="control-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={activeSection.bold || false}
                onChange={(e) => updateSectionConfig(activeSection.id, { bold: e.target.checked })}
              />
              {t('bold')}
            </label>
          </div>
        </>
      )}

      {isImage && (
        <>
          <div className="control-group">
            <label>{t('image_fit')}</label>
            <select
              value={activeSection.imageFit || 'smart'}
              onChange={(e) => updateSectionConfig(activeSection.id, { imageFit: e.target.value })}
            >
              <option value="smart">{t('fit_smart')}</option>
              <option value="contain">{t('fit_contain')}</option>
              <option value="cover">{t('fit_cover')}</option>
              <option value="fill">{t('fit_fill')}</option>
              <option value="none">{t('fit_none')}</option>
            </select>
          </div>

          <div className="control-group">
            <label>{t('brightness')}: {activeSection.brightness ?? 100}%</label>
            <input
              type="range"
              min="0"
              max="200"
              value={activeSection.brightness ?? 100}
              onChange={(e) => updateSectionConfig(activeSection.id, { brightness: parseInt(e.target.value, 10) })}
            />
          </div>

          <div className="control-group">
            <label>{t('contrast')}: {activeSection.contrast ?? 100}%</label>
            <input
              type="range"
              min="0"
              max="200"
              value={activeSection.contrast ?? 100}
              onChange={(e) => updateSectionConfig(activeSection.id, { contrast: parseInt(e.target.value, 10) })}
            />
          </div>
        </>
      )}

      <div className="control-group">
        <label>{t('border_mm')}</label>
        <input
          type="number"
          step="0.1"
          value={activeSection.borderThickness ?? 0.2}
          onChange={(e) => updateSectionConfig(activeSection.id, { borderThickness: e.target.value })}
        />
      </div>
    </div>
  );
}

export default SectionPropertiesControls;
