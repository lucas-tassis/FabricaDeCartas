import { MM_TO_PX } from './constants';

export const getSectionBounds = (section, gridPx, canvasWidthPx, canvasHeightPx) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  section.squares.forEach(key => {
    const [x, y] = key.split(',').map(Number);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });

  let width = maxX - minX + gridPx;
  let height = maxY - minY + gridPx;

  if (canvasWidthPx && maxX + gridPx >= canvasWidthPx - gridPx) {
    width = canvasWidthPx - minX;
  }
  if (canvasHeightPx && maxY + gridPx >= canvasHeightPx - gridPx) {
    height = canvasHeightPx - minY;
  }

  return { minX, minY, width, height };
};

export const buildDownloadLink = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  return url;
};

export const safeParse = (val, fallback = 0) => {
  if (val === undefined || val === null) return fallback;
  const str = String(val).replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
};

export const mergeSquaresToRects = (squares, gridPx) => {
  if (!squares || squares.length === 0) return [];

  const rows = new Map();
  for (const key of squares) {
    const [x, y] = key.split(',').map(Number);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(x);
  }

  const merged = [];
  for (const [y, xList] of rows.entries()) {
    xList.sort((a, b) => a - b);
    let startX = xList[0];
    let prevX = xList[0];

    for (let i = 1; i < xList.length; i++) {
      const x = xList[i];
      if (Math.abs(x - (prevX + gridPx)) < 0.1) {
        prevX = x;
      } else {
        merged.push({ x: startX, y, width: prevX - startX + gridPx, height: gridPx });
        startX = x;
        prevX = x;
      }
    }
    merged.push({ x: startX, y, width: prevX - startX + gridPx, height: gridPx });
  }

  return merged;
};

export const isPointInShape = (shapeType, px, py) => {
  if (px < 0 || px > 1 || py < 0 || py > 1) return false;
  if (shapeType === 'freehand' || shapeType === 'rectangle') return true;

  const dx = px - 0.5;
  const dy = py - 0.5;

  if (shapeType === 'circle' || shapeType === 'ellipse') {
    return dx * dx + dy * dy <= 0.25;
  }

  if (shapeType === 'triangle') {
    // Pointing upwards, apex at (0.5, 0), base from (0,1) to (1,1)
    return py >= 0 && py <= 1 && Math.abs(dx) <= 0.5 * py;
  }

  if (shapeType === 'diamond') {
    // Vertices at (0.5, 0), (1, 0.5), (0.5, 1), (0, 0.5)
    return Math.abs(dx) + Math.abs(dy) <= 0.5;
  }

  if (shapeType === 'hexagon') {
    // Regular hexagon
    const a = 0.5;
    const h = a * Math.sqrt(3) / 2; // ~0.433
    if (Math.abs(dx) > a || Math.abs(dy) > h) return false;
    return (h * (a - Math.abs(dx)) - (a / 2) * Math.abs(dy)) >= 0;
  }

  if (shapeType === 'star4' || shapeType === 'star5' || shapeType === 'star5_wide' || shapeType === 'star6') {
    const numPoints = shapeType === 'star4' ? 4 : (shapeType === 'star5' || shapeType === 'star5_wide') ? 5 : 6;
    const rRatio = shapeType === 'star4' ? 0.38 : shapeType === 'star5' ? 0.42 : shapeType === 'star5_wide' ? 0.63 : 0.45;
    const R = 0.5;
    const r = R * rRatio;

    const angle = Math.atan2(dy, dx);
    const sectorAngle = (2 * Math.PI) / numPoints;
    // Align top point to -PI/2
    let normAngle = (angle + Math.PI / 2 + Math.PI * 4) % sectorAngle;
    let beta = Math.abs(normAngle - sectorAngle / 2);

    const d = Math.hypot(dx, dy);
    const halfSector = sectorAngle / 2;
    const vOutX = R * Math.cos(halfSector);
    const vOutY = R * Math.sin(halfSector);

    // Cross product test against edge from (r, 0) to (vOutX, vOutY)
    const cross = (vOutX - r) * (d * Math.sin(beta)) - vOutY * (d * Math.cos(beta) - r);
    return cross >= 0;
  }

  if (shapeType === 'heart') {
    // Parametric heart: ((2.2*dx)^2 + (-2.2*dy + 0.1)^2 - 1)^3 - (2.2*dx)^2 * (-2.2*dy + 0.1)^3 <= 0
    const hx = dx * 2.3;
    const hy = -dy * 2.3 + 0.15;
    const term = hx * hx + hy * hy - 1;
    return term * term * term - hx * hx * hy * hy * hy <= 0;
  }

  return true;
};

export const getSquaresForShape = (shapeType, startX, startY, endX, endY, gridPx) => {
  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minY = Math.min(startY, endY);
  const maxY = Math.max(startY, endY);

  const width = maxX - minX + gridPx;
  const height = maxY - minY + gridPx;

  const squares = [];
  for (let x = minX; x <= maxX; x += gridPx) {
    for (let y = minY; y <= maxY; y += gridPx) {
      // Cell center normalized within bounding box [0, 1]
      const px = (x + gridPx / 2 - minX) / width;
      const py = (y + gridPx / 2 - minY) / height;

      if (isPointInShape(shapeType, px, py)) {
        squares.push(`${x},${y}`);
      }
    }
  }
  return squares;
};


