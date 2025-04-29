// File: types/index.ts
// Removed 'eyedropper' from Tool type
export type Tool = "fill" | "erase" | "pan";

export interface ZoomPanState {
  scale: number;
  offset: { x: number; y: number };
}

export interface Point {
  x: number;
  y: number;
}

export interface CanvasRefs {
  baseCanvasRef: React.RefObject<HTMLCanvasElement>;
  colorCanvasRef: React.RefObject<HTMLCanvasElement>;
  displayCanvasRef: React.RefObject<HTMLCanvasElement>;
}
//--------End File---------
