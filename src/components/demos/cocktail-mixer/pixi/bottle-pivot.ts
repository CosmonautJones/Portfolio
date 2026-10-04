export function bottlePivot(
  textureWidth: number,
  textureHeight: number,
  cssWidth: number,
  cssHeight: number,
  neckX: number,
  neckY: number,
): { x: number; y: number } {
  return {
    x: neckX * (textureWidth / cssWidth),
    y: neckY * (textureHeight / cssHeight),
  };
}
