/**
 * Result can be saved as .zso script file and imported in Zemax OpticStudio
 *
 * @param points
 * @returns {string}
 */
function toZemaxScript(points) {
  let result = `CYLINDER C0 0, 0\r\n`;
  points.forEach((point, index) => {
    result += `SPHERE S${index}, ${100 / 1000}\r\n`;
    result += `MOVE S${index}, ${(point.x - 2500) / 1000}, ${(point.y - 2500) / 1000}, ${(point.z) / 1000}\r\n`;
    // result += `DIFFERENCE C${index + 1}, C${index}, S${index}\r\n`;
  });

  return result;
}

/**
 * Convert sphere coordinates x, y, r to x, y, z with constant radius
 *
 * @param points {{x: number, y: number, r: number}[]}
 * @param radius - convert to spheres with provided radius but different immersion
 *
 * @returns {{x: number, y: number, z: number}}[]
 */
function to3DimensionPoints(points, radius = 100) {
  return points
    .map(point => {
      // point.z = -1 * radius * Math.sqrt(1 - Math.pow(point.r / radius, 2));
      point.z = -1 * Math.sqrt(radius * radius - point.r * point.r);

      return point;
    })
  ;
}

/**
 * @param points {{x: number, y: number, r: number}[]}
 *
 * @returns {{x: number, y: number, z: number}}[]
 */
function applyOnCurvedSurface(points) {
  const curveRadius = 7.692;
  const curveCoefficient = 24.239;

  return points
    .map(point => {
      const d = Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));

      point.z = (
        (Math.pow(d, 2)
          / curveRadius * Math.sqrt(1 - (1 + curveCoefficient) * Math.pow(1 / curveRadius, 2) * Math.pow(d, 2))
        )
        + 0.176 * Math.pow(d, 4)
        - 0.323 * Math.pow(d, 6)
        + 0.216 * Math.pow(d, 8)
        - 0.55 * Math.pow(d, 10)
      );

      return point;
    });
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function areaOfIntersection(x0, y0, r0, x1, y1, r1) {
  var rr0 = r0 * r0;
  var rr1 = r1 * r1;
  var d = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));

  // Circles does not overlap
  if (d > r1 + r0)
  {
    return 0;
  }

  // Circle1 is completely inside circle0
  else if (d <= Math.abs(r0 - r1) && r0 >= r1)
  {
    // Return area of circle1
    return -1 * Math.PI * rr1;
  }

  // Circle0 is completely inside circle1
  else if (d <= Math.abs(r0 - r1) && r0 < r1)
  {
    // Return area of circle0
    return -1 * Math.PI * rr0;
  } // Circles partially overlap
  else
  {
    var phi = (Math.acos((rr0 + (d * d) - rr1) / (2 * r0 * d))) * 2;
    var theta = (Math.acos((rr1 + (d * d) - rr0) / (2 * r1 * d))) * 2;
    var area1 = 0.5 * theta * rr1 - 0.5 * rr1 * Math.sin(theta);
    var area2 = 0.5 * phi * rr0 - 0.5 * rr0 * Math.sin(phi);

    // Return area of intersection
    return area1 + area2;
  }
}

/**
 * @param d3points {{x: number, y: number, z: number}}[]
 * @param markerSize {number}
 * @param layoutSize {number}
 */
function visualize3d(d3points, markerSize = 100, layoutSize) {
  const trace1 = {
    x: d3points.map(p => p.x),
    y: d3points.map(p => p.y),
    z: d3points.map(p => p.z),
    mode: 'markers',
    marker: {
      size: markerSize,
      line: {
        color: 'rgba(217, 217, 217, 0.14)',
        width: 0.1
      },
      opacity: 0.8
    },
    type: 'scatter3d'
  };

  const data = [trace1];
  const layout = { width: layoutSize, height: layoutSize, margin: { l: 0, r: 0, b: 0, t: 0 } };

  Plotly.newPlot('my_dataviz3d', data, layout);
}
