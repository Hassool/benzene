"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Home, ZoomIn, ZoomOut, Move, Activity } from 'lucide-react';
import * as math from 'mathjs';

const page = () => {
  const canvasRef = useRef(null);
  const [functionInput, setFunctionInput] = useState('x^2');
  const [domain, setDomain] = useState({ min: -Infinity, max: Infinity });
  const [customDomain, setCustomDomain] = useState({ min: '', max: '' });
  const [useDomain, setUseDomain] = useState(false);
  
  // Camera/View state
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);
  const [scale, setScale] = useState(20); // pixels per unit
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });

  // Graph bounds (render area: ±50 from center, always show: ±20 from center, display: ±10 from center)
  const RENDER_RADIUS = 50;        // Render ±50 units from current center
  const ALWAYS_VISIBLE_RADIUS = 20; // Always show ±20 units from current center  
  const DEFAULT_VIEW_RADIUS = 10;   // Default view ±10 units from current center
  const MIN_SCALE = 5;              // max zoom out
  const MAX_SCALE = 100;            // max zoom in
  const MAX_CENTER_DISTANCE = 1000; // Maximum distance center can move from origin

  // Canvas dimensions
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  // Convert canvas coordinates to graph coordinates
  const canvasToGraph = useCallback((canvasX, canvasY) => {
    const graphX = (canvasX - CANVAS_WIDTH / 2) / scale + centerX;
    const graphY = -(canvasY - CANVAS_HEIGHT / 2) / scale + centerY;
    return { x: graphX, y: graphY };
  }, [scale, centerX, centerY]);

  // Convert graph coordinates to canvas coordinates
  const graphToCanvas = useCallback((graphX, graphY) => {
    const canvasX = (graphX - centerX) * scale + CANVAS_WIDTH / 2;
    const canvasY = -(graphY - centerY) * scale + CANVAS_HEIGHT / 2;
    return { x: canvasX, y: canvasY };
  }, [scale, centerX, centerY]);

  // Evaluate function safely
  const evaluateFunction = useCallback((x, funcStr) => {
    try {
      // Replace common mathematical notation
      let processedFunc = funcStr
        .replace(/\^/g, '**')
        .replace(/sin/g, 'sin')
        .replace(/cos/g, 'cos')
        .replace(/tan/g, 'tan')
        .replace(/ln/g, 'log')
        .replace(/log/g, 'log10')
        .replace(/sqrt/g, 'sqrt')
        .replace(/abs/g, 'abs')
        .replace(/pi/gi, 'pi')
        .replace(/e(?![a-z])/gi, 'e');

      const result = math.evaluate(processedFunc, { x, pi: Math.PI, e: Math.E });
      return isFinite(result) ? result : null;
    } catch (error) {
      return null;
    }
  }, []);

  // Draw grid
  const drawGrid = useCallback((ctx) => {
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.3)';
    ctx.lineWidth = 1;

    // Calculate grid spacing based on scale
    let gridSpacing = 1;
    if (scale < 10) gridSpacing = 5;
    else if (scale < 20) gridSpacing = 2;
    else if (scale > 50) gridSpacing = 0.5;

    // Vertical grid lines
    for (let x = Math.floor(centerX - CANVAS_WIDTH / (2 * scale)) - 1; 
         x <= Math.ceil(centerX + CANVAS_WIDTH / (2 * scale)) + 1; x += gridSpacing) {
      const canvasX = (x - centerX) * scale + CANVAS_WIDTH / 2;
      if (canvasX >= 0 && canvasX <= CANVAS_WIDTH) {
        ctx.beginPath();
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, CANVAS_HEIGHT);
        ctx.stroke();
      }
    }

    // Horizontal grid lines
    for (let y = Math.floor(centerY - CANVAS_HEIGHT / (2 * scale)) - 1; 
         y <= Math.ceil(centerY + CANVAS_HEIGHT / (2 * scale)) + 1; y += gridSpacing) {
      const canvasY = -(y - centerY) * scale + CANVAS_HEIGHT / 2;
      if (canvasY >= 0 && canvasY <= CANVAS_HEIGHT) {
        ctx.beginPath();
        ctx.moveTo(0, canvasY);
        ctx.lineTo(CANVAS_WIDTH, canvasY);
        ctx.stroke();
      }
    }
  }, [scale, centerX, centerY]);

  // Draw axes
  const drawAxes = useCallback((ctx) => {
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;

    // X-axis
    const xAxisY = -(0 - centerY) * scale + CANVAS_HEIGHT / 2;
    if (xAxisY >= 0 && xAxisY <= CANVAS_HEIGHT) {
      ctx.beginPath();
      ctx.moveTo(0, xAxisY);
      ctx.lineTo(CANVAS_WIDTH, xAxisY);
      ctx.stroke();
    }

    // Y-axis
    const yAxisX = (0 - centerX) * scale + CANVAS_WIDTH / 2;
    if (yAxisX >= 0 && yAxisX <= CANVAS_WIDTH) {
      ctx.beginPath();
      ctx.moveTo(yAxisX, 0);
      ctx.lineTo(yAxisX, CANVAS_HEIGHT);
      ctx.stroke();
    }

    // Draw axis labels
    ctx.fillStyle = '#2d3748';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    // X-axis labels
    let labelSpacing = 1;
    if (scale < 15) labelSpacing = 5;
    else if (scale < 30) labelSpacing = 2;
    else if (scale > 60) labelSpacing = 0.5;

    for (let x = Math.floor(centerX - CANVAS_WIDTH / (2 * scale)) - 1; 
         x <= Math.ceil(centerX + CANVAS_WIDTH / (2 * scale)) + 1; x += labelSpacing) {
      if (x === 0) continue;
      const canvasX = (x - centerX) * scale + CANVAS_WIDTH / 2;
      if (canvasX >= 20 && canvasX <= CANVAS_WIDTH - 20) {
        ctx.fillText(x.toString(), canvasX, xAxisY + 20);
      }
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let y = Math.floor(centerY - CANVAS_HEIGHT / (2 * scale)) - 1; 
         y <= Math.ceil(centerY + CANVAS_HEIGHT / (2 * scale)) + 1; y += labelSpacing) {
      if (y === 0) continue;
      const canvasY = -(y - centerY) * scale + CANVAS_HEIGHT / 2;
      if (canvasY >= 20 && canvasY <= CANVAS_HEIGHT - 20) {
        ctx.fillText(y.toString(), yAxisX - 10, canvasY + 4);
      }
    }

    // Origin label
    if (yAxisX >= 20 && yAxisX <= CANVAS_WIDTH - 20 && xAxisY >= 20 && xAxisY <= CANVAS_HEIGHT - 20) {
      ctx.textAlign = 'right';
      ctx.fillText('0', yAxisX - 10, xAxisY - 10);
    }
  }, [scale, centerX, centerY]);

  // Draw function
  const drawFunction = useCallback((ctx) => {
    if (!functionInput.trim()) return;

    ctx.strokeStyle = '#38a169'; // special color from config
    ctx.lineWidth = 3;
    ctx.beginPath();

    const step = 1 / scale; // Adaptive step based on zoom level
    let firstPoint = true;
    let lastValidY = null;

    // Calculate dynamic domain bounds relative to current center
    const domainMin = useDomain && customDomain.min !== '' ? parseFloat(customDomain.min) : centerX - RENDER_RADIUS;
    const domainMax = useDomain && customDomain.max !== '' ? parseFloat(customDomain.max) : centerX + RENDER_RADIUS;

    // Calculate visible x range (intersection of domain and visible area)
    const visibleMinX = Math.max(centerX - CANVAS_WIDTH / (2 * scale), domainMin);
    const visibleMaxX = Math.min(centerX + CANVAS_WIDTH / (2 * scale), domainMax);

    for (let x = visibleMinX; x <= visibleMaxX; x += step) {
      const y = evaluateFunction(x, functionInput);
      
      // Check if y is within render bounds relative to current center
      if (y !== null && y >= centerY - RENDER_RADIUS && y <= centerY + RENDER_RADIUS) {
        const canvasPos = graphToCanvas(x, y);
        
        if (canvasPos.x >= -50 && canvasPos.x <= CANVAS_WIDTH + 50 &&
            canvasPos.y >= -50 && canvasPos.y <= CANVAS_HEIGHT + 50) {
          
          if (firstPoint || (lastValidY !== null && Math.abs(y - lastValidY) > 10)) {
            ctx.moveTo(canvasPos.x, canvasPos.y);
            firstPoint = false;
          } else {
            ctx.lineTo(canvasPos.x, canvasPos.y);
          }
          lastValidY = y;
        } else {
          firstPoint = true;
          lastValidY = null;
        }
      } else {
        firstPoint = true;
        lastValidY = null;
      }
    }

    ctx.stroke();

    // Draw domain indicators if custom domain is set
    if (useDomain) {
      ctx.strokeStyle = '#e53e3e';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      if (customDomain.min !== '') {
        const minX = parseFloat(customDomain.min);
        const canvasX = (minX - centerX) * scale + CANVAS_WIDTH / 2;
        if (canvasX >= -50 && canvasX <= CANVAS_WIDTH + 50) {
          ctx.beginPath();
          ctx.moveTo(canvasX, 0);
          ctx.lineTo(canvasX, CANVAS_HEIGHT);
          ctx.stroke();
        }
      }

      if (customDomain.max !== '') {
        const maxX = parseFloat(customDomain.max);
        const canvasX = (maxX - centerX) * scale + CANVAS_WIDTH / 2;
        if (canvasX >= -50 && canvasX <= CANVAS_WIDTH + 50) {
          ctx.beginPath();
          ctx.moveTo(canvasX, 0);
          ctx.lineTo(canvasX, CANVAS_HEIGHT);
          ctx.stroke();
        }
      }

      ctx.setLineDash([]);
    }
  }, [functionInput, scale, centerX, centerY, useDomain, customDomain, evaluateFunction, graphToCanvas]);

  // Main render function
  const renderGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawGrid(ctx);
    drawAxes(ctx);
    drawFunction(ctx);
  }, [drawGrid, drawAxes, drawFunction]);

  // Mouse event handlers
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
    setLastPan({ x: centerX, y: centerY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const deltaX = (x - dragStart.x) / scale;
    const deltaY = -(y - dragStart.y) / scale;

    const newCenterX = Math.max(-MAX_CENTER_DISTANCE, Math.min(MAX_CENTER_DISTANCE, lastPan.x - deltaX));
    const newCenterY = Math.max(-MAX_CENTER_DISTANCE, Math.min(MAX_CENTER_DISTANCE, lastPan.y - deltaY));

    setCenterX(newCenterX);
    setCenterY(newCenterY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * delta));
    setScale(newScale);
  };

  // Control functions
  const resetView = () => {
    setCenterX(0);
    setCenterY(0);
    setScale(20);
  };

  const zoomIn = () => {
    setScale(Math.min(MAX_SCALE, scale * 1.2));
  };

  const zoomOut = () => {
    setScale(Math.max(MIN_SCALE, scale / 1.2));
  };

  const setCustomDomainValues = () => {
    const min = customDomain.min === '' ? -Infinity : parseFloat(customDomain.min);
    const max = customDomain.max === '' ? Infinity : parseFloat(customDomain.max);
    setDomain({ min, max });
  };

  // Effect to render graph
  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  // Effect to set domain
  useEffect(() => {
    if (useDomain) {
      setCustomDomainValues();
    } else {
      setDomain({ min: -Infinity, max: Infinity });
    }
  }, [useDomain, customDomain]);

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark transition-colors duration-300">
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-montserrat font-bold text-text dark:text-text-dark mb-6 text-center flex items-center justify-center gap-2">
          <Activity size={32} className="text-special" />
          Function Graph Drawer
        </h1>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary dark:bg-bg-dark-secondary rounded-lg p-6 shadow-lg border border-border dark:border-border-dark space-y-6">
              
              {/* Function Input */}
              <div>
                <label className="block text-sm font-montserrat font-semibold text-text dark:text-text-dark mb-2">
                  Function f(x) =
                </label>
                <input
                  type="text"
                  value={functionInput}
                  onChange={(e) => setFunctionInput(e.target.value)}
                  placeholder="x^2, sin(x), ln(x)..."
                  className="w-full p-3 bg-bg dark:bg-bg-dark border-2 border-border dark:border-border-dark rounded-lg text-text dark:text-text-dark font-mono focus:border-special outline-none transition-colors"
                />
                <div className="mt-2 text-xs text-text-secondary dark:text-text-dark-secondary">
                  Examples: x^2, sin(x), cos(x), tan(x), ln(x), sqrt(x), abs(x)
                </div>
              </div>

              {/* Domain Settings */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="useDomain"
                    checked={useDomain}
                    onChange={(e) => setUseDomain(e.target.checked)}
                    className="w-4 h-4 text-special bg-bg border-border rounded focus:ring-special"
                  />
                  <label htmlFor="useDomain" className="text-sm font-montserrat font-semibold text-text dark:text-text-dark">
                    Custom Domain
                  </label>
                </div>
                
                {useDomain && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-text-secondary dark:text-text-dark-secondary mb-1">Min</label>
                      <input
                        type="number"
                        value={customDomain.min}
                        onChange={(e) => setCustomDomain(prev => ({ ...prev, min: e.target.value }))}
                        placeholder="-∞"
                        className="w-full p-2 bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded text-text dark:text-text-dark text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary dark:text-text-dark-secondary mb-1">Max</label>
                      <input
                        type="number"
                        value={customDomain.max}
                        onChange={(e) => setCustomDomain(prev => ({ ...prev, max: e.target.value }))}
                        placeholder="+∞"
                        className="w-full p-2 bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded text-text dark:text-text-dark text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* View Controls */}
              <div>
                <label className="block text-sm font-montserrat font-semibold text-text dark:text-text-dark mb-3">
                  View Controls
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={zoomIn}
                    className="flex items-center justify-center gap-2 p-2 bg-special text-white rounded-lg hover:bg-special-hover transition-colors"
                  >
                    <ZoomIn size={16} />
                    Zoom In
                  </button>
                  <button
                    onClick={zoomOut}
                    className="flex items-center justify-center gap-2 p-2 bg-special text-white rounded-lg hover:bg-special-hover transition-colors"
                  >
                    <ZoomOut size={16} />
                    Zoom Out
                  </button>
                </div>
                <button
                  onClick={resetView}
                  className="w-full mt-2 flex items-center justify-center gap-2 p-2 bg-text dark:bg-text-dark text-bg dark:text-bg-dark rounded-lg hover:bg-text-secondary dark:hover:bg-text-dark-secondary transition-colors"
                >
                  <Home size={16} />
                  Reset View (0,0)
                </button>
              </div>

              {/* Current View Info */}
              <div className="text-sm text-text-secondary dark:text-text-dark-secondary">
                <div className="font-montserrat font-semibold mb-2">Current View:</div>
                <div className="font-mono space-y-1">
                  <div>Center: ({centerX.toFixed(2)}, {centerY.toFixed(2)})</div>
                  <div>Scale: {scale.toFixed(1)}x</div>
                  <div>Visible: ±{(CANVAS_WIDTH / (2 * scale)).toFixed(1)}</div>
                  <div className="text-xs mt-2 text-special">
                    Render area: [{(centerX - RENDER_RADIUS).toFixed(1)}, {(centerX + RENDER_RADIUS).toFixed(1)}] × [{(centerY - RENDER_RADIUS).toFixed(1)}, {(centerY + RENDER_RADIUS).toFixed(1)}]
                  </div>
                </div>
              </div>

              {/* Function Examples */}
              <div>
                <label className="block text-sm font-montserrat font-semibold text-text dark:text-text-dark mb-2">
                  Quick Examples
                </label>
                <div className="space-y-1">
                  {[
                    'x^2',
                    'sin(x)',
                    'cos(x)',
                    'tan(x)',
                    'ln(x)',
                    'sqrt(x)',
                    'abs(x)',
                    'x^3 - 3*x',
                    '1/x'
                  ].map((func, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFunctionInput(func)}
                      className="block w-full text-left p-2 text-sm font-mono bg-bg dark:bg-bg-dark text-text dark:text-text-dark rounded hover:bg-special-light dark:hover:bg-special-dark transition-colors"
                    >
                      f(x) = {func}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Graph Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-bg-secondary dark:bg-bg-dark-secondary rounded-lg p-4 shadow-lg border border-border dark:border-border-dark">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="border-2 border-border dark:border-border-dark rounded-lg cursor-grab active:cursor-grabbing bg-white dark:bg-gray-900"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onWheel={handleWheel}
                />
                
                {/* Drag instruction */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
                  <div className="flex items-center gap-1">
                    <Move size={12} />
                    Drag to pan • Scroll to zoom
                  </div>
                </div>
                
                {/* Function display */}
                <div className="absolute top-2 right-2 bg-special text-white text-sm p-2 rounded font-mono">
                  f(x) = {functionInput || 'Enter function'}
                </div>
              </div>
              
              <div className="mt-4 text-sm text-text-secondary dark:text-text-dark-secondary">
                <strong>Dynamic render bounds:</strong> Center ±50 units | 
                <strong> Always visible:</strong> Center ±20 units | 
                <strong> Default view:</strong> Center ±10 units
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;