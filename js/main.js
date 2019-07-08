//
// Main script for timeline
//
$(document).ready(function() {

    // Set the dimensions and margins of the graph
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Append the <svg> object to the body
    let svg = d3.select('#data-visualisation')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Read Data
    d3.csv('../csv/world-population.csv', function(data) {

        // Filter data -> more than 1 million inhabitants
        data = data.filter(function(d) {
            return d.value > 10000000
        });

        // Color palette for continents
        let color = d3.scaleOrdinal()
            .domain(["Asia", "Europe", "Africa", "Oceania", "Americas"])
            .range(d3.schemeSet2);

        // Size scale for countries
        let size = d3.scaleLinear()
            .domain([0, 1400000000])
            .range([7, 55]); // circle will be between 7 and 55px wide 

        // Create tooltip
        let tooltip = d3.select('#data-visualisation')
            .append('div')
            .style('opacity', 0)
            .attr('class', 'tooltip');

        // Functions that change tooltip when user hovers or moves
        let mouseOver = function(d) {
            tooltip
                .style('opacity', 1);
        }

        let mouseMove = function(d) {
            tooltip
                .html('<b class="title-text">' + d.key + '</b>' + '<br>' + d.value + ' inhabitants')
                .style('left', (d3.mouse(this)[0]) + 'px')
                .style('top', (d3.mouse(this)[1]) + 'px');
        }

        let mouseLeave = function(d) {
            tooltip
                .style('opacity', 0);
        }

        // Initialise the circle
        let node = svg.append('g')
            .selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', function(d) {
                return size(d.value)
            })
            .attr('cx', width / 2)
            .attr('cy', height / 2)
            .style('fill', function(d) {
                return color(d.region)
            })
            .style('fill-opacity', 0.8)
            //.attr('stroke', 'black')
            //.style('stroke-width', 1)
            .on('mouseover', mouseOver)
            .on('mousemove', mouseMove)
            .on('mouseleave', mouseLeave)
            .call(d3.drag()
                .on('start', dragStarted)
                .on('drag', dragged)
                .on('end', dragEnded));

        // Features of the forces applied to the nodes
        let simulation = d3.forceSimulation()
            .force('center', d3.forceCenter()
                .x(width / 2)
                .y(height / 2)) //Attracts to center of <svg> area
            .force('charge', d3.forceManyBody()
                .strength(0.1)) // Nodes are attracted one each other of value is > 0
            .force('collide', d3.forceCollide()
                .strength(0.2)
                .radius(function(d) {
                    return (size(d.value) + 3)
                })
                .iterations(1)); // Force that avoids circle overlapping

        // Apply these forces to the nodes and update their positions.
        // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
        simulation
            .nodes(data)
            .on('tick', function(d) {
                node
                    .attr('cx', function(d) {
                        return d.x;
                    })
                    .attr('cy', function(d) {
                        return d.y;
                    })
            });

        // Actions when circle is dragged
        function dragStarted(d) {
            if (!d3.event.active) {
                simulation
                    .alphaTarget(0.03)
                    .restart();
            }
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragEnded(d) {
            if (!d3.event.active) {
                simulation
                    .alphaTarget(0.03);
            }
            d.fx = null;
            d.fy = null;
        }


    });
});