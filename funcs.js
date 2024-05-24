const trend = new Trend()

var currQuery = "Black Panther Movie";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function loading_screen(func, args)
{
    var loading = true;
    var rotation = 0;
    function loading_loop()
    {
        
        setTimeout(() =>
        {
            rotation = (rotation+5)%361
            $(".loading-circle").css("transform", "rotate("+rotation+"deg)");
            if (loading)
            {
                loading_loop();
            }
        }, 100)
    }
    $("#loading-screen").css("display", "flex");
    
    loading_loop();
    if (args != null) {
        func(args).then(() => {
            loading = false;
            $("#loading-screen").css("display", "none");
        })
    }
    else
    {
        func().then(() =>
            {
                loading = false;
                $("#loading-screen").css("display", "none");
            })
    }
    
    
}

function draw_line(movie)
{
    $("#svg-line-graph").remove()
    const height = parseInt(d3.select("#line-graph").style("height"),10)
    const width = parseInt(d3.select("#line-graph").style("width"), 10)
    const margin = { v: height*6 / 25, h: width*5 / 25 }
    
    var svg = d3.select("#line-graph")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "svg-line-graph")
    
    svg = svg.append("g")
        .attr("transform", `translate(${margin.h / 2}, ${margin.v / 2})`)
    
    
    var data = trend.get_interest_over_time(movie)

    var timeFormat = d3.timeFormat("%Y");

    const y = d3.scaleLinear().range([height - margin.v, 0]).domain([Math.min(...data.map(d=>d[1])), Math.max(...data.map(d=>d[1]))])
    const x = d3.scaleTime().range([0, width - margin.h]).domain([Math.min(...data.map(d=>d[0])), Math.max(...data.map(d=>d[0]))]).nice()

    svg.append("g")
        .call(d3.axisBottom(x).ticks(10, timeFormat))
        .attr("transform", `translate(0, ${height - (margin.v)})`)

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

function draw_map(movie)
{
    $("#svg-map-graph").remove()
    const height = parseInt(d3.select("#cloropleth").style("height"),10)
    const width = parseInt(d3.select("#cloropleth").style("width"), 10)
    const margin = { v: height*3 / 25, h: width*3 / 25 }
    
    var svg = d3.select("#cloropleth")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
        .attr("id", "svg-map-graph")
    
    var projection = d3.geoNaturalEarth1().scale(width / (2 * Math.PI)).translate([width / 2.5, height / 2.5])
    var projection2 = d3.geoMercator().scale(60).center([20,20]).translate([(width+margin.h/2)/2, (height+margin.v/2)/2]);
    var geo_trend = trend.get_geo(movie)
    
    var trend_range = geo_trend[2]-geo_trend[1]
    var colorScale = d3.scaleLinear().domain([-1, geo_trend[1], geo_trend[1] + (trend_range / 2), geo_trend[2]]).range(d3.schemeBlues[4]);
    
    var tooltip = d3.select("#cloropleth")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-color", "grey")    
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("width", "fit-content")
    .style("position", "absolute")
    .style("z-index", "-1")

    let mouseOver = function(d) {
        d3.selectAll(".Country")
            .transition()
            .duration(100)
            .style("opacity", .5)
        d3.select(this)
            .transition()
            .duration(100)
            .style("opacity", 1)
        tooltip
            .style("opacity", 1)
            .html("Country : " + d.properties.name + "<br>Popularity : " + d.trend)
            .style("z-index", 2)
            .style("left", "calc( 45% + " + d3.mouse(this)[0] + "px )")
            .style("top", (d3.mouse(this)[1] + 10) + "px")
        console.log(d3.mouse(this))
    }
    
    var mousemove = function (d) {
        tooltip
            .html("Country : " + d.properties.name + "<br>Popularity : " + d.trend)
            .style("left", "calc( 58% + " + d3.mouse(this)[0] + "px )")
            .style("top", (d3.mouse(this)[1]) + "px")
        }
    
    let mouseLeave = function(d) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .8)
        d3.select(this)
            .transition()
            .duration(200)
            .style("stroke", "transparent")
        tooltip
            .style("opacity", 0)
            .style("left", 0)
            .style("z-index", -1)
    }
    

    console.log(colorScale(geo_trend[0].features[3]))
    
    svg.append("g")
        .attr("id", "map")
        .selectAll("path")
        .data(geo_trend[0].features)
        .enter().append("path")
        .attr("d", d3.geoPath()
            .projection(projection2)
        )
        .style("stroke", "#fff")
        .attr("fill", function (d) {
            return colorScale(d.trend);
        })
        .attr("class", "Country")
        .style("opacity", .8)
        .on("mouseover", mouseOver )
        .on("mouseleave", mouseLeave)
        
    //.on("mousemove", mousemove);
    
}


