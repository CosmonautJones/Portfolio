export type StreamPointData = {
  x: number;
  y: number;
};

export function streamSag(
  start: StreamPointData,
  end: StreamPointData,
): number {
  const length = Math.hypot(end.x - start.x, end.y - start.y);
  return Math.min(18, Math.max(4, length * 0.12));
}

export function quadraticPoint(
  start: StreamPointData,
  end: StreamPointData,
  sagY: number,
  t: number,
): StreamPointData {
  const inverse = 1 - t;
  const controlX = (start.x + end.x) / 2;
  const controlY = (start.y + end.y) / 2 + sagY * 2;
  return {
    x: inverse * inverse * start.x + 2 * inverse * t * controlX + t * t * end.x,
    y: inverse * inverse * start.y + 2 * inverse * t * controlY + t * t * end.y,
  };
}

export function writeStreamPoints(
  points: StreamPointData[],
  start: StreamPointData,
  end: StreamPointData,
  sagY = streamSag(start, end),
): void {
  for (let index = 0; index < points.length; index += 1) {
    const point = quadraticPoint(
      start,
      end,
      sagY,
      index / (points.length - 1),
    );
    points[index].x = point.x;
    points[index].y = point.y;
  }
}

export function rimCrossingTime(
  start: StreamPointData,
  end: StreamPointData,
  sagY: number,
  rimY: number,
): number {
  if (end.y <= rimY) return 1;
  if (start.y >= rimY) return 0;

  let low = 0;
  let high = 1;
  for (let step = 0; step < 18; step += 1) {
    const mid = (low + high) / 2;
    if (quadraticPoint(start, end, sagY, mid).y < rimY) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return (low + high) / 2;
}

export function writeSplitStream(
  airPoints: StreamPointData[],
  innerPoints: StreamPointData[],
  neck: StreamPointData,
  surface: StreamPointData,
  rimY: number,
): StreamPointData {
  const sagY = streamSag(neck, surface);
  const rimTime = rimCrossingTime(neck, surface, sagY, rimY);

  for (let index = 0; index < airPoints.length; index += 1) {
    const point = quadraticPoint(
      neck,
      surface,
      sagY,
      (index / (airPoints.length - 1)) * rimTime,
    );
    airPoints[index].x = point.x;
    airPoints[index].y = point.y;
  }

  for (let index = 0; index < innerPoints.length; index += 1) {
    const point = quadraticPoint(
      neck,
      surface,
      sagY,
      rimTime + (index / (innerPoints.length - 1)) * (1 - rimTime),
    );
    innerPoints[index].x = point.x;
    innerPoints[index].y = point.y;
  }

  return quadraticPoint(neck, surface, sagY, rimTime);
}

export function collapseStreamPoints(
  points: StreamPointData[],
  origin: StreamPointData,
): void {
  for (const point of points) {
    point.x = origin.x;
    point.y = origin.y;
  }
}

/**
 * Pixi MeshRope live-point wobble (official snake/ribbon pattern):
 * mutate interior points each frame; leave the endpoints pinned.
 */
export function wobbleStreamPoints(
  points: StreamPointData[],
  timeSec: number,
  amount: number,
): void {
  if (amount <= 0 || points.length < 3) return;

  const amplitude = 1.2 * Math.max(0, Math.min(1, amount));
  for (let index = 1; index < points.length - 1; index += 1) {
    points[index].x += Math.sin(timeSec * 14 + index * 0.7) * amplitude;
  }
}
