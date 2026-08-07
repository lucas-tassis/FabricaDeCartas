// Custom hook for section management: create, remove, update, naming
import { useState, useCallback } from 'react';
import { COLOR_HUES } from '../constants';

const getRandomColor = (existingColors = []) => {
  const usedHues = existingColors.map(color => {
    const match = color.match(/hsla\((\d+)/);
    return match ? Number(match[1]) : -1;
  });
  const availableHues = COLOR_HUES.filter(h => !usedHues.includes(h));
  const hueOptions = availableHues.length > 0 ? availableHues : COLOR_HUES;
  const hue = hueOptions[Math.floor(Math.random() * hueOptions.length)];
  return `hsla(${hue}, 70%, 50%, 0.5)`;
};

export function useSections() {
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const saveHistory = useCallback((currentSections) => {
    setHistory(prev => {
      if (prev.length > 0 && JSON.stringify(prev[prev.length - 1]) === JSON.stringify(currentSections)) {
        return prev;
      }
      return [...prev, currentSections];
    });
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    setHistory(prevHistory => {
      if (prevHistory.length === 0) return prevHistory;
      const previous = prevHistory[prevHistory.length - 1];
      
      setSections(currentSections => {
        setFuture(prevFuture => [currentSections, ...prevFuture]);
        return previous;
      });
      
      return prevHistory.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture(prevFuture => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      
      setSections(currentSections => {
        setHistory(prevHistory => [...prevHistory, currentSections]);
        return next;
      });
      
      return prevFuture.slice(1);
    });
  }, []);

  const createSection = (selectedSquares, onDone) => {
    if (selectedSquares.length === 0) return;

    let newSectionNumber = 1;
    const existingNames = sections.map(s => s.name);
    while (existingNames.includes(`Seção ${newSectionNumber}`)) {
      newSectionNumber++;
    }

    const newSection = {
      id: Date.now().toString(),
      name: `Seção ${newSectionNumber}`,
      squares: [...selectedSquares],
      color: getRandomColor(sections.map(s => s.color)),
      linkedColumn: '',
      fontSize: 12,
      fontFamily: 'Helvetica',
      rotation: 0,
      fontColor: '#000000',
      bold: true,
      textAlign: 'center',
      vAlign: 'center',
      borderThickness: 0,
      imageFit: 'smart',
      colorSpace: 'RGB',
      backgroundColor: '#ffffff',
      brightness: 100, // default filter property
      contrast: 100, // default filter property
    };

    setHistory(prev => [...prev, sections]);
    setFuture([]);
    setSections(prev => [...prev, newSection]);
    setActiveSectionId(newSection.id);
    if (onDone) onDone();
  };

  const removeSection = (id) => {
    setHistory(prev => [...prev, sections]);
    setFuture([]);
    setSections(prev => prev.filter(s => s.id !== id));
    if (activeSectionId === id) setActiveSectionId(null);
  };

  const updateSectionConfig = useCallback((id, newConfig) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...newConfig } : s));
  }, []);

  const linkColumnToSection = (col, sectionId) => {
    setHistory(prev => [...prev, sections]);
    setFuture([]);
    setSections(prev => prev.map(s => {
      if (s.linkedColumn === col) return { ...s, linkedColumn: '' };
      if (s.id === sectionId) return { ...s, linkedColumn: col };
      return s;
    }));
  };

  const activeSection = sections.find(s => s.id === activeSectionId);

  return {
    sections, setSections,
    activeSectionId, setActiveSectionId,
    activeSection,
    createSection, removeSection, updateSectionConfig, linkColumnToSection,
    undo, redo, history, future, saveHistory,
  };
}
