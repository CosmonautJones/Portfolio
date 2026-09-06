export type StreamPointData = {
  x: number;
  y: number;
};

const MIDPOINT_SAG_Y = 6;
const QUADRATIC_CONTROL_OFFSET_Y = MIDPOINT_SAG_Y * 2;

export function writeStreamPoints(
  points: StreamPointData[],
  start: StreamPointData,
  end: StreamPointData,
): void {
  const controlX = (start.x + end.x) / 2;
  const controlY =
    (start.y + end.y) / 2 + QUADRATIC_CONTROL_OFFSET_Y;

  for (let index = 0; index < points.length; index += 1) {
    const t = index / (points.length - 1);
    const inverse = 1 - t;
    points[index].x =
      inverse * inverse * start.x +
      2 * inverse * t * controlX +
      t * t * end.x;
    points[index].y =
      inverse * inverse * start.y +
      2 * inverse * t * controlY +
      t * t * end.y;
  }
}
