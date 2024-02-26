var data = [
    { time: 1, val: 4 },
    { time: 2, val: 3 }, 
    { time: 3, val: 7 }, 
    { time: 4, val: 2 }, 
    { time: 5, val: 7 }, 
    { time: 6, val: 9 }
]

var time = [1, 2, 3, 4, 5, 6]
var val = [3, 6, 8, 2, 5, 8]

const trend = new Trend()

var selectedGraph = "select-line";
var currQuery = "";

function draw(kind, movie)
{    
    $("#svg-graph").remove()
    const height = parseInt(d3.select("#graph").style("height"),10)
    const width = parseInt(d3.select("#graph").style("width"), 10)
    const margin = { v: height / 10, h: width / 10 }
    
    const svg = d3.select("#graph")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "svg-graph")
        .append("g")
            .attr("transform", `translate(${margin.h/2}, ${margin.v/2})`)
    
    if (kind == "select-line") {
        var data = trend.get_interest_over_time(movie)

        var timeFormat = d3.timeFormat("%Y");

        const y = d3.scaleLinear().range([height - margin.v, 0]).domain([Math.min(...data.map(d=>d[1])), Math.max(...data.map(d=>d[1]))])
        const x = d3.scaleTime().range([0, width - margin.h]).domain([Math.min(...data.map(d=>d[0])), Math.max(...data.map(d=>d[0]))]).nice()

        svg.append("g")
            .call(d3.axisBottom(x).ticks(10, timeFormat))
            .attr("transform", `translate(0, ${height - margin.v})`)
    
        svg.append("g")
            .call(d3.axisLeft(y))
        
        const line = d3.line().x(d => x(d[0])).y(d => y(d[1]))
        
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line)
    }
    else if (kind == "select-map")
    {
        var projection = d3.geoNaturalEarth1().scale(width / (2 * Math.PI)).translate([width / 2.5, height / 2.5])
        var geo = JSON.parse(geoData)

        svg.append("g")
        .attr("id", "map")
        .selectAll("path")
        .data(geo.features)
        .enter().append("path")
            .attr("fill", "#69b3a2")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .style("stroke", "#fff")
    }
    
        
}


function search()
{
    var res = $("#search-bar").val();
    if (trend.movie_exists(res))
    {
        currQuery = res
        draw(selectedGraph, currQuery)
    }
    $("#search-bar").val("")
}


function search_suggestions(string)
{
    var suggestion_list = $("#search-suggestion-list")
    var suggestion = trend.match_string(string)
    suggestion_list.empty()
    for (let i = 0; i < suggestion.length;  i++)
    {
        suggestion_list.append(`<dt class="search-suggestion-item">${suggestion[i]}</dt>`)
    }
    $(".search-suggestion-item").on('click', (e) => {
        suggestion_list.empty()
        $("#search-bar").val($(e.target).text());
        $("#search-button").click();
    })
}


$(document).ready(() => {
    window.addEventListener("resize", function () { draw(selectedGraph, trend.get_interest_over_time(currQuery)) })
    window.addEventListener("load", () => { $("#search-bar").val("") })

    $("#search-button").on("click", search);
    $("#search-bar").on("input focus", (e) =>
    {
        search_suggestions($(e.target).val());
    })

    $("body").on('click', (e) =>
    {
        if (!($(e.target).is("#search-bar") || $(e.target).is("#search-suggestion-list")))
        {
            $("#search-suggestion-list").empty();
        }
    })

    var selected = $("#" + selectedGraph);
    selected.addClass("selected-tab");
    
    $(".select-tab").on('click', (e) =>
    {
        selected.removeClass("selected-tab")
        selected = $(e.target)
        selected.addClass("selected-tab")
        selectedGraph = selected.attr("id");

        draw(selectedGraph, currQuery)
    })
});


/*
function scatter(x, y, div)
{
    d3
    const real_x = x;
    const real_y = y;
    var graph = $("#" + div)
    
    var width = graph.width()
    var height = graph.height()

    var min_x = Math.min(...x)
    var max_x = Math.max(...x)
    var min_y = Math.min(...y)
    var max_y = Math.max(...y)

    var buffer_x = width / 20
    var buffer_y = width / 20

    var w = width - 2 * buffer_x
    var h = height - 2 * buffer_y

    if (min_x < 0)
    {
        x.forEach((element, idx) => { x[idx] += Math.abs(min_x) })
    }
    if (min_y < 0) {
        y.forEach((element, idx) => { x[idx] += Math.abs(min_y)})
    }
    

    var x_range = max_x - min_x
    var y_range = max_y - min_y
    

    alert(max_y)
    var scalar_x = w / x_range
    var scalar_y = h / y_range

    var point = $('<div class="point" style="position:absolute;background-color:black;height:5px;width:5px;border-radius:50%"></div>')
    x.forEach((element, i) =>
    { 
        let curr = point.clone()
        curr.css('bottom', y[i])
        curr.css('left', x[i])
        graph.append(curr)
    })

    
}
*/