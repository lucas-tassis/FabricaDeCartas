import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

function SidebarLeft({ file, handleFileUpload, columns, sections, onLinkColumn, columnTypes, onColumnTypeChange, onSelectSection, onReorderColumns }) {
  const { t } = useTranslation();
  const dragIndex = useRef(null);
  const [dropTarget, setDropTarget] = useState(null);

  return (
    <div className="sidebar glass-panel sidebar-padding" onClick={(e) => e.stopPropagation()}>
      <h2>{t('base_data')}</h2>

      <label className="file-upload-wrapper">
        <input type="file" className="file-input" accept=".xlsx,.csv" onChange={handleFileUpload} />
        <p><strong>{file ? file.name : t('click_to_upload')}</strong></p>
        <p className="upload-hint">{t('upload_formats')}</p>
      </label>

      {columns.length > 0 && (
        <div className="columns-panel">
          <h3>{t('available_columns')}</h3>
          <ul className="column-list">
            {columns.map((col, idx) => {
              const linkedSection = sections.find(s => s.linkedColumn === col);
              return (
                <li
                  key={col}
                  className={`column-item${dropTarget === idx ? ' column-item--drop-target' : ''}`}
                  draggable
                  onDragStart={() => { dragIndex.current = idx; }}
                  onDragOver={(e) => { e.preventDefault(); setDropTarget(idx); }}
                  onDragLeave={() => setDropTarget(null)}
                  onDrop={() => { onReorderColumns(dragIndex.current, idx); setDropTarget(null); }}
                  onDragEnd={() => { dragIndex.current = null; setDropTarget(null); }}
                >
                  <div className="column-item-row">
                    <span className="drag-handle" title="Arrastar para reordenar">⠿</span>
                    <span
                      className={`column-id-area${linkedSection ? ' column-id-area--linked' : ''}`}
                      title={linkedSection ? linkedSection.name : undefined}
                      onClick={() => linkedSection && onSelectSection(linkedSection.id)}
                    >
                      {linkedSection
                        ? <span className="column-color-dot" style={{ background: linkedSection.color }} />
                        : <span className="column-color-dot column-color-dot--empty" />
                      }
                      <span className="column-name" title={col}>{col}</span>
                    </span>
                    <select
                      value={linkedSection ? linkedSection.id : ''}
                      onChange={(e) => onLinkColumn(col, e.target.value)}
                      className="column-section-select"
                    >
                      <option value="">{t('sections')}…</option>
                      {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  <div className="segmented-control">
                    {[
                      { value: 'text',   label: t('type_text') },
                      { value: 'image',  label: t('type_image') },
                      { value: 'bordas', label: t('type_bordas') },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        className={`segmented-btn${(columnTypes[col] || 'text') === value ? ' segmented-btn--active' : ''}`}
                        onClick={() => onColumnTypeChange(col, value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

    </div>
  );
}

export default SidebarLeft;
