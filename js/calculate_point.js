/**
 * Calculate new point position which has intersection with others lower than provided threshold
 *
 * @param existingPoints {{ x: number, y: number, r: number }[]}
 * @param options {{ diskRadius: number, pointMinRadius: number, pointMaxRadius: number, intersectionThreshold: number, center: { x: number, y: number} } }}
 * @returns {Promise<{ x: number, y: number, r: number }>}
 */
function calculateNewPoint(existingPoints, options) {
  return new Promise(resolve => {
    const { diskRadius, pointMinRadius, pointMaxRadius, intersectionThreshold, center } = options;

    let a = Math.random() * 2 * Math.PI; // angle
    let r = Math.sqrt(~~(Math.random() * diskRadius * diskRadius)); // distance from the center of the main circle
    // x and y coordinates of the particle
    let x = Math.floor(center.x + r * Math.cos(a));
    let y = Math.floor(center.y + r * Math.sin(a));

    const pointRadius = randomInteger(pointMinRadius, pointMaxRadius);

    if (existingPoints.some(point => {
      const v = areaOfIntersection(x, y, pointRadius, point.x, point.y, point.r);
      if (v < 0) return true;
      if (v > intersectionThreshold) return true;
      return false;
    })) {
      setTimeout(() => resolve(), 0);
      return;
    }

    return resolve({x, y, r: pointRadius});
  });
}
