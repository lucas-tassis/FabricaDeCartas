import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import CardDimensionControls from './sidebar/CardDimensionControls';
import CardBackgroundControls from './sidebar/CardBackgroundControls';
import CardBackControls from './sidebar/CardBackControls';
import SectionPropertiesControls from './sidebar/SectionPropertiesControls';

function SidebarRight({
  template, setTemplate, gridSize, setGridSize, activeSection, updateSectionConfig,
  columnTypes, sections, saveHistory, columns, showBleedGuides, setShowBleedGuides,
  snapToGrid, setSnapToGrid, showPreviewCard1, setShowPreviewCard1, firstRow,
  moveSectionUp, moveSectionDown, moveSectionToFront, moveSectionToBack
}) {
  const { t } = useTranslation();
  const [systemFonts, setSystemFonts] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);

  const refreshImages = () => {
    api.listImages().then(setUploadedImages).catch(() => {});
  };

  const refreshFonts = () => {
    api.listFonts().then(fonts => setSystemFonts(fonts)).catch(() => {});
  };

  useEffect(() => {
    refreshFonts();
    refreshImages();
  }, []);

  return (
    <div className="sidebar glass-panel sidebar-padding" onClick={(e) => e.stopPropagation()}>
      <h2>{t('properties')}</h2>

      <CardDimensionControls
        template={template}
        setTemplate={setTemplate}
        gridSize={gridSize}
        setGridSize={setGridSize}
        showBleedGuides={showBleedGuides}
        setShowBleedGuides={setShowBleedGuides}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        showPreviewCard1={showPreviewCard1}
        setShowPreviewCard1={setShowPreviewCard1}
        firstRow={firstRow}
      />

      <CardBackgroundControls
        template={template}
        setTemplate={setTemplate}
        uploadedImages={uploadedImages}
        refreshImages={refreshImages}
      />

      <CardBackControls
        template={template}
        setTemplate={setTemplate}
        uploadedImages={uploadedImages}
        columns={columns}
      />

      <SectionPropertiesControls
        activeSection={activeSection}
        updateSectionConfig={updateSectionConfig}
        columnTypes={columnTypes}
        sections={sections}
        saveHistory={saveHistory}
        systemFonts={systemFonts}
        setSystemFonts={setSystemFonts}
        refreshFonts={refreshFonts}
        moveSectionUp={moveSectionUp}
        moveSectionDown={moveSectionDown}
        moveSectionToFront={moveSectionToFront}
        moveSectionToBack={moveSectionToBack}
      />
    </div>
  );
}

export default SidebarRight;
