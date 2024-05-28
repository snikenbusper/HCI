const trend = new Trend()

var menu_div = $("#menu-div")
var graph_div = $("#graph-div")
var mow_div = $("#mow-div")
var overview_div = $("#movie-overview-div")
var currQuery = "";
var currMenu = overview_div;

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
    
    console.log(movie)
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
    

    var tooltip = d3.select("#line-graph")
        .append("div")
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-color", "grey")    
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("width", "fit-content")
        .style("position", "absolute")
        .style("display", "none")
        .style("z-index", 2)

    const circle = svg.append("circle")
        .attr("r", 0)
        .attr("fill", "steelblue")
        .style("stroke", "white")
        .attr("opacity", .70)
        .style("pointer-events", "none");

    const listeningRect = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("opacity", 0);
    
    listeningRect.on("mousemove", function () {
        const x_coord = d3.mouse(this)[0];
        const bisectDate = d3.bisector(d => d[0]).left;
        const date = x.invert(x_coord);
        const i = bisectDate(data, date, 1);
        const d_prev = data[i - 1];
        const d_next = data[i];
        const d = d_next == undefined ? d_prev : (d_prev == undefined) ? d_next : ((date - d_prev[0]) > (d_next[0] - date) ? d_next : d_prev);
        const xPos = x(d[0]);
        const yPos = y(d[1]);

        circle.attr("cx", xPos)
        .attr("cy", yPos);

        circle.transition()
        .duration(50)
        .attr("r", 5);
        
        
        tooltip.style("display", "block")
        .html("Trend score : " + d[1] + "<br>Date : " + d[0].toLocaleDateString("en-US"))
        .style("left", `${xPos + 100}px`)
        .style("top", `${yPos + 50}px`)
    })

    
    listeningRect.on("mouseleave", function () {
        circle.transition()
          .duration(50)
          .attr("r", 0);
    
        tooltip.style("display", "none");
      });

    let mouseOver = function (d)
    {
        tooltip
            .style("opacity", 1)
            .html("test")
            .style("z-index", 2)
            .style("left", d3.mouse(this)[0] + "px")
            .style("top", (d3.mouse(this)[1] + 10) + "px")
    }

    let mouseLeave = function(d) {
        tooltip
            .style("opacity", 0)
            .style("left", 0)
            .style("z-index", -1)
    }

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#59A7FF")
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

async function draw(movie) {
    if (movie == "") {
        $(".chart").css({ "display": "none" })
        $(".default-res").css({ "display": "block" })
        $(".no-result").css({ "display": "none" })
    }
    else
    {
        $(".chart").css({ "display": "flex" })
        $(".default-res").css({ "display": "none" })
        $(".no-result").css({ "display": "none" })
        
        await sleep(1000)
        $("#trend-title").text(movie);
        draw_map(movie)
        draw_line(movie)
        await sleep(1000);
    }
    
}

async function draw_overview(movie)
{
    if (movie == "") {
        $("#overview-text-div").css({ "display": "none" })
        $("#overview-poster-div").css({ "display": "none" })
        $(".default-res").css({ "display": "block" })
        $(".no-result").css({ "display": "none" })
    }
    else
    {

        $("#overview-text-div").css({ "display": "flex" })
        $("#overview-poster-div").css({ "display": "flex" })
        $(".default-res").css({ "display": "none" })
        $(".no-result").css({ "display": "none" })
        
        var res = await trend.get_movie_overview(movie)
        var title = res["Title"]
        var poster = res["Poster"]
        var released = res["Released"]
        var runtime = res["Runtime"]
        var genres = res["Genre"]
        var synopsis = res["Plot"]
        var imdb = res["imdbRating"]

        var img_el = $(".movie-overview-poster")
        var text_div = $("#overview-text");
        var rating_div = $("#overview-rating")

        img_el.attr("src", poster)
        
        text_div.css({"display":"block"})
        text_div.html(
            "Title : " + title + "<br><br>" + 
            "Year Released : " + released + "<br><br>" + 
            "Runtime : " + runtime + "<br><br>" + 
            "Genres : " + genres + "<br><br>" + 
            "Synopsis : " + synopsis
        )
        $(".overview-rating-bar").css({ "width": (imdb * 4) + "%" })
        $("#overview-score").text(imdb)

        await sleep(500)
    }
}


