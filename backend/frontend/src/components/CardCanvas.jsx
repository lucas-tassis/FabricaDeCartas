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
                    if (e.shiftKey || e.ctrlKey || e.metaKey) {
                      // Let event bubble to canvas to select squares
                      return;
                    }
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
                    justifyContent: section.linkedColumn
                      ? (section.textAlign === 'center' ? 'center' : section.textAlign === 'right' ? 'flex-end' : 'flex-start')
                      : 'center',
                    alignItems: section.linkedColumn
                      ? (section.vAlign === 'top' ? 'flex-start' : section.vAlign === 'bottom' ? 'flex-end' : 'center')
                      : 'center',
                    fontSize: `${safeParse(section.fontSize, 12) * (MM_TO_PX / MM_TO_PT)}px`,
                    color: section.fontColor,
                    fontWeight: section.bold ? 'bold' : 'normal',
                    textAlign: section.textAlign,
                    border: safeParse(section.borderThickness, 0) > 0
                      ? `${safeParse(section.borderThickness, 0) * (MM_TO_PX / MM_TO_PT)}px solid ${section.fontColor}`
                      : 'none',
                    outline: isSelected ? '2px dashed var(--primary)' : 'none',
                    transform: safeParse(section.rotation, 0) ? `rotate(${safeParse(section.rotation, 0)}deg)` : undefined,
                    transformOrigin: 'center center',
                  }}
                >
                  {section.linkedColumn ? `[${section.linkedColumn}]` : section.name.replace(/\D+/g, '')}
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
