const main = async () => {
  const diskRadius = 1000;

  const pointMaxRadius = 100;
  const pointMinRadius = 50;

  const densityRatio = 1.8;
  let intersectionThreshold = 800;

  // produce additional settings
  const canvasMargin = diskRadius / 10;
  const width = diskRadius * 2 + canvasMargin;
  const height = diskRadius * 2 + canvasMargin;
  const center = {x: width / 2, y: height / 2};
  const diskSquare = diskRadius * diskRadius * Math.PI;

  // result view area
  const xyResult = document.getElementById("xy-result");
  const xy3dResult = document.getElementById("xy3d-result");
  const zemaxResult = document.getElementById("zemax-result");

  let manualBreak = false;
  document.getElementById("stop-button")
    .onclick = function () {
      manualBreak = true;
    };

  // append the svg object to the body of the page
  const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", function () {
      const [x, y] = d3.mouse(this);
      let radius = pointMaxRadius;
      const distance2center = Math.sqrt(Math.pow(center.x - x, 2) + Math.pow(center.y - y, 2));

      if (distance2center > diskRadius) {
        console.log(`Out of range ${distance2center}`);
        return;
      }

      while (radius >= pointMinRadius) {
        if (points.some(point => {
          const v = areaOfIntersection(x, y, radius, point.x, point.y, point.r);
          if (v < 0) return true;
          if (v > intersectionThreshold * 4) return true;
          return false;
        })) {
          radius--;
        } else {
          const newPoint = { x, y, r: radius};
          points.push(newPoint);
          console.log(newPoint);
          drawSVGCircle(newPoint);
          pointsSquare += Math.PI * Math.pow(radius, 2);
          break;
        }
      }
    })
  ;

  const drawSVGCircle = function (newPoint) {
    svg.append("circle")
      .attr("r", newPoint.r)
      .attr("cx", newPoint.x)
      .attr("cy", newPoint.y)
      .style("fill-opacity", Math.random() + 0.1)
    ;
  }

  let pointsSquare = 0;
  let points = [];

  // in case of loading already calculated points array
  if (window.calculatedPoints) {
    calculatedPoints.forEach(p => {
      drawSVGCircle(p);
      pointsSquare += Math.PI * Math.pow(p.r, 2);
    });
    points = calculatedPoints;
  }

  let compactIntersectionThreshold = 0;
  while (pointsSquare / diskSquare < densityRatio) {
    if (manualBreak) break;

    const currentDensity = pointsSquare / diskSquare;
    // compact points to prevent empty spaces between circles
    if (currentDensity > 0.85 && compactIntersectionThreshold < intersectionThreshold * 1.5) {
      compactIntersectionThreshold = intersectionThreshold * 1.5;
    }
    if (currentDensity > 1 && compactIntersectionThreshold < intersectionThreshold * 2) {
      compactIntersectionThreshold = intersectionThreshold * 2;
    }
    if (currentDensity > 1.1 && compactIntersectionThreshold < intersectionThreshold * 2.5) {
      compactIntersectionThreshold = intersectionThreshold * 2.5;
    }

    const newPoint = await calculateNewPoint(
      points,
      {
        diskRadius,
        pointMaxRadius,
        pointMinRadius,
        center,
        intersectionThreshold: compactIntersectionThreshold || intersectionThreshold,
      }
    );

    if (newPoint) {
      drawSVGCircle(newPoint);
      pointsSquare += Math.PI * Math.pow(newPoint.r, 2);
      points.push(newPoint);
    }
  }

  const d3points = to3DimensionPoints(points, 100);

  xyResult.value = JSON.stringify(points);
  xy3dResult.value = JSON.stringify(d3points);
  zemaxResult.value = toZemaxScript(d3points);

  manualBreak = false;
}



main()
  .then();