async function search() {
    var res = $("#search-bar").val();

    if ($("#movie-trend").hasClass("active-menu")) {
        
        if (trend.movie_exists(res)) {
            currQuery = res
            console.log("boom")
            await loading_screen(draw, currQuery)
        }
        else {
            $(".chart").css({ "display": "none" })
            $(".default-res").css({ "display": "none" })
            $(".no-result").css({ "display": "block" })
        }
    }
    else
    {
        if (trend.movie_exists(res)) {
            currQuery = res
            await loading_screen(draw_overview, currQuery)
        }
        else {
            $("#overview-text-div").css({ "display": "none" })
            $("#overview-poster-div").css({ "display": "none" })
            $(".default-res").css({ "display": "none" })
            $(".no-result").css({ "display": "block" })
        }
    }
    
}


function search_suggestions(string) {
    var suggestion_list = $("#search-suggestion-list")
    suggestion_list.css({ "display": "block" })
    var suggestion = trend.match_string(string)
    suggestion_list.empty()
    for (let i = 0; i < suggestion.length; i++) {
        suggestion_list.append(`<dt class="search-suggestion-item">${suggestion[i]}</dt>`)
    }
    $(".search-suggestion-item").on('click', (e) => {
        suggestion_list.empty()
        $("#search-bar").val($(e.target).text());
        $("#search-button").click();
    })
    
    if (suggestion_list[0].children.length == 0)
    {
        suggestion_list.css({ "display": "none" })
    }
}
async function draw_week_movies()
{
    await trend.get_curr_movies();
    draw_top_week()
    draw_worst_week()
}
$(document).ready(async function () {
    
    currQuery = ""
    $("#search-bar").prop("value", currQuery);

    await loading_screen(draw_overview, currQuery)

    window.addEventListener("resize", function () { if ($("#movie-trend").hasClass("active-menu")) { draw(currQuery) } })

    await $("#search-button").on("click", search);
    $("#search-bar").on("input focus", (e) => {
        search_suggestions($(e.target).val());
    })

    $("#hamburger-circle").on("click", () => {
        if ($("#hamburger-circle").hasClass("is-active")) {
            $("#hamburger-circle").removeClass("is-active")

            
            $("#sidebar-div").css({ "width": "0"})
            $("#sidebar-div").css({ "left": "calc(100%)" })
            $("#sidebar-item-container").css({"display":"none"})
            
        }
        else {
            $("#hamburger-circle").addClass("is-active")

            $("#sidebar-div").css({ "width": "20rem"})
            $("#sidebar-div").css({ "left": "calc(100% - 20rem)" })
            $("#sidebar-item-container").css({"display":"flex"})
        }
        
    })

    $(".sidebar-item").on("click", (e) => {
        var clicked = $(e.currentTarget).prop("id")
        var graph_menu = $("#movie-trend");
        var mow_menu = $("#movie-of-week");
        var overview_menu = $("#movie-overview")
        
        graph_menu.removeClass("active-menu")
        mow_menu.removeClass("active-menu")
        overview_menu.removeClass("active-menu")
        $("div").remove(".week-entry-div"); //reset weekly movie rows
        $("#search-div").css({ "display": "flex" })
        menu_div.css({"justify-content" : "space-around"})
        
        currMenu.css({ "display": "none" })

        if (clicked == "movie-overview") {
            overview_menu.addClass("active-menu")
            currMenu = overview_div
            loading_screen(draw_overview, currQuery);
        }
        else if (clicked == "movie-trend") {
            graph_menu.addClass("active-menu")
            currMenu = graph_div
            loading_screen(draw, currQuery);
        }
        else if (clicked == "movie-of-week") {
            mow_menu.addClass("active-menu")
            $("#search-div").css({ "display": "none" })
            menu_div.css({"justify-content" : "space-between"})
            currMenu = mow_div
            loading_screen(draw_week_movies)
        }

        currMenu.css({ "display": "flex" });
    })

    $("body").on('click', (e) =>
    {
        if (!($(e.target).is("#search-bar") || $(e.target).is("#search-suggestion-list")))
        {
            $("#search-suggestion-list").empty();
            $("#search-suggestion-list").css({ "display": "none" })
        }

        if (!(($(e.target).is("#sidebar-div")) || ($(e.target).is("#hamburger-circle")) || ($(e.target).is("#hamburger-div")) || ($(e.target).is("#hamburger-circle > span"))) && $("#hamburger-circle").hasClass("is-active"))
        {
            $("#hamburger-circle").click();
        }
    })

    $("#to-trend-btn").on("click", () =>
    {
        $("#movie-overview").removeClass("active-menu")
        $("#movie-trend").addClass("active-menu")
        currMenu.css({ "display": "none" })
        currMenu = graph_div
        loading_screen(draw, currQuery);
        currMenu.css({ "display": "flex" });
    })
});
