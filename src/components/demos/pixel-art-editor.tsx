"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  Eraser,
  PaintBucket,
  Palette,
  Pencil,
  Redo2,
  Sparkles,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PALETTE } from "@/lib/game/sprites/palette";
import { cn } from "@/lib/utils";
import { useVisitor } from "@/hooks/use-visitor";
import { isCanvasFull } from "@/lib/easter-eggs/triggers";
import {
  cloneGrid,
  CORE_PALETTE_INDICES,
  createEmptyGrid,
  createLobsterStarter,
  floodFill,
  identifyStarter,
} from "./pixel-art-editor-logic";

const HISTORY_LIMIT = 50;

function getCellSize(gridSize: number): number {
  if (gridSize === 8) return 40;
  if (gridSize === 32) return 14;
  return 24; // 16x16 default
}

export function PixelArtEditor() {
  const [gridSize, setGridSize] = useState(32);
  const [grid, setGrid] = useState<number[][]>(() => createLobsterStarter());
  const [selectedColor, setSelectedColor] = useState(17);
  const [tool, setTool] = useState<"pencil" | "eraser" | "fill">("pencil");
  const [isDrawing, setIsDrawing] = useState(false);
  const [past, setPast] = useState<number[][][]>([]);
  const [future, setFuture] = useState<number[][][]>([]);
  const [activeStarter, setActiveStarter] = useState<"lobster" | "blank" | null>(
    "lobster"
  );
  const [showAllColors, setShowAllColors] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { awardXP, trackEvent, unlockAchievement } = useVisitor();
  const pixelPerfectFired = useRef(false);

  const cellSize = getCellSize(gridSize);
  const canvasDim = gridSize * cellSize;

  // "Pixel Perfect" — fire once when the canvas becomes fully painted.
  useEffect(() => {
    if (pixelPerfectFired.current) return;
    if (isCanvasFull(grid)) {
      pixelPerfectFired.current = true;
      trackEvent("fill_canvas", { gridSize });
      unlockAchievement("pixel_perfect");
    }
  }, [grid, gridSize, trackEvent, unlockAchievement]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasDim, canvasDim);

    // Draw cells
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const idx = grid[y][x];
        const px = x * cellSize;
        const py = y * cellSize;

        if (idx === 0) {
          // Checkerboard transparency pattern
          const half = cellSize / 2;
          for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
              ctx.fillStyle =
                (dx + dy) % 2 === 0 ? "#2a2a3a" : "#222233";
              ctx.fillRect(px + dx * half, py + dy * half, half, half);
            }
          }
        } else {
          ctx.fillStyle = PALETTE[idx] ?? "#000000";
          ctx.fillRect(px, py, cellSize, cellSize);
        }
      }
    }

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
      const pos = i * cellSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvasDim);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(canvasDim, pos);
      ctx.stroke();
    }
  }, [grid, gridSize, cellSize, canvasDim]);

  const getCellFromEvent = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX / cellSize);
      const y = Math.floor((e.clientY - rect.top) * scaleY / cellSize);
      if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return null;
      return { x, y };
    },
    [cellSize, gridSize]
  );

  const getCellFromTouch = useCallback(
    (touch: React.Touch) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((touch.clientX - rect.left) * scaleX / cellSize);
      const y = Math.floor((touch.clientY - rect.top) * scaleY / cellSize);
      if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return null;
      return { x, y };
    },
    [cellSize, gridSize]
  );

  const applyTool = useCallback(
    (x: number, y: number) => {
      setActiveStarter(null);
      setGrid((prev) => {
        if (tool === "pencil") {
          if (prev[y][x] === selectedColor) return prev;
          const newGrid = prev.map((row) => [...row]);
          newGrid[y][x] = selectedColor;
          return newGrid;
        }
        if (tool === "eraser") {
          if (prev[y][x] === 0) return prev;
          const newGrid = prev.map((row) => [...row]);
          newGrid[y][x] = 0;
          return newGrid;
        }
        // fill
        return floodFill(prev, x, y, selectedColor);
      });
    },
    [tool, selectedColor]
  );

  const saveCheckpoint = useCallback(() => {
    setPast((current) => [...current, cloneGrid(grid)].slice(-HISTORY_LIMIT));
    setFuture([]);
  }, [grid]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const cell = getCellFromEvent(e);
      if (!cell) return;
      saveCheckpoint();
      setIsDrawing(true);
      applyTool(cell.x, cell.y);
    },
    [getCellFromEvent, saveCheckpoint, applyTool]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const cell = getCellFromEvent(e);
      if (!cell) return;
      applyTool(cell.x, cell.y);
    },
    [isDrawing, getCellFromEvent, applyTool]
  );

  const onMouseUp = useCallback(() => setIsDrawing(false), []);
  const onMouseLeave = useCallback(() => setIsDrawing(false), []);

  const onTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const cell = getCellFromTouch(touch);
      if (!cell) return;
      saveCheckpoint();
      setIsDrawing(true);
      applyTool(cell.x, cell.y);
    },
    [getCellFromTouch, saveCheckpoint, applyTool]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!isDrawing) return;
      const touch = e.touches[0];
      if (!touch) return;
      const cell = getCellFromTouch(touch);
      if (!cell) return;
      applyTool(cell.x, cell.y);
    },
    [isDrawing, getCellFromTouch, applyTool]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      setIsDrawing(false);
    },
    []
  );

  const handleClear = useCallback(() => {
    saveCheckpoint();
    setGrid(createEmptyGrid(gridSize));
    setActiveStarter("blank");
  }, [gridSize, saveCheckpoint]);

  const loadStarter = useCallback(
    (starter: "lobster" | "blank") => {
      saveCheckpoint();
      const next =
        starter === "lobster" ? createLobsterStarter() : createEmptyGrid(gridSize);
      setGridSize(next.length);
      setGrid(next);
      setActiveStarter(starter);
    },
    [gridSize, saveCheckpoint]
  );

  const handleUndo = useCallback(() => {
    const previous = past.at(-1);
    if (!previous) return;
    setPast((current) => current.slice(0, -1));
    setFuture((current) => [cloneGrid(grid), ...current].slice(0, HISTORY_LIMIT));
    setGrid(cloneGrid(previous));
    setGridSize(previous.length);
    setActiveStarter(identifyStarter(previous));
  }, [past, grid]);

  const handleRedo = useCallback(() => {
    const next = future[0];
    if (!next) return;
    setFuture((current) => current.slice(1));
    setPast((current) => [...current, cloneGrid(grid)].slice(-HISTORY_LIMIT));
    setGrid(cloneGrid(next));
    setGridSize(next.length);
    setActiveStarter(identifyStarter(next));
  }, [future, grid]);

  const handleExport = useCallback(() => {
    const scale = 16;
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = gridSize * scale;
    exportCanvas.height = gridSize * scale;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    // Transparent background by default
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const idx = grid[y][x];
        if (idx === 0) continue; // transparent
        ctx.fillStyle = PALETTE[idx] ?? "#000000";
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    exportCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pixel-art-${gridSize}x${gridSize}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");

    awardXP("export_pixel_art");
  }, [grid, gridSize, awardXP]);

  const handleGridSizeChange = useCallback((size: number) => {
    saveCheckpoint();
    setGridSize(size);
    setGrid(createEmptyGrid(size));
    setActiveStarter("blank");
  }, [saveCheckpoint]);

  const gridSizes = [8, 16, 32] as const;
  const tools = [
    { id: "pencil" as const, icon: Pencil, label: "Pencil" },
    { id: "eraser" as const, icon: Eraser, label: "Eraser" },
    { id: "fill" as const, icon: PaintBucket, label: "Fill" },
  ];
  const visiblePaletteIndices = showAllColors
    ? PALETTE.slice(1).map((_, index) => index + 1)
    : [...CORE_PALETTE_INDICES];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 max-w-2xl">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Sprite bench
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Pixel Workshop
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          Remix ClaudeBot&apos;s lobster, sketch your own sprite, and export a crisp
          transparent PNG. Every edit stays in your browser.
        </p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm backdrop-blur-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Start from
            </span>
            <Button
              variant={activeStarter === "lobster" ? "default" : "outline"}
              size="sm"
              aria-pressed={activeStarter === "lobster"}
              onClick={() => loadStarter("lobster")}
            >
              ClaudeBot lobster
            </Button>
            <Button
              variant={activeStarter === "blank" ? "default" : "outline"}
              size="sm"
              aria-pressed={activeStarter === "blank"}
              onClick={() => loadStarter("blank")}
            >
              Blank canvas
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Undo"
              title="Undo"
              disabled={past.length === 0}
              onClick={handleUndo}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Redo"
              title="Redo"
              disabled={future.length === 0}
              onClick={handleRedo}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {/* Grid size selector */}
          <div className="flex items-center gap-1">
            {gridSizes.map((size) => (
              <Button
                key={size}
                variant={gridSize === size ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  gridSize !== size && "text-muted-foreground"
                )}
                onClick={() => handleGridSizeChange(size)}
              >
                {size}&times;{size}
              </Button>
            ))}
          </div>

          {/* Tool buttons */}
          <div className="flex items-center gap-1">
            {tools.map(({ id, icon: Icon, label }) => (
              <Button
                key={id}
                variant={tool === id ? "default" : "outline"}
                size="sm"
                className={cn(
                  tool === id && "bg-foreground text-background hover:bg-foreground/90"
                )}
                onClick={() => setTool(id)}
                aria-label={label}
                aria-pressed={tool === id}
                title={label}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={canvasDim}
            height={canvasDim}
            className="cursor-crosshair rounded-lg"
            style={{ maxWidth: "100%", height: "auto" }}
            role="img"
            aria-label={`Pixel canvas, ${gridSize} by ${gridSize}`}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        </div>

        {/* Color palette */}
        <div className="mt-5 rounded-xl border border-border/50 bg-background/35 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Palette className="h-3.5 w-3.5" aria-hidden="true" /> Color bench
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllColors((current) => !current)}
            >
              {showAllColors ? "Fewer colors" : "More colors"}
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
          {visiblePaletteIndices.map((paletteIndex) => {
            const color = PALETTE[paletteIndex];
            return (
            <button
              key={paletteIndex}
              onClick={() => setSelectedColor(paletteIndex)}
              className={cn(
                "h-8 w-8 rounded-md border-2 transition-transform",
                selectedColor === paletteIndex
                  ? "border-white scale-110 ring-2 ring-white/30"
                  : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
              aria-pressed={selectedColor === paletteIndex}
              title={color}
            />
            );
          })}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-center gap-3">
          <Button variant="outline" onClick={handleClear}>
            <Trash2 className="mr-2 h-4 w-4" /> Clear
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Download PNG
          </Button>
        </div>
        <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
          32×32 starter art, touch drawing, flood fill, 50-step history, and
          browser-only PNG export.
        </p>
      </div>
    </div>
  );
}
