"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Home, ZoomIn, ZoomOut, Move, Activity, Plus, Trash2, Eye, EyeOff, MousePointer } from 'lucide-react';
import * as math from 'mathjs';
import { useTranslation } from "l_i18n";

const COLORS = [
  '#38a169', // Green
  '#3182ce', // Blue
  '#e53e3e', // Red
  '#d69e2e', // Yellow
  '#805ad5', // Purple
  '#d53f8c', // Pink
  '#00b5d8', // Cyan
  '#ed8936', // Orange
];

// Canvas dimensions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

const page = () => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
  // Function state
  const [functions, setFunctions] = useState([
    { id: 1, expression: 'x^2', color: COLORS[0], visible: true }
  ]);
  const [nextId, setNextId] = useState(2);
  
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

  // Trace mode
  const [traceMode, setTraceMode] = useState(false);
  const [tracePoint, setTracePoint] = useState(null);

  // Graph bounds
  const RENDER_RADIUS = 50;        
  const MIN_SCALE = 5;             
  const MAX_SCALE = 200;           
  const MAX_CENTER_DISTANCE = 1000;

  // Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

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
      if (!funcStr || !funcStr.trim()) return null;
      let processedFunc = funcStr
        .replace(/²/g, '*x') 
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

  // Add new function
  const addFunction = () => {
    setFunctions([
      ...functions,
      { 
        id: nextId, 
        expression: '', 
        color: COLORS[(nextId - 1) % COLORS.length], 
        visible: true 
      }
    ]);
    setNextId(prev => prev + 1);
  };

  // Remove function
  const removeFunction = (id) => {
    if (functions.length > 1) {
      setFunctions(functions.filter(f => f.id !== id));
    }
  };

  // Update function
  const updateFunction = (id, key, value) => {
    setFunctions(functions.map(f => 
      f.id === id ? { ...f, [key]: value } : f
    ));
  };

  // Draw grid
  const drawGrid = useCallback((ctx) => {
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)';
    ctx.lineWidth = 1;

    let gridSpacing = 1;
    if (scale < 10) gridSpacing = 5;
    else if (scale < 20) gridSpacing = 2;
    else if (scale > 50) gridSpacing = 0.5;
    else if (scale > 100) gridSpacing = 0.2;

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
    ctx.fillStyle = '#718096';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    let labelSpacing = 1;
    if (scale < 15) labelSpacing = 5;
    else if (scale < 30) labelSpacing = 2;
    else if (scale > 60) labelSpacing = 0.5;

    for (let x = Math.floor(centerX - CANVAS_WIDTH / (2 * scale)) - 1; 
         x <= Math.ceil(centerX + CANVAS_WIDTH / (2 * scale)) + 1; x += labelSpacing) {
      if (Math.abs(x) < 0.0001) continue;
      const canvasX = (x - centerX) * scale + CANVAS_WIDTH / 2;
      if (canvasX >= 20 && canvasX <= CANVAS_WIDTH - 20) {
        ctx.fillText(Number(x.toFixed(1)).toString(), canvasX, xAxisY + 20);
      }
    }

    ctx.textAlign = 'right';
    for (let y = Math.floor(centerY - CANVAS_HEIGHT / (2 * scale)) - 1; 
         y <= Math.ceil(centerY + CANVAS_HEIGHT / (2 * scale)) + 1; y += labelSpacing) {
      if (Math.abs(y) < 0.0001) continue;
      const canvasY = -(y - centerY) * scale + CANVAS_HEIGHT / 2;
      if (canvasY >= 20 && canvasY <= CANVAS_HEIGHT - 20) {
        ctx.fillText(Number(y.toFixed(1)).toString(), yAxisX - 10, canvasY + 4);
      }
    }

    if (yAxisX >= 20 && yAxisX <= CANVAS_WIDTH - 20 && xAxisY >= 20 && xAxisY <= CANVAS_HEIGHT - 20) {
      ctx.textAlign = 'right';
      ctx.fillText('0', yAxisX - 10, xAxisY - 10);
    }
  }, [scale, centerX, centerY]);

  // Draw single function
  const drawSingleFunction = useCallback((ctx, func) => {
    if (!func.expression.trim() || !func.visible) return;

    ctx.strokeStyle = func.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const step = 1 / scale; 
    let firstPoint = true;
    let lastValidY = null;

    const domainMin = useDomain && customDomain.min !== '' ? parseFloat(customDomain.min) : centerX - RENDER_RADIUS;
    const domainMax = useDomain && customDomain.max !== '' ? parseFloat(customDomain.max) : centerX + RENDER_RADIUS;

    const visibleMinX = Math.max(centerX - CANVAS_WIDTH / (2 * scale), domainMin);
    const visibleMaxX = Math.min(centerX + CANVAS_WIDTH / (2 * scale), domainMax);

    for (let x = visibleMinX; x <= visibleMaxX; x += step) {
      const y = evaluateFunction(x, func.expression);
      
      if (y !== null && y >= centerY - RENDER_RADIUS && y <= centerY + RENDER_RADIUS) {
        const canvasPos = graphToCanvas(x, y);
        
        if (canvasPos.x >= -50 && canvasPos.x <= CANVAS_WIDTH + 50 &&
            canvasPos.y >= -50 && canvasPos.y <= CANVAS_HEIGHT + 50) {
          
          if (firstPoint || (lastValidY !== null && Math.abs(y - lastValidY) > 20)) {
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
  }, [scale, centerX, centerY, useDomain, customDomain, evaluateFunction, graphToCanvas]);

  // Draw Trace point
  const drawTrace = useCallback((ctx) => {
    if (!traceMode || !tracePoint) return;

    const { x: graphX } = tracePoint;
    
    // Draw vertical line at X
    const canvasX = (graphX - centerX) * scale + CANVAS_WIDTH / 2;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvasX, 0);
    ctx.lineTo(canvasX, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw points on functions
    functions.forEach(func => {
      if (!func.visible || !func.expression) return;
      const y = evaluateFunction(graphX, func.expression);
      if (y !== null) {
        const pos = graphToCanvas(graphX, y);
        
        // Point
        ctx.fillStyle = func.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = '#2d3748';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`(${graphX.toFixed(2)}, ${y.toFixed(2)})`, pos.x + 10, pos.y - 10);
      }
    });

  }, [traceMode, tracePoint, centerX, scale, functions, evaluateFunction, graphToCanvas]);

  // Main render function
  const renderGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawGrid(ctx);
    drawAxes(ctx);
    
    functions.forEach(func => {
      drawSingleFunction(ctx, func);
    });

    if (traceMode) {
      drawTrace(ctx);
    }

    // Draw domain indicators
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
  }, [drawGrid, drawAxes, functions, drawSingleFunction, traceMode, drawTrace, useDomain, customDomain, centerX, scale]);

  // Mouse event handlers
  const handleMouseDown = (e) => {
    if (traceMode) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
    setLastPan({ x: centerX, y: centerY });
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    if (traceMode) {
      const graphPos = canvasToGraph(x, 0);
      setTracePoint(graphPos);
    } else if (isDragging) {
      const y = e.clientY - rect.top;
      const deltaX = (x - dragStart.x) / scale;
      const deltaY = -(y - dragStart.y) / scale;

      const newCenterX = Math.max(-MAX_CENTER_DISTANCE, Math.min(MAX_CENTER_DISTANCE, lastPan.x - deltaX));
      const newCenterY = Math.max(-MAX_CENTER_DISTANCE, Math.min(MAX_CENTER_DISTANCE, lastPan.y - deltaY));

      setCenterX(newCenterX);
      setCenterY(newCenterY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Stable handleWheel for event listener
  const handleWheel = useCallback((e) => {
    // Note: e.preventDefault() is called in the effector
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prevScale => Math.max(MIN_SCALE, Math.min(MAX_SCALE, prevScale * delta)));
  }, []);

  // Use passive: false listener to prevent page scroll
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e) => {
      e.preventDefault();
      handleWheel(e);
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [handleWheel]);

  // Rendering Loop
  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark transition-colors duration-300">
      <div className="container mx-auto p-4 max-w-7xl">
        <h1 className="text-3xl font-montserrat font-bold text-text dark:text-text-dark mb-6 text-center flex items-center justify-center gap-2">
          <Activity size={32} className="text-special" />
          {t('tools.FGD.title') || "Function Graph Drawer"}
        </h1>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary dark:bg-bg-dark-secondary rounded-lg p-6 shadow-lg border border-border dark:border-border-dark space-y-6">
              
              {/* Functions List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-montserrat font-semibold text-text dark:text-text-dark">
                    {t('tools.FGD.functions') || "Functions"}
                  </label>
                  <button 
                    onClick={addFunction} 
                    className="p-1 rounded bg-special/10 text-special hover:bg-special/20"
                    title={t('tools.FGD.addFunction') || "Add function"}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {functions.map(func => (
                    <div key={func.id} className="p-3 bg-bg dark:bg-bg-dark rounded-lg border border-border dark:border-border-dark flex gap-2 items-start">
                      <div 
                        className="w-4 h-4 rounded-full mt-2 cursor-pointer border border-white/20" 
                        style={{ backgroundColor: func.color }}
                        onClick={() => updateFunction(func.id, 'color', COLORS[(COLORS.indexOf(func.color) + 1) % COLORS.length])}
                        title="Click to change color"
                      />
                      <div className="flex-1 space-y-1">
                         <div className="flex text-xs text-text-secondary dark:text-text-dark-secondary items-center gap-1">
                            <span>f{func.id}(x) =</span>
                         </div>
                         <input
                          type="text"
                          value={func.expression}
                          onChange={(e) => updateFunction(func.id, 'expression', e.target.value)}
                          placeholder="..."
                          className="w-full p-1 bg-transparent border-b border-border dark:border-border-dark text-text dark:text-text-dark font-mono text-sm focus:border-special outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => updateFunction(func.id, 'visible', !func.visible)}
                          className={`p-1 rounded ${func.visible ? 'text-text-secondary' : 'text-gray-400'} hover:bg-black/5`}
                          title={func.visible ? "Hide" : "Show"}
                        >
                          {func.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        {functions.length > 1 && (
                          <button 
                            onClick={() => removeFunction(func.id)}
                            className="p-1 rounded text-red-400 hover:bg-red-500/10"
                            title="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interaction Mode */}
              <div>
                 <label className="block text-sm font-montserrat font-semibold text-text dark:text-text-dark mb-2">
                   {t('tools.FGD.interactionMode') || "Interaction Mode"}
                 </label>
                 <div className="grid grid-cols-2 gap-2 bg-bg dark:bg-bg-dark p-1 rounded-lg border border-border dark:border-border-dark">
                   <button
                     onClick={() => setTraceMode(false)}
                     className={`flex items-center justify-center gap-2 p-2 rounded-md text-sm transition-colors ${!traceMode ? 'bg-special text-white' : 'text-text-secondary hover:bg-white/5'}`}
                   >
                     <Move size={14} /> {t('tools.FGD.pan') || "Pan"}
                   </button>
                   <button
                     onClick={() => setTraceMode(true)}
                     className={`flex items-center justify-center gap-2 p-2 rounded-md text-sm transition-colors ${traceMode ? 'bg-special text-white' : 'text-text-secondary hover:bg-white/5'}`}
                   >
                     <MousePointer size={14} /> {t('tools.FGD.trace') || "Trace"}
                   </button>
                 </div>
              </div>

               {/* View Controls */}
               <div>
                  <label className="block text-sm font-montserrat font-semibold text-text dark:text-text-dark mb-3">
                    {t('tools.FGD.view') || "View"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setScale(Math.min(MAX_SCALE, scale * 1.2))} 
                      className="flex items-center justify-center p-2 bg-text dark:bg-text-dark text-bg dark:text-bg-dark rounded hover:opacity-90"
                      title={t('tools.FGD.zoomIn') || "Zoom In"}
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button 
                      onClick={() => setScale(Math.max(MIN_SCALE, scale / 1.2))} 
                      className="flex items-center justify-center p-2 bg-text dark:bg-text-dark text-bg dark:text-bg-dark rounded hover:opacity-90"
                      title={t('tools.FGD.zoomOut') || "Zoom Out"}
                    >
                      <ZoomOut size={16} />
                    </button>
                  </div>
                  <button onClick={() => { setCenterX(0); setCenterY(0); setScale(20); }} className="w-full mt-2 flex items-center justify-center gap-2 p-2 border border-border dark:border-border-dark rounded text-text dark:text-text-dark hover:bg-black/5 text-sm">
                    <Home size={14} /> {t('tools.FGD.reset') || "Reset"}
                  </button>
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
                    {t('tools.FGD.customDomain') || "Custom Domain"}
                  </label>
                </div>
                
                {useDomain && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={customDomain.min}
                      onChange={(e) => setCustomDomain(prev => ({ ...prev, min: e.target.value }))}
                      placeholder={t('tools.FGD.min') || "Min"}
                      className="w-full p-2 bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded text-text dark:text-text-dark text-sm"
                    />
                    <input
                      type="number"
                      value={customDomain.max}
                      onChange={(e) => setCustomDomain(prev => ({ ...prev, max: e.target.value }))}
                      placeholder={t('tools.FGD.max') || "Max"}
                      className="w-full p-2 bg-bg dark:bg-bg-dark border border-border dark:border-border-dark rounded text-text dark:text-text-dark text-sm"
                    />
                  </div>
                )}
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
                  className={`border-2 border-border dark:border-border-dark rounded-lg bg-white dark:bg-gray-900 ${traceMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => { handleMouseUp(); setTracePoint(null); }}
                  // onWheel={handleWheel} // handled by useEffect
                />
                
                {/* Overlay Info */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                   <div className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-2">
                      <Move size={10} />
                      {traceMode ? (t('tools.FGD.overlayTrace') || 'Move mouse to trace') : (t('tools.FGD.overlayPan') || 'Drag to pan • Scroll zoom')}
                   </div>
                </div>

                {/* Example Quick Add */}
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button onClick={() => { 
                      addFunction(); 
                      updateFunction(nextId, 'expression', 'sin(x)');
                  }} className="text-xs bg-bg/80 dark:bg-bg-dark/80 backdrop-blur px-2 py-1 rounded border border-border dark:border-border-dark hover:bg-special hover:text-white transition-colors">
                    + sin(x)
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;