// Custom hook for canvas state: grid selection, pan, zoom, context menu, resize, drag-move
import { useState, useRef, useEffect } from 'react';
import { MM_TO_PX } from '../constants';
import { getSectionBounds, safeParse, getSquaresForShape } from '../utils';

export function useCanvas(gridSize, sections, setSections, template, saveHistory, snapToGrid) {
  const parsedGridSize = safeParse(gridSize, 0.5);
  const cardWidth = safeParse(template.cardWidth, 63.5);
  const cardHeight = safeParse(template.cardHeight, 88);

  const canvasRef = useRef(null);
  const sectionsBeforeActionRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });

  // Clamp the pan position when zoom, template dimensions or container changes
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvasEl = canvasRef.current;
    const containerEl = canvasEl.closest('.card-canvas-container');
    if (!containerEl) return;

    const viewW = containerEl.clientWidth;
    const viewH = containerEl.clientHeight;
    const cardW = cardWidth * MM_TO_PX;
    const cardH = cardHeight * MM_TO_PX;

    const limitX = Math.abs(viewW - cardW * zoom) / 2;
    const limitY = Math.abs(viewH - cardH * zoom) / 2;

    setPan(prev => {
      const clampedX = Math.max(-limitX, Math.min(limitX, prev.x));
      const clampedY = Math.max(-limitY, Math.min(limitY, prev.y));
      if (clampedX !== prev.x || clampedY !== prev.y) {
        return { x: clampedX, y: clampedY };
      }
      return prev;
    });
  }, [zoom, cardWidth, cardHeight]);
  const [selectedSquares, setSelectedSquares] = useState([]);
  const [selectionBox, setSelectionBox] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [activeTool, setActiveTool] = useState('freehand');
  const [contextMenu, setContextMenu] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [dragState, setDragState] = useState(null);
  const lastMouseEventRef = useRef(null);

  // Dynamic aspect ratio constraint toggle on Ctrl / Shift keydown & keyup during selection
  useEffect(() => {
    if (!isSelecting) return;
    const handleKeyChange = (e) => {
      if ((e.key === 'Control' || e.key === 'Shift') && lastMouseEventRef.current) {
        handleMouseMove({
          ...lastMouseEventRef.current,
          ctrlKey: e.ctrlKey || e.key === 'Control',
          shiftKey: e.shiftKey || e.key === 'Shift',
        });
      }
    };
    window.addEventListener('keydown', handleKeyChange);
    window.addEventListener('keyup', handleKeyChange);
    return () => {
      window.removeEventListener('keydown', handleKeyChange);
      window.removeEventListener('keyup', handleKeyChange);
    };
  }, [isSelecting, selectionBox, zoom, parsedGridSize]);

  // ── Resize ──────────────────────────────────────────────────────────────────
 
  const handleResizeStart = (e, sectionId, handle) => {
    e.stopPropagation();
    e.preventDefault();
    sectionsBeforeActionRef.current = sections;
    setResizeState({ sectionId, handle });
  };
 
  // ── Drag-move ────────────────────────────────────────────────────────────────
 
  const handleSectionDragStart = (e, sectionId, bounds) => {
    // e.stopPropagation() and e.preventDefault() are called in the JSX handler
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top)  / zoom;
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    sectionsBeforeActionRef.current = sections;
    setDragState({
      sectionId,
      offsetX: mouseX - bounds.minX,
      offsetY: mouseY - bounds.minY,
      origSquares: [...section.squares],
      origMinX: bounds.minX,
      origMinY: bounds.minY,
    });
  };

  // ── Canvas grid selection ────────────────────────────────────────────────────

  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0) return;
    if (!canvasRef.current.contains(e.target)) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / zoom;
    const rawY = (e.clientY - rect.top) / zoom;

    const gridPx = parsedGridSize * MM_TO_PX;
    const snappedX = Math.floor(rawX / gridPx) * gridPx;
    const snappedY = Math.floor(rawY / gridPx) * gridPx;

    const key = `${snappedX},${snappedY}`;
    const isAdding = !selectedSquares.includes(key);
    setSelectionBox({ startX: snappedX, startY: snappedY, endX: snappedX, endY: snappedY, isAdding });
    setIsSelecting(true);
  };

  // ── Unified mouse move ───────────────────────────────────────────────────────

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPos.x;
      const dy = e.clientY - lastPanPos.y;
      setPan(prev => {
        const nextX = prev.x + dx;
        const nextY = prev.y + dy;

        const canvasEl = canvasRef.current;
        const containerEl = canvasEl ? canvasEl.closest('.card-canvas-container') : null;
        if (!containerEl) return { x: nextX, y: nextY };

        const viewW = containerEl.clientWidth;
        const viewH = containerEl.clientHeight;
        const cardW = cardWidth * MM_TO_PX;
        const cardH = cardHeight * MM_TO_PX;

        const limitX = Math.abs(viewW - cardW * zoom) / 2;
        const limitY = Math.abs(viewH - cardH * zoom) / 2;

        return {
          x: Math.max(-limitX, Math.min(limitX, nextX)),
          y: Math.max(-limitY, Math.min(limitY, nextY))
        };
      });
      setLastPanPos({ x: e.clientX, y: e.clientY });
      return;
    }

    const gridPx = parsedGridSize * MM_TO_PX;

    // ── Resize ──
    if (resizeState && canvasRef.current) {
      const canvasWidthPx  = cardWidth  * MM_TO_PX;
      const canvasHeightPx = cardHeight * MM_TO_PX;
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left) / zoom;
      const rawY = (e.clientY - rect.top)  / zoom;
      const snappedX = Math.round(rawX / gridPx) * gridPx;
      const snappedY = Math.round(rawY / gridPx) * gridPx;

      const section = sections.find(s => s.id === resizeState.sectionId);
      if (!section) return;

      const bounds = getSectionBounds(section, gridPx, canvasWidthPx, canvasHeightPx);
      let newMinX = bounds.minX;
      let newMinY = bounds.minY;
      let newMaxX = bounds.minX + bounds.width;
      let newMaxY = bounds.minY + bounds.height;

      const { handle } = resizeState;
      if (handle === 'n') newMinY = snappedY;
      if (handle === 's') newMaxY = snappedY;
      if (handle === 'w') newMinX = snappedX;
      if (handle === 'e') newMaxX = snappedX;

      newMinX = Math.max(0, newMinX);
      newMinY = Math.max(0, newMinY);
      newMaxX = Math.min(canvasWidthPx, newMaxX);
      newMaxY = Math.min(canvasHeightPx, newMaxY);

      if (newMaxX - newMinX < gridPx || newMaxY - newMinY < gridPx) return;

      const newSquares = [];
      const colStart = Math.round(newMinX / gridPx);
      const colEnd   = Math.round(newMaxX / gridPx);
      const rowStart = Math.round(newMinY / gridPx);
      const rowEnd   = Math.round(newMaxY / gridPx);
      for (let col = colStart; col < colEnd; col++)
        for (let row = rowStart; row < rowEnd; row++)
          newSquares.push(`${col * gridPx},${row * gridPx}`);

      if (newSquares.length === 0) return;

      setSections(prev =>
        prev.map(s => s.id === resizeState.sectionId ? { ...s, squares: newSquares } : s)
      );
      return;
    }

    // ── Drag-move ──
    if (dragState && canvasRef.current) {
      const canvasWidthPx  = cardWidth  * MM_TO_PX;
      const canvasHeightPx = cardHeight * MM_TO_PX;
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) / zoom;
      const mouseY = (e.clientY - rect.top)  / zoom;

      // Snap the section's top-left to grid
      const rawNewMinX = mouseX - dragState.offsetX;
      const rawNewMinY = mouseY - dragState.offsetY;
      const snapVal = snapToGrid ? gridPx : 1;
      const newMinX = Math.round(rawNewMinX / snapVal) * snapVal;
      const newMinY = Math.round(rawNewMinY / snapVal) * snapVal;

      const dx = newMinX - dragState.origMinX;
      const dy = newMinY - dragState.origMinY;
      if (dx === 0 && dy === 0) return;

      const newSquares = dragState.origSquares.map(key => {
        const [x, y] = key.split(',').map(Number);
        return `${x + dx},${y + dy}`;
      });

      // Must stay within canvas
      const inBounds = newSquares.every(key => {
        const [x, y] = key.split(',').map(Number);
        return x >= 0 && y >= 0 && x < canvasWidthPx && y < canvasHeightPx;
      });
      if (!inBounds) return;

      setSections(prev =>
        prev.map(s => s.id === dragState.sectionId ? { ...s, squares: newSquares } : s)
      );
      return;
    }

    // ── Grid selection ──
    if (!canvasRef.current || !isSelecting || !selectionBox) return;
    lastMouseEventRef.current = e;

    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / zoom;
    const rawY = (e.clientY - rect.top) / zoom;
    let snappedX = Math.floor(rawX / gridPx) * gridPx;
    let snappedY = Math.floor(rawY / gridPx) * gridPx;

    if (e.ctrlKey || e.shiftKey) {
      const deltaX = snappedX - selectionBox.startX;
      const deltaY = snappedY - selectionBox.startY;
      const dist = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      snappedX = selectionBox.startX + (deltaX >= 0 ? dist : -dist);
      snappedY = selectionBox.startY + (deltaY >= 0 ? dist : -dist);
    }

    setSelectionBox(prev => prev ? { ...prev, endX: snappedX, endY: snappedY } : null);
  };

  // ── Mouse up ─────────────────────────────────────────────────────────────────

  const handleMouseUp = () => {
    const wasResizing = !!resizeState;
    const wasDragging = !!dragState;

    if (resizeState) { setResizeState(null); }
    if (dragState)   { setDragState(null);   }

    if (wasResizing || wasDragging) {
      if (sectionsBeforeActionRef.current) {
        const hasChanged = JSON.stringify(sectionsBeforeActionRef.current) !== JSON.stringify(sections);
        if (hasChanged && saveHistory) {
          saveHistory(sectionsBeforeActionRef.current);
        }
        sectionsBeforeActionRef.current = null;
      }
      return;
    }

    if (isPanning) { setIsPanning(false); return; }

    if (isSelecting && selectionBox) {
      const gridPx = parsedGridSize * MM_TO_PX;
      let newSelection = [...selectedSquares];

      if (activeTool && activeTool !== 'freehand') {
        const shapeSquares = getSquaresForShape(activeTool, selectionBox.startX, selectionBox.startY, selectionBox.endX, selectionBox.endY, gridPx);
        if (selectionBox.isAdding) {
          shapeSquares.forEach(key => { if (!newSelection.includes(key)) newSelection.push(key); });
        } else {
          newSelection = newSelection.filter(k => !shapeSquares.includes(k));
        }
      } else {
        const minX = Math.min(selectionBox.startX, selectionBox.endX);
        const maxX = Math.max(selectionBox.startX, selectionBox.endX);
        const minY = Math.min(selectionBox.startY, selectionBox.endY);
        const maxY = Math.max(selectionBox.startY, selectionBox.endY);

        for (let x = minX; x <= maxX; x += gridPx) {
          for (let y = minY; y <= maxY; y += gridPx) {
            const key = `${x},${y}`;
            if (selectionBox.isAdding) {
              if (!newSelection.includes(key)) newSelection.push(key);
            } else {
              newSelection = newSelection.filter(k => k !== key);
            }
          }
        }
      }
      setSelectedSquares(newSelection);
    }

    setIsSelecting(false);
    setSelectionBox(null);
  };

  const handleWheel = (e) => {
    if (e.deltaY < 0) setZoom(z => Math.min(z + 0.1, 5));
    else              setZoom(z => Math.max(z - 0.1, 0.5));
  };

  const handleContextMenu = (e, activeSectionId, setActiveSectionId) => {
    e.preventDefault();
    if (e.target !== canvasRef.current && !e.target.classList.contains('draggable-item')) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left) / zoom;
    const rawY = (e.clientY - rect.top) / zoom;

    const gridPx = parsedGridSize * MM_TO_PX;
    const snappedX = Math.floor(rawX / gridPx) * gridPx;
    const snappedY = Math.floor(rawY / gridPx) * gridPx;
    const key = `${snappedX},${snappedY}`;

    const clickedSection = sections.find(s => s.squares.includes(key));
    const isSelected = selectedSquares.includes(key);

    if (clickedSection || isSelected) {
      if (clickedSection) setActiveSectionId(clickedSection.id);
      setContextMenu({ x: e.clientX, y: e.clientY, targetKey: key, sectionId: clickedSection ? clickedSection.id : null });
    } else {
      setContextMenu(null);
    }
  };

  const startPan = (e) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setLastPanPos({ x: e.clientX, y: e.clientY });
    }
  };

  return {
    canvasRef,
    zoom, pan, isPanning,
    selectedSquares, setSelectedSquares,
    selectionBox, isSelecting,
    activeTool, setActiveTool,
    contextMenu, setContextMenu,
    handleCanvasMouseDown, handleMouseMove, handleMouseUp,
    handleWheel, handleContextMenu, startPan,
    handleResizeStart,
    handleSectionDragStart,
    isDragging: dragState !== null,
  };
}
