import React from 'react';
import { useTranslation } from 'react-i18next';

function CardBackControls({ template, setTemplate, uploadedImages, columns }) {
  const { t } = useTranslation();

  const handleBackTypeChange = (type) => {
    setTemplate({
      ...template,
      cardBackType: type,
      cardBackValue: '',
    });
  };

  return (
    <div className="sidebar-group">
      <div className="props-divider" />
      <div className="control-group">
        <label>{t('card_back_type')}</label>
        <select
          value={template.cardBackType || 'none'}
          onChange={(e) => handleBackTypeChange(e.target.value)}
        >
          <option value="none">{t('back_none')}</option>
          <option value="default">{t('back_default')}</option>
          <option value="column">{t('back_column')}</option>
        </select>
      </div>

      {template.cardBackType === 'default' && (
        <div className="control-group">
          <label>{t('select_back_image')}</label>
          <select
            value={template.cardBackValue || ''}
            onChange={(e) => setTemplate({ ...template, cardBackValue: e.target.value })}
          >
            <option value="">{t('select_image')}</option>
            {uploadedImages.map((img) => (
              <option key={img} value={img}>
                {img}
              </option>
            ))}
          </select>
        </div>
      )}

      {template.cardBackType === 'column' && (
        <div className="control-group">
          <label>{t('select_back_column')}</label>
          <select
            value={template.cardBackValue || ''}
            onChange={(e) => setTemplate({ ...template, cardBackValue: e.target.value })}
          >
            <option value="">{t('select_column')}</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>
      )}

      {template.cardBackType !== 'none' && (
        <>
          <div className="control-group">
            <label>{t('card_back_direction')}</label>
            <select
              value={template.cardBackDirection || 'separate'}
              onChange={(e) => setTemplate({ ...template, cardBackDirection: e.target.value })}
            >
              <option value="separate">{t('back_direction_separate')}</option>
              <option value="interleaved">{t('back_direction_interleaved')}</option>
            </select>
          </div>

          <div className="control-group">
            <label>{t('card_back_fit')}</label>
            <select
              value={template.cardBackFit || 'cover'}
              onChange={(e) => setTemplate({ ...template, cardBackFit: e.target.value })}
            >
              <option value="cover">{t('fit_cover')}</option>
              <option value="contain">{t('fit_contain')}</option>
              <option value="fill">{t('fit_fill')}</option>
              <option value="smart">{t('fit_smart')}</option>
              <option value="none">{t('fit_none')}</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}

export default CardBackControls;
