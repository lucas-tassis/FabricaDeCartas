import React from 'react';
import { useTranslation } from 'react-i18next';
import { safeParse } from '../../utils';

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
  { name: 'Silver', width: 70, height: 110 },
  { name: 'Tarot', width: 70, height: 120 },
  { name: 'Quadrado Médio', width: 80, height: 80 },
  { name: 'Gold', width: 80, height: 120 },
];

function CardDimensionControls({
  template,
  setTemplate,
  gridSize,
  setGridSize,
  showBleedGuides,
  setShowBleedGuides,
  snapToGrid,
  setSnapToGrid,
  showPreviewCard1,
  setShowPreviewCard1,
  firstRow
}) {
  const { t } = useTranslation();

  const isPortrait = safeParse(template.cardWidth, 63.5) <= safeParse(template.cardHeight, 88);

  const toggleOrientation = (toPortrait) => {
    const w = safeParse(template.cardWidth, 63.5);
    const h = safeParse(template.cardHeight, 88);
    if (toPortrait && w > h) {
      setTemplate({ ...template, cardWidth: h, cardHeight: w });
    } else if (!toPortrait && w < h) {
      setTemplate({ ...template, cardWidth: h, cardHeight: w });
    }
  };

  return (
    <div className="sidebar-group">
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
          <input
            type="text"
            value={template.cardWidth}
            onChange={(e) => setTemplate({ ...template, cardWidth: e.target.value })}
            title={t('width')}
          />
          <input
            type="text"
            value={template.cardHeight}
            onChange={(e) => setTemplate({ ...template, cardHeight: e.target.value })}
            title={t('height')}
          />
        </div>
      </div>

      <div className="control-group">
        <label>{t('orientation')}</label>
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-btn${isPortrait ? ' segmented-btn--active' : ''}`}
            onClick={() => toggleOrientation(true)}
          >
            📱 {t('portrait')}
          </button>
          <button
            type="button"
            className={`segmented-btn${!isPortrait ? ' segmented-btn--active' : ''}`}
            onClick={() => toggleOrientation(false)}
          >
            🖼️ {t('landscape')}
          </button>
        </div>
      </div>

      {firstRow && (
        <div className="control-group">
          <label>{t('view_mode')}</label>
          <div className="segmented-control">
            <button
              type="button"
              className={`segmented-btn${!showPreviewCard1 ? ' segmented-btn--active' : ''}`}
              onClick={() => setShowPreviewCard1(false)}
            >
              📝 {t('view_mode_structure')}
            </button>
            <button
              type="button"
              className={`segmented-btn${showPreviewCard1 ? ' segmented-btn--active' : ''}`}
              onClick={() => setShowPreviewCard1(true)}
            >
              👁️ {t('view_mode_preview')}
            </button>
          </div>
        </div>
      )}

      <div className="control-group">
        <label>{t('grid_size')}</label>
        <input
          type="text"
          value={gridSize}
          onChange={(e) => setGridSize(e.target.value)}
        />
      </div>

      <div className="control-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showBleedGuides || false}
            onChange={(e) => setShowBleedGuides(e.target.checked)}
          />
          {t('show_bleed_guides')}
        </label>
      </div>

      <div className="control-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={snapToGrid !== false}
            onChange={(e) => setSnapToGrid(e.target.checked)}
          />
          {t('snap_to_grid')}
        </label>
      </div>

      <div className="control-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={template.rotate90ForPrint || false}
            onChange={(e) => setTemplate({ ...template, rotate90ForPrint: e.target.checked })}
          />
          {t('rotate_90_for_print')}
        </label>
      </div>
    </div>
  );
}

export default CardDimensionControls;
