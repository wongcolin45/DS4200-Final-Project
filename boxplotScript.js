
d3.csv("adult_clean.csv").then(function(data) {
    data.forEach(d => {
    d["hours-per-week"] = +d["hours-per-week"];
    d.income = d.income.trim();
    });

    const margin = {top: 50, right: 50, bottom: 50, left: 70},
        width = 600,
        height = 400;

    const svg = d3.select("#boxplot")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .style("background", "lightyellow");

    // income groups
    const incomeGroups = [...new Set(data.map(d => d.income))];

    // Create scales
    const xScale = d3.scaleBand()
                    .domain(incomeGroups)
                    .range([margin.left, width - margin.right])
                    .padding(0.5);

    const yScale = d3.scaleLinear()
                    .domain([d3.min(data, d => d["hours-per-week"]), d3.max(data, d => d["hours-per-week"])])
                    .range([height - margin.bottom, margin.top]);
    // color
    const color = d3.scaleOrdinal()
                    .domain(incomeGroups)
                    .range(["#1f77b4", "#ff7f0e"]);

    // y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    // x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    // axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .text("Income Group");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .text("Hours per Week");

    // compute quartiles
    function computeBoxPlotStats(groupData) {
    let values = groupData.map(d => d["hours-per-week"]).sort(d3.ascending);
    return {
        min: d3.min(values),
        q1: d3.quantile(values, 0.25),
        median: d3.quantile(values, 0.5),
        q3: d3.quantile(values, 0.75),
        max: d3.max(values)
    };
    }

    // Group data
    const statsByIncome = d3.rollup(data, computeBoxPlotStats, d => d.income);

    // Draw the box plots
    statsByIncome.forEach((stats, income) => {
    let x = xScale(income);
    let boxWidth = xScale.bandwidth();

    // Draw vertical line for whiskers
    svg.append("line")
        .attr("x1", x + boxWidth / 2)
        .attr("x2", x + boxWidth / 2)
        .attr("y1", yScale(stats.min))
        .attr("y2", yScale(stats.max))
        .attr("stroke", "black");

    // rectangle for iqr
    svg.append("rect")
        .attr("x", x)
        .attr("y", yScale(stats.q3))
        .attr("width", boxWidth)
        .attr("height", yScale(stats.q1) - yScale(stats.q3))
        .attr("fill", color(income))
        .attr("stroke", "black");

    // median
    svg.append("line")
        .attr("x1", x)
        .attr("x2", x + boxWidth)
        .attr("y1", yScale(stats.median))
        .attr("y2", yScale(stats.median))
        .attr("stroke", "black")
        .attr("stroke-width", 2);
    });
});
