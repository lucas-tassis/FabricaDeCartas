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

