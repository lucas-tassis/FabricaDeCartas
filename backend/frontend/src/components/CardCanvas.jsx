import { Fragment, useState, useCallback, useRef, useEffect } from 'react';
import { MM_TO_PX, MM_TO_PT } from '../constants';
import { getSectionBounds, safeParse } from '../utils';

const HANDLE_DIRS = ['n', 's', 'w', 'e'];
const HANDLE_CURSOR = { n: 'ns-resize', s: 'ns-resize', w: 'ew-resize', e: 'ew-resize' };

function getHandlePos(dir, bounds) {
  const { minX, minY, width, height } = bounds;
  if (dir === 'n') return { left: minX + width / 2, top: minY };
  if (dir === 's') return { left: minX + width / 2, top: minY + height };
  if (dir === 'w') return { left: minX,              top: minY + height / 2 };
  if (dir === 'e') return { left: minX + width,      top: minY + height / 2 };
}

function CardCanvas({
  canvasRef,
  template,
  gridSize,
  sections,
  selectionBox,
  selectedSquares,
  activeSectionId,
  zoom,
  pan,
  isPanning,
  onCanvasMouseDown,
  onWheel,
  onStartPan,
  onContextMenu,
  onSectionClick,
  onResizeStart,
  onSectionDragStart,
  isDragging,
  showBleedGuides,
  firstRow,
  columnTypes,
  totalRows,
  showPreviewCard1,
  setShowPreviewCard1,
}) {
  const canvasWidthPx = safeParse(template.cardWidth, 63.5) * MM_TO_PX;
  const canvasHeightPx = safeParse(template.cardHeight, 88) * MM_TO_PX;
  const gridPx = safeParse(gridSize, 0.5) * MM_TO_PX;

  const [gridPos, setGridPos] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheelRaw = (e) => {
      e.preventDefault();
      onWheel(e);
    };
    el.addEventListener('wheel', handleWheelRaw, { passive: false });
    return () => el.removeEventListener('wheel', handleWheelRaw);
  }, [onWheel]);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    setGridPos({
      col: Math.floor(x / gridPx) + 1,
      row: Math.floor(y / gridPx) + 1,
      screenX: e.clientX,
      screenY: e.clientY,
    });
  }, [gridPx, zoom]);

  const handleMouseLeave = useCallback(() => setGridPos(null), []);

  return (
    <div
      ref={containerRef}
      className="card-canvas-container"
      onMouseDown={onStartPan}
      style={{ cursor: isDragging ? 'grabbing' : isPanning ? 'grabbing' : 'default' }}
    >
      {firstRow && (
        <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 300, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className={`btn ${showPreviewCard1 ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}
            onClick={(e) => { e.stopPropagation(); setShowPreviewCard1?.(!showPreviewCard1); }}
          >
            {showPreviewCard1 ? '👁️ Pré-visualizar (Carta 1)' : '📝 Modo Estrutura [Colunas]'}
          </button>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.7)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
            Total: {totalRows} carta{totalRows !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <div
          className="card-canvas"
          ref={canvasRef}
          onMouseDown={onCanvasMouseDown}
          onContextMenu={onContextMenu}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: `${canvasWidthPx}px`,
            height: `${canvasHeightPx}px`,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            backgroundSize: `${gridPx}px ${gridPx}px`,
            border: safeParse(template.cardBorderThickness, 0.3) > 0
              ? `${safeParse(template.cardBorderThickness, 0.3) * MM_TO_PX}px solid ${template.cardBorderColor || '#000000'}`
              : '1px dashed #cccccc',
          }}
        >
          {template.cardBackgroundImage && (
            <img
              src={
                template.cardBackgroundImage.startsWith('http://') || template.cardBackgroundImage.startsWith('https://') || template.cardBackgroundImage.startsWith('data:')
                  ? template.cardBackgroundImage
                  : `/api/images/view/${encodeURIComponent(template.cardBackgroundImage)}`
              }
              alt="Fundo da Carta"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: template.cardBackgroundFit === 'contain' ? 'contain' : template.cardBackgroundFit === 'fill' ? 'fill' : 'cover',
                pointerEvents: 'none',
                zIndex: 0,
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          {showBleedGuides && (
            <div
              className="bleed-guide"
              style={{
                position: 'absolute',
                left: `${3 * MM_TO_PX}px`,
                top: `${3 * MM_TO_PX}px`,
                width: `${canvasWidthPx - 6 * MM_TO_PX}px`,
                height: `${canvasHeightPx - 6 * MM_TO_PX}px`,
                border: '1.5px dashed #ef4444',
                pointerEvents: 'none',
                zIndex: 100,
                boxSizing: 'border-box',
              }}
            />
          )}
          {selectionBox && (
            <div
              className="selection-box"
              style={{
                left: `${Math.min(selectionBox.startX, selectionBox.endX)}px`,
                top: `${Math.min(selectionBox.startY, selectionBox.endY)}px`,
                width: `${Math.abs(selectionBox.endX - selectionBox.startX) + gridPx}px`,
                height: `${Math.abs(selectionBox.endY - selectionBox.startY) + gridPx}px`,
                backgroundColor: selectionBox.isAdding ? 'rgba(59, 130, 246, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                borderColor: selectionBox.isAdding ? '#3b82f6' : '#ef4444',
              }}
            />
          )}

          {selectedSquares.map(key => {
            const [x, y] = key.split(',').map(Number);
            return (
              <div key={key} className="selected-cell" style={{
                left: `${x}px`,
                top: `${y}px`,
                width: `${gridPx}px`,
                height: `${gridPx}px`,
              }} />
            );
          })}

          {sections.map((section) => {
            const bounds = getSectionBounds(section, gridPx, canvasWidthPx, canvasHeightPx);
            const isSelected = activeSectionId === section.id;
            const linkedCol = section.linkedColumn;
            const colType = linkedCol ? (columnTypes?.[linkedCol] || 'text') : 'text';
            const rawVal = (firstRow && linkedCol) ? (firstRow[linkedCol] ?? '') : '';
            const isPreviewActive = showPreviewCard1 && firstRow && linkedCol;

            let imageUrl = null;
            if (isPreviewActive && colType === 'image' && rawVal) {
              if (rawVal.startsWith('http://') || rawVal.startsWith('https://') || rawVal.startsWith('data:')) {
                imageUrl = rawVal;
              } else {
                imageUrl = `/api/images/view/${encodeURIComponent(rawVal)}`;
              }
            }

            let bgFillColor = section.backgroundColor || undefined;
            if (colType === 'bordas') {
              bgFillColor = section.color || '#3b82f6';
              if (isPreviewActive && rawVal && rawVal.trim()) {
                let c = rawVal.trim();
                if (/^[0-9a-fA-F]{3,6}$/.test(c)) c = '#' + c;
                bgFillColor = c;
              }
            }

            return (
              <Fragment key={section.id}>
                {section.squares.map(key => {
                  const [x, y] = key.split(',').map(Number);
                  const sqW = (x + gridPx >= canvasWidthPx) ? canvasWidthPx - x : gridPx;
                  const sqH = (y + gridPx >= canvasHeightPx) ? canvasHeightPx - y : gridPx;
                  return (
                    <div key={key} className="section-cell" style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      width: `${sqW}px`,
                      height: `${sqH}px`,
                      backgroundColor: section.color,
                    }} />
                  );
                })}
                <div
                  className={`draggable-item${isSelected ? ' selected' : ''}`}
                  onMouseDown={(e) => {
                    if (e.button !== 0) return;
                    if (e.shiftKey || e.ctrlKey || e.metaKey) return;
                    e.stopPropagation();
                    e.preventDefault();
                    onSectionClick(section.id);
                    onSectionDragStart(e, section.id, bounds);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onContextMenu={(e) => { e.preventDefault(); onSectionClick(section.id); onContextMenu(e); }}
                  style={{
                    left: `${bounds.minX}px`,
                    top: `${bounds.minY}px`,
                    width: `${bounds.width}px`,
                    height: `${bounds.height}px`,
                    justifyContent: linkedCol
                      ? (section.textAlign === 'center' ? 'center' : section.textAlign === 'right' ? 'flex-end' : 'flex-start')
                      : 'center',
                    alignItems: linkedCol
                      ? (section.vAlign === 'top' ? 'flex-start' : section.vAlign === 'bottom' ? 'flex-end' : 'center')
                      : 'center',
                    fontSize: `${safeParse(section.fontSize, 12) * (MM_TO_PX / MM_TO_PT)}px`,
                    fontFamily: section.fontFamily || 'Helvetica, sans-serif',
                    color: section.fontColor || '#000000',
                    fontWeight: section.bold ? 'bold' : 'normal',
                    textAlign: section.textAlign,
                    backgroundColor: bgFillColor,
                    border: safeParse(section.borderThickness, 0) > 0
                      ? `${safeParse(section.borderThickness, 0) * (MM_TO_PX / MM_TO_PT)}px solid ${section.fontColor || '#000000'}`
                      : 'none',
                    outline: isSelected ? '2px dashed var(--primary)' : 'none',
                    transform: safeParse(section.rotation, 0) ? `rotate(${safeParse(section.rotation, 0)}deg)` : undefined,
                    transformOrigin: 'center center',
                    overflow: 'hidden',
                  }}
                >
                  {colType === 'image' ? (
                    imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={linkedCol}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: section.imageFit === 'contain' ? 'contain' : section.imageFit === 'cover' ? 'cover' : section.imageFit === 'fill' ? 'fill' : 'scale-down',
                          filter: `brightness(${section.brightness ?? 100}%) contrast(${section.contrast ?? 100}%)`,
                          pointerEvents: 'none',
                        }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', opacity: 0.85, fontSize: '0.85em', fontWeight: 600 }}>
                        🖼️ <span>{isPreviewActive ? (rawVal || linkedCol) : linkedCol ? `[${linkedCol}]` : section.name}</span>
                      </div>
                    )
                  ) : colType === 'bordas' ? (
                    <div style={{ width: '100%', height: '100%', backgroundColor: bgFillColor }} />
                  ) : (
                    <span>{isPreviewActive ? (rawVal || `[${linkedCol}]`) : (linkedCol ? `[${linkedCol}]` : section.name.replace(/\D+/g, ''))}</span>
                  )}
                </div>

                {isSelected && HANDLE_DIRS.map(dir => {
                  const pos = getHandlePos(dir, bounds);
                  return (
                    <div
                      key={`rh-${section.id}-${dir}`}
                      onMouseDown={e => onResizeStart(e, section.id, dir)}
                      style={{
                        position: 'absolute',
                        left: `${pos.left}px`,
                        top: `${pos.top}px`,
                        width: 10,
                        height: 10,
                        background: '#ffffff',
                        border: '2px solid #333333',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        cursor: HANDLE_CURSOR[dir],
                        zIndex: 200,
                        boxSizing: 'border-box',
                      }}
                    />
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>
      {gridPos && (
        <div
          className="grid-pos-badge"
          style={{ left: gridPos.screenX + 16, top: gridPos.screenY + 16 }}
        >
          {selectionBox
            ? `${Math.round(Math.abs(selectionBox.endX - selectionBox.startX) / gridPx) + 1} × ${Math.round(Math.abs(selectionBox.endY - selectionBox.startY) / gridPx) + 1}`
            : `${gridPos.col} × ${gridPos.row}`
          }
        </div>
      )}
    </div>
  );
}

export default CardCanvas;
