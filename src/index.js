import * as d3 from "d3";


const margin = {
    top: 100,
    right: 20,
    bottom: 30,
    left: 60
}

const tooltip = d3.select('body').append('div')
    .attr('id', "tooltip")
    .attr('class',"tooltip")
    .style('opacity', 0)
    .style('position', 'absolute');

const h = 630 - margin.top - margin.bottom;
const w = //dataDisplay.node().clientWidth 
    920 - margin.left - margin.right;

const dataDisplay = d3.select("body").append("svg")
    .attr("height", h + margin.top + margin.bottom)
    .attr("width", w + margin.left + margin.right)
    .attr("class", "graph")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

    const xDomain = yearRange(dataset);
    xScale.domain([xDomain.min - 1, xDomain.max + 1]);
    xScale.range([0, w]);

    yScale.domain(d3.extent(dataset, d => d.Time));
    yScale.range([0, h]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('.0f'));
    const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S"));

    dataDisplay.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0,${(h)})`)
        .call(xAxis);

    dataDisplay.append("g")
        .attr("id", "y-axis")
        .call(yAxis);

    dataDisplay.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -160)
        .attr('y', -44)
        .style('font-size', 18)
        .text('Time in Minutes');

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
        .style("stroke", "#000")
        .on("mouseover", (d, i) => {
            tooltip.transition()
                .duration(200)
                .style('opacity', 0.95);
            tooltip.html(`${d.Name}: ${d.Nationality}<br>
                          ${d.Year}, ${d3.timeFormat("%M:%S")(d.Time)}<br><br>
                          ${d.Doping}`)
                .attr("data-year", d.Year)
                .style('left', `${d3.event.pageX}px`)
                .style('top', `${d3.event.pageY - 28}px`)
                .style('transform', 'translateX(60px)');
        })
        .on('mouseout', () => {
            tooltip.transition()
                .duration(200)
                .style('opacity', 0);
        });

    dataDisplay.append("text")
        .attr("id", "title")
        .attr("x", (w / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "30px")
        .text("Doping in Professional Bicycle Racing");

    dataDisplay.append("text")
        .attr("x", (w / 2))
        .attr("y", 0 - (margin.top / 2) + 25)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("35 Fastest times up Alpe d'Huez");

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
        .style("stroke", "#000");
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