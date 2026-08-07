import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import CardCanvas from './components/CardCanvas';
import ImageAssets from './components/ImageAssets';
import { useCanvas } from './hooks/useCanvas';
import { useSections } from './hooks/useSections';
import { api } from './api/client';
import {
  MM_TO_PX, MM_TO_PT,
  DEFAULT_GRID_SIZE_MM, DEFAULT_CARD_WIDTH_MM, DEFAULT_CARD_HEIGHT_MM,
  URL_REVOKE_DELAY_MS, EXPORT_BUTTON_OPACITY_DISABLED,
} from './constants';
import { buildDownloadLink, getSectionBounds, safeParse } from './utils';
import './index.css';

function App() {
  const { t } = useTranslation();

  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [columnTypes, setColumnTypes] = useState({});
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [modal, setModal] = useState(null); // { type: 'success' | 'error' }
  const [isShutdown, setIsShutdown] = useState(false);

  const handleShutdown = async () => {
    if (!window.confirm(t('shutdown') + '?')) return;
    try {
      await api.shutdown();
      setIsShutdown(true);
    } catch (err) {
      console.error(err);
      setIsShutdown(true);
    }
  };

  useEffect(() => {
    if (!modal) return;
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setModal(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal]);

  const [template, setTemplate] = useState({
    cardWidth: DEFAULT_CARD_WIDTH_MM,
    cardHeight: DEFAULT_CARD_HEIGHT_MM,
    columns: [],
    cardBorderColor: '#000000',
    cardBorderThickness: 0.3,
    rotate90ForPrint: false,
  });
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE_MM);
  const [showBleedGuides, setShowBleedGuides] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);

  const {
    sections, setSections, activeSectionId, setActiveSectionId,
    activeSection, createSection, removeSection, updateSectionConfig, linkColumnToSection,
    undo, redo, history, future, saveHistory,
  } = useSections();

  const {
    canvasRef, zoom, pan, isPanning,
    selectedSquares, setSelectedSquares,
    selectionBox, contextMenu, setContextMenu,
    handleCanvasMouseDown, handleMouseMove, handleMouseUp,
    handleWheel, handleContextMenu, startPan,
    handleResizeStart,
    handleSectionDragStart,
    isDragging,
  } = useCanvas(gridSize, sections, setSections, template, saveHistory, snapToGrid);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        } else if (e.key.toLowerCase() === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const [firstRow, setFirstRow] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [showPreviewCard1, setShowPreviewCard1] = useState(true);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    try {
      const res = await api.previewData(uploadedFile);
      const cols = res.columns || [];
      setColumns(cols);
      setFirstRow(res.firstRow || null);
      setTotalRows(res.totalRows || 0);
      const initialTypes = {};
      cols.forEach(col => { initialTypes[col] = 'text'; });
      setColumnTypes(initialTypes);
    } catch (err) {
      setLastError(err.serverDetail || err.message || String(err));
      setModal({ type: 'error' });
    }
  };

  const handleColumnTypeChange = (col, type) => {
    setColumnTypes(prev => ({ ...prev, [col]: type }));
  };

  const reorderColumns = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setColumns(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const generateCards = async () => {
    if (!file) return;


    const canvasWidthPx = safeParse(template.cardWidth, DEFAULT_CARD_WIDTH_MM) * MM_TO_PX;
    const canvasHeightPx = safeParse(template.cardHeight, DEFAULT_CARD_HEIGHT_MM) * MM_TO_PX;
    const gridPx = safeParse(gridSize, DEFAULT_GRID_SIZE_MM) * MM_TO_PX;

    const sectionToConfig = (s) => {
      const bounds = getSectionBounds(s, gridPx, canvasWidthPx, canvasHeightPx);
      const colType = s.linkedColumn ? (columnTypes[s.linkedColumn] || 'text') : 'text';
      return {
        columnName: s.linkedColumn || '',
        x: (bounds.minX / MM_TO_PX) * MM_TO_PT,
        y: (bounds.minY / MM_TO_PX) * MM_TO_PT,
        width: (bounds.width / MM_TO_PX) * MM_TO_PT,
        height: (bounds.height / MM_TO_PX) * MM_TO_PT,
        fontSize: safeParse(s.fontSize, 12),
        fontFamily: s.fontFamily || 'Helvetica',
        rotation: safeParse(s.rotation, 0),
        color: s.fontColor,
        bold: s.bold,
        textAlign: s.textAlign,
        vAlign: s.vAlign,
        borderThickness: safeParse(s.borderThickness, 0) * MM_TO_PT,
        type: colType,
        imageFit: s.imageFit || 'smart',
        colorSpace: s.colorSpace || 'RGB',
        backgroundColor: s.backgroundColor || '',
        brightness: safeParse(s.brightness, 100),
        contrast: safeParse(s.contrast, 100),
        squareRects: (colType === 'bordas')
          ? s.squares.map(key => {
              const [sqX, sqY] = key.split(',').map(Number);
              const sqPt = safeParse(gridSize, DEFAULT_GRID_SIZE_MM) * MM_TO_PT;
              return [(sqX / MM_TO_PX) * MM_TO_PT, (sqY / MM_TO_PX) * MM_TO_PT, sqPt, sqPt];
            })
          : null,
      };
    };

    // Unlinked sections render first (background layer), then columns in drag-reorder order
    const unlinked = sections.filter(s => !s.linkedColumn);
    const linked = columns
      .map(col => sections.find(s => s.linkedColumn === col))
      .filter(Boolean);

    const templateInPoints = {
      cardWidth: safeParse(template.cardWidth, DEFAULT_CARD_WIDTH_MM) * MM_TO_PT,
      cardHeight: safeParse(template.cardHeight, DEFAULT_CARD_HEIGHT_MM) * MM_TO_PT,
      columns: [...unlinked, ...linked].map(sectionToConfig),
      cardBorderColor: template.cardBorderColor || '#000000',
      cardBorderThickness: safeParse(template.cardBorderThickness, 0.3) * MM_TO_PT,
      cardBackgroundImage: template.cardBackgroundImage || '',
      cardBackgroundFit: template.cardBackgroundFit || 'cover',
      cardBackType: template.cardBackType || 'none',
      cardBackValue: template.cardBackValue || '',
      cardBackDirection: template.cardBackDirection || 'separate',
      cardBackFit: template.cardBackFit || 'cover',
      rotate90ForPrint: !!template.rotate90ForPrint,
    };

    const ext = exportFormat === 'pdf' ? '.pdf' : '.zip';
    const mime = exportFormat === 'pdf' ? 'application/pdf' : 'application/zip';
    const suggestedName = `cards${ext}`;
    let handle = null;

    if (window.showSaveFilePicker) {
      try {
        handle = await window.showSaveFilePicker({
          suggestedName,
          types: [{ description: exportFormat === 'pdf' ? 'PDF' : 'ZIP', accept: { [mime]: [ext] } }],
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
        setLastError(`${t('error_file_access')}\n\n${err.name}: ${err.message}`);
        setModal({ type: 'error' });
        return;
      }
    }

    setIsExporting(true);
    setLastError(null);
    try {
      const blob = await api.generateCards(file, templateInPoints, exportFormat);

      if (handle) {
        try {
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (err) {
          const isLocked = err.name === 'NotAllowedError' || err.name === 'InvalidStateError'
            || (err.message && err.message.toLowerCase().includes('lock'));
          const msg = isLocked ? t('error_file_locked') : `${err.name}: ${err.message}`;
          setLastError(msg);
          setModal({ type: 'error' });
          return;
        }

        // Chrome/Edge silently fail the rename when the file is locked —
        // close() resolves without error but the file on disk is not updated.
        // Verify by comparing sizes.
        try {
          const written = await handle.getFile();
          if (written.size !== blob.size) {
            setLastError(t('error_file_locked'));
            setModal({ type: 'error' });
            return;
          }
        } catch { /* getFile() failing means write also failed */
          setLastError(t('error_file_locked'));
          setModal({ type: 'error' });
          return;
        }
      } else {
        const url = buildDownloadLink(blob, suggestedName);
        setTimeout(() => window.URL.revokeObjectURL(url), URL_REVOKE_DELAY_MS);
      }

      setModal({ type: 'success' });
    } catch (err) {
      const detail = err.serverDetail || err.message || String(err);
      setLastError(detail);
      setModal({ type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleContextMenuWithSection = (e) => {
    handleContextMenu(e, activeSectionId, setActiveSectionId);
  };

  const handleCreateSection = () => {
    createSection(selectedSquares, () => {
      setSelectedSquares([]);
      setContextMenu(null);
    });
  };

  const handleRemoveSection = (id) => {
    removeSection(id);
    setContextMenu(null);
  };

  const fileInputRef = useRef(null);

  const saveProject = async () => {
    let handle = null;
    if (window.showSaveFilePicker) {
      try {
        handle = await window.showSaveFilePicker({
          suggestedName: 'layout.json',
          types: [{ description: 'JSON Layout', accept: { 'application/json': ['.json'] } }],
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error(err);
      }
    }

    const blob = new Blob([JSON.stringify({ template, gridSize, sections, columnTypes, showBleedGuides, snapToGrid }, null, 2)], {
      type: 'application/json',
    });

    if (handle) {
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    }

    const url = buildDownloadLink(blob, 'layout.json');
    setTimeout(() => window.URL.revokeObjectURL(url), URL_REVOKE_DELAY_MS);
  };

  const loadProject = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.template) setTemplate(data.template);
        if (data.gridSize) setGridSize(data.gridSize);
        if (data.sections) setSections(data.sections);
        if (data.columnTypes) setColumnTypes(data.columnTypes);
        if (data.showBleedGuides !== undefined) setShowBleedGuides(data.showBleedGuides);
        if (data.snapToGrid !== undefined) setSnapToGrid(data.snapToGrid);
      } catch {
        alert(t('error_load_layout'));
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(uploadedFile);
  };

  if (isShutdown) {
    return (
      <div className="shutdown-overlay">
        <div className="shutdown-box glass-panel">
          <h2>{t('shutdown')}</h2>
          <p>{t('shutdown_message')}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="app-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => { setContextMenu(null); setActiveSectionId(null); }}
    >
      <input
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={loadProject}
      />

      <header>
        <img src="/logo.png" alt="Logo" className="header-logo" />
        <div className="header-controls">
          <h1>{t('app_title')}</h1>
          <div className="header-layout-buttons">
            <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
              {t('load_layout')}
            </button>
            <button className="btn btn-outline" onClick={saveProject}>
              {t('save_layout')}
            </button>
            <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); undo(); }} disabled={history.length === 0} title="Ctrl+Z">
              {t('undo')}
            </button>
            <button className="btn btn-outline" onClick={(e) => { e.stopPropagation(); redo(); }} disabled={future.length === 0} title="Ctrl+Y">
              {t('redo')}
            </button>
            <button className="btn btn-outline btn-shutdown" onClick={handleShutdown}>
              {t('shutdown')}
            </button>
          </div>
          {file && (
            <div className="header-export-controls">
              <select
                className="export-format-select"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="pdf">{t('format_pdf')}</option>
                <option value="jpg">{t('format_jpg_zip')}</option>
              </select>
              <button
                className={`btn btn-primary${isExporting ? ' btn-exporting' : ''}`}
                onClick={generateCards}
                disabled={isExporting}
                style={{ opacity: isExporting ? EXPORT_BUTTON_OPACITY_DISABLED : 1 }}
              >
                {isExporting ? t('exporting') : t('generate_cards')}
              </button>
            </div>
          )}
        </div>
      </header>

      <main>
        {contextMenu && (
          <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
            {contextMenu.sectionId ? (
              <div className="menu-item" onClick={(e) => { e.stopPropagation(); handleRemoveSection(contextMenu.sectionId); }}>
                {t('remove_section')}
              </div>
            ) : (
              <div className="menu-item" onClick={(e) => { e.stopPropagation(); handleCreateSection(); }}>
                {t('create_section')}
              </div>
            )}
          </div>
        )}

        <SidebarLeft
          file={file}
          handleFileUpload={handleFileUpload}
          columns={columns}
          sections={sections}
          onLinkColumn={linkColumnToSection}
          columnTypes={columnTypes}
          onColumnTypeChange={handleColumnTypeChange}
          onSelectSection={setActiveSectionId}
          onReorderColumns={reorderColumns}
        />

        <div className="editor-area">
          <CardCanvas
            canvasRef={canvasRef}
            template={template}
            gridSize={gridSize}
            sections={sections}
            selectionBox={selectionBox}
            selectedSquares={selectedSquares}
            activeSectionId={activeSectionId}
            zoom={zoom}
            pan={pan}
            isPanning={isPanning}
            onCanvasMouseDown={handleCanvasMouseDown}
            onWheel={handleWheel}
            onStartPan={startPan}
            onContextMenu={handleContextMenuWithSection}
            onSectionClick={setActiveSectionId}
            onResizeStart={handleResizeStart}
            onSectionDragStart={handleSectionDragStart}
            isDragging={isDragging}
            showBleedGuides={showBleedGuides}
            firstRow={firstRow}
            columnTypes={columnTypes}
            totalRows={totalRows}
            showPreviewCard1={showPreviewCard1}
            setShowPreviewCard1={setShowPreviewCard1}
          />
          <ImageAssets />
        </div>

        <SidebarRight
          template={template}
          setTemplate={setTemplate}
          gridSize={gridSize}
          setGridSize={setGridSize}
          activeSection={activeSection}
          updateSectionConfig={updateSectionConfig}
          columnTypes={columnTypes}
          sections={sections}
          saveHistory={saveHistory}
          columns={columns}
          showBleedGuides={showBleedGuides}
          setShowBleedGuides={setShowBleedGuides}
          snapToGrid={snapToGrid}
          setSnapToGrid={setSnapToGrid}
          showPreviewCard1={showPreviewCard1}
          setShowPreviewCard1={setShowPreviewCard1}
          firstRow={firstRow}
        />
      </main>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {modal.type === 'success' ? (
              <>
                <p className="modal-message modal-message--success">{t('export_success')}</p>
                <div className="modal-actions">
                  <button className="btn btn-primary" onClick={() => setModal(null)}>OK</button>
                </div>
              </>
            ) : (
              <>
                <p className="modal-message modal-message--error">{t('error_generate')}</p>
                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setModal(null)}>OK</button>
                  {lastError && (
                    <button
                      className="btn btn-error-log"
                      onClick={() => {
                        const blob = new Blob([lastError], { type: 'text/plain' });
                        const url = buildDownloadLink(blob, 'error.log');
                        setTimeout(() => window.URL.revokeObjectURL(url), URL_REVOKE_DELAY_MS);
                      }}
                    >
                      {t('download_error_log')}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