function draw_top_week()
{
    var top_week_div = $("#top-week")
                
    var movies = trend.get_top_week(3)
    for (let i = 0; i < 3; i++)
    {
        top_week_div.append(`
        <div class="week-entry-div">
            <img class="week-entry-poster">
            <div class="week-entry-title-bar-div">
                <p class="week-entry-title"></p>
                <div class="week-entry-bar top-bar">
                </div>
                <div class="week-entry-bar-empty top-empty-bar">
                </div>
                <p class="imdb-score"></p>
            </div>
        </div>
        `)
    }
    var i = 0
    top_week_div.children("div[class='week-entry-div']").each(function () { 
        var entry = $(this)
        console.log(entry)
        var img = $(entry.children()[0])
        var title = $($(entry.children()[1]).children()[0])
        var bar_div = $($(entry.children()[1]).children()[1])
        var score_text = $($(entry.children()[1]).children()[3])

        var score = parseFloat(movies[i].imdbRating.split(' ')[0])
        var width = score * 9
        
        img.attr("src", movies[i].posterImage)
        title.text(movies[i].title)
        bar_div.css({ "width": width.toString() + '%' })
        score_text.text(score.toString())
        i++
    })
}

function draw_worst_week()
{
    var worst_week_div = $("#worst-week")
                
    var movies = trend.get_worst_week(3)
    for (let i = 0; i < 3; i++)
    {
        worst_week_div.append(`
        <div class="week-entry-div">
            <img class="week-entry-poster">
            <div class="week-entry-title-bar-div">
                <p class="week-entry-title"></p>
                <div class="week-entry-bar worst-bar">
                </div>
                <div class="week-entry-bar-empty worst-empty-bar">
                </div>
                <p class="imdb-score"></p>
            </div>
        </div>
        `)
    }
    var i = 0
    worst_week_div.children("div[class='week-entry-div']").each(function () { 
        var entry = $(this)
        console.log(entry)
        var img = $(entry.children()[0])
        var title = $($(entry.children()[1]).children()[0])
        var bar_div = $($(entry.children()[1]).children()[1])
        var score_text = $($(entry.children()[1]).children()[3])

        var score = parseFloat(movies[i].imdbRating.split(' ')[0])
        var width = score * 9
        
        img.attr("src", movies[i].posterImage)
        title.text(movies[i].title)
        bar_div.css({ "width": width.toString() + '%' })
        score_text.text(score.toString())
        i++
    })
}

async function draw(movie)
{
    draw_map(movie)
    draw_line(movie)
    await sleep(1000);
}


async function search()
{
    var res = $("#search-bar").val();
    if (trend.movie_exists(res))
    {
        currQuery = res
        await loading_screen(draw ,currQuery)
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
async function prep()
{
    await trend.get_curr_movies();
    draw_top_week()
    draw_worst_week()
    await draw(currQuery)
}
$(document).ready(async function () {
    
    /* MAKE WELOCME SCREEN*/
    
    await loading_screen(prep);
    
    /* FOR TESTING */

    window.addEventListener("resize", function () { draw(currQuery) })
    window.addEventListener("load", () => { $("#search-bar").val("") })

    await $("#search-button").on("click", search);
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
});
