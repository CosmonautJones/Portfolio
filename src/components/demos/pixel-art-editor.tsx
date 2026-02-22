"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, Download, Pencil, PaintBucket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PALETTE } from "@/lib/game/sprites/palette";
import { cn } from "@/lib/utils";

function createEmptyGrid(size: number): number[][] {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

function floodFill(
  grid: number[][],
  x: number,
  y: number,
  newColor: number
): number[][] {
  const targetColor = grid[y][x];
  if (targetColor === newColor) return grid;
  const newGrid = grid.map((row) => [...row]);
  const queue: [number, number][] = [[x, y]];
  const size = grid.length;
  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    if (cx < 0 || cx >= size || cy < 0 || cy >= size) continue;
    if (newGrid[cy][cx] !== targetColor) continue;
    newGrid[cy][cx] = newColor;
    queue.push([cx - 1, cy], [cx + 1, cy], [cx, cy - 1], [cx, cy + 1]);
  }
  return newGrid;
}

function getCellSize(gridSize: number): number {
  if (gridSize === 8) return 40;
  if (gridSize === 32) return 14;
  return 24; // 16x16 default
}

export function PixelArtEditor() {
  const [gridSize, setGridSize] = useState(16);
  const [grid, setGrid] = useState<number[][]>(() => createEmptyGrid(16));
  const [selectedColor, setSelectedColor] = useState(1);
  const [tool, setTool] = useState<"pencil" | "eraser" | "fill">("pencil");
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cellSize = getCellSize(gridSize);
  const canvasDim = gridSize * cellSize;

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

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const cell = getCellFromEvent(e);
      if (!cell) return;
      setIsDrawing(true);
      applyTool(cell.x, cell.y);
    },
    [getCellFromEvent, applyTool]
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
      setIsDrawing(true);
      applyTool(cell.x, cell.y);
    },
    [getCellFromTouch, applyTool]
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
    setGrid(createEmptyGrid(gridSize));
  }, [gridSize]);

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
  }, [grid, gridSize]);

  const handleGridSizeChange = useCallback((size: number) => {
    setGridSize(size);
    setGrid(createEmptyGrid(size));
  }, []);

  const gridSizes = [8, 16, 32] as const;
  const tools = [
    { id: "pencil" as const, icon: Pencil, label: "Pencil" },
    { id: "eraser" as const, icon: Eraser, label: "Eraser" },
    { id: "fill" as const, icon: PaintBucket, label: "Fill" },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
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
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {PALETTE.slice(1).map((color, i) => (
            <button
              key={i + 1}
              onClick={() => setSelectedColor(i + 1)}
              className={cn(
                "h-7 w-7 rounded-md border-2 transition-all",
                selectedColor === i + 1
                  ? "border-white scale-110 ring-2 ring-white/30"
                  : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
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
      </div>
    </div>
  );
}
