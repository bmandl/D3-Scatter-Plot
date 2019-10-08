import * as d3 from "d3";

const h = 500,
    xPadding = 80,
    yPadding = 50;

const tooltip = d3.select('#container').append('div')
    .attr('id', "tooltip")
    .style('opacity', 0)
    .style('position','absolute');

const dataDisplay = d3.select("#dataBox").append("svg")
    .attr("width", "100%")
    .attr("height", h);

const xScale = d3.scaleLinear();
const yScale = d3.scaleTime();

const color = d3.scaleOrdinal(d3.schemeCategory10);

const yearRange = dataset => {

    const min = d3.min(dataset, d => d["Year"]),
        max = d3.max(dataset, d => d["Year"]);

    return { min, max };
}

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json").then(dataset => {

    dataset.forEach(d => {
        d.Place = +d.Place;
        var parsedTime = d.Time.split(':');
        d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
    });

    const w = dataDisplay.node().clientWidth - xPadding;

    const xDomain = yearRange(dataset);
    xScale.domain([xDomain.min - 1, xDomain.max + 1]);
    xScale.range([xPadding, w]);

    yScale.domain(d3.extent(dataset, d => d.Time));
    yScale.range([yPadding, h - yPadding]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('.0f'));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

    dataDisplay.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("data-xvalue", d => d.Year)
        .attr("data-yvalue", d => d.Time)
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.Time))
        .attr("r", 6)
        .style("fill", d => color(d.Doping != ""))
        .style("stroke","#000")
        .on("mouseover", (d,i) => {
            tooltip.transition()
            .duration(200)
            .style('opacity',0.95);
            tooltip.html(`${d.Name}: ${d.Nationality}<br>
                          ${d.Year}, ${d3.timeFormat("%M:%S")(d.Time)}<br><br>
                          ${d.Doping}`)
            .attr("data-year", d.Year)
            .style('left', `${d3.event.pageX}px`)
            .style('top', `${d3.event.pageY-28}px`)
            .style('transform', 'translateX(60px)');
        })
        .on('mouseout', () => {
            tooltip.transition()
                   .duration(200)
                   .style('opacity',0);
        });

    dataDisplay.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0,${(h - yPadding)})`)
        .call(xAxis);

    dataDisplay.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${(xPadding)},0)`)
        .call(yAxis);

    const legend = dataDisplay.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("id", "legend")
        .attr("transform", (d, i) => "translate(0," + (h / 3 - i * 20) + ")");
    legend.append("rect")
        .attr("x", w - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color)
        .style("stroke","#000");
    legend.append("text")
        .attr("x", w - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => {
            if (d) return "Riders with doping allegations";
            else return "No doping allegations";
        });
});