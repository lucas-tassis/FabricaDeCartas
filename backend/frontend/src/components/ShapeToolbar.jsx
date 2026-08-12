import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SHAPE_TOOLS = [
  { id: 'freehand',  icon: '✏️', key: 'tool_freehand' },
  { id: 'rectangle', icon: '⬛', key: 'tool_rectangle' },
  { id: 'ellipse',   icon: '⚪', key: 'tool_ellipse' },
  { id: 'triangle',  icon: '🔺', key: 'tool_triangle' },
  { id: 'star4',      icon: '✦',  key: 'tool_star4' },
  { id: 'star5',      icon: '★',  key: 'tool_star5' },
  { id: 'star5_wide', icon: '⭐', key: 'tool_star5_wide' },
  { id: 'star6',      icon: '✶',  key: 'tool_star6' },
  { id: 'diamond',   icon: '🔷', key: 'tool_diamond' },
  { id: 'hexagon',   icon: '⬡',  key: 'tool_hexagon' },
  { id: 'heart',     icon: '♥',  key: 'tool_heart' },
];

function ShapeToolbar({ activeTool, setActiveTool }) {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="shape-toolbar-panel glass-panel" onClick={(e) => e.stopPropagation()}>
      <div className="shape-toolbar-header">
        <span className="shape-toolbar-title">📐 {t('shape_tools')}</span>
        <button
          type="button"
          className="shape-toolbar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir' : 'Recolher'}
        >
          {isCollapsed ? '➕' : '➖'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="shape-toolbar-grid">
          {SHAPE_TOOLS.map(tool => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                className={`shape-tool-btn${isActive ? ' shape-tool-btn--active' : ''}`}
                onClick={() => setActiveTool(tool.id)}
                title={t(tool.key)}
              >
                <span className="shape-tool-icon">{tool.icon}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ShapeToolbar;
