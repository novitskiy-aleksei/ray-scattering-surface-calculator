const m = async () => {
  const diskRadius = 250;

  const pointMaxRadius = 10;
  const pointMinRadius = 5;

  const densityRatio = 1;
  const intersectionThreshold = 10;

  //
  //
  const canvasMargin = diskRadius / 10;
  const width = diskRadius * 2 + canvasMargin;
  const height = diskRadius * 2 + canvasMargin;
  const center = {x: width / 2, y: height / 2};
  const diskSquare = diskRadius * diskRadius * Math.PI;

  // append the svg object to the body of the page
  const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
  ;

  // create a tooltip
  const Tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  const mouseover = function (event, d) {
    Tooltip.style("opacity", 1)
  }
  const mousemove = function (event) {
    Tooltip
      .html(`<u>x: ${event.target.cx.baseVal.value}; y: ${event.target.cy.baseVal.value} </u>
            <br> Radius: ${event.target.r.baseVal.value}`)
      .style("left", (event.x / 2 + 20) + "px")
      .style("top", (event.y / 2 - 30) + "px")
  }
  const mouseleave = function (event, d) {
    Tooltip.style("opacity", 0)
  }

  let pointsSquare = 0;
  const points = [];
  while (pointsSquare / diskSquare < densityRatio) {
    await main();
  }

  function main() {
    return new Promise(resolve => {
      let a = Math.random() * 2 * Math.PI; // angle
      let r = Math.sqrt(~~(Math.random() * diskRadius * diskRadius)); // distance from the center of the main circle
      // x and y coordinates of the particle
      let x = Math.floor(center.x + r * Math.cos(a));
      let y = Math.floor(center.y + r * Math.sin(a));


      const pointRadius = randomInteger(pointMinRadius, pointMaxRadius);

      if (points.some(point => {
        const v = areaOfIntersection(x, y, pointRadius, point.x, point.y, point.r);
        if (v < 0) return true;
        if (v > intersectionThreshold) return true;
        return false;
      })) {
        setTimeout(() => resolve(), 5);
        return;
      }

      pointsSquare += Math.PI * pointRadius * pointRadius;

      svg.append("circle")
        .attr("r", pointRadius)
        .attr("cx", x)
        .attr("cy", y)
        .style("fill-opacity", Math.random() + 0.3)
        .on("mouseover", mouseover) // What to do when hovered
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
      ;

      points.push({x, y, r: pointRadius});
      return resolve();
    });
  }

  const textArea = document.getElementById("xy-result");
  textArea.value = JSON.stringify(points);

}
m().then();

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


  // // Read data
// d3.csv("/11_SevCatOneNumNestedOneObsPerGroup.csv").then( function(data) {
//
//   // Filter a bit the data -> more than 1 million inhabitants
//   data = data.filter(function(d){ return d.value>100000 })
//
//   // Color palette for continents?
//   const color = d3.scaleOrdinal()
//     .domain(["Asia", "Europe", "Africa", "Oceania", "Americas"])
//     .range(d3.schemeSet1);
//
//   // Size scale for countries
//   const size = d3.scaleLinear()
//     .domain([0, 1400000000])
//     .range([7,55])  // circle will be between 7 and 55 px wide
//
//   // Initialize the circle: all located at the center of the svg area
//   var node = svg.append("g")
//     .selectAll("circle")
//     .data(data)
//     .join("circle")
//     .attr("class", "node")
//     .attr("r", d => size(d.value))
//     .attr("cx", width / 2)
//     .attr("cy", height / 2)
//     .style("fill", d => color(d.region))
//     .style("fill-opacity", 0.8)
//     .attr("stroke", "black")
//     .style("stroke-width", 1)
//     // .on("mouseover", mouseover) // What to do when hovered
//     // .on("mousemove", mousemove)
//     // .on("mouseleave", mouseleave)
//     ;
//   // .call(d3.drag() // call specific function when circle is dragged
//   // .on("start", dragstarted)
//   // .on("drag", dragged)
//   // .on("end", dragended));
//
//   // Features of the forces applied to the nodes:
//   const simulation = d3.forceSimulation()
//     .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
//     .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
//     .force("collide", d3.forceCollide().strength(.2).radius(function(d){ return (size(d.value)+3) }).iterations(1)) // Force that avoids circle overlapping
//
//   // Apply these forces to the nodes and update their positions.
//   // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
//   simulation
//     .nodes(data)
//     .on("tick", function(d){
//   node
//     .attr("cx", d => d.x)
//     .attr("cy", d => d.y)
// });
//
// })
