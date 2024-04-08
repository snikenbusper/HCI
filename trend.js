class Trend
{
    constructor()
    {
        this.geo = new Geo()
        this.time_data = JSON.parse(time_data)
        this.all_movies = Object.keys(this.time_data)
        this.all_movies_lowercase = this.all_movies.map(s => { return s.toLowerCase() })
        this.geo_data = this.geo.country_names
    }

    get_interest_over_time(movie)
    {
        var obj = this.time_data[movie]
        var res = Object.entries(obj)
        res.forEach((d) => {d[0] = new Date(parseInt(d[0]))})
        return res
    }

    movie_exists(movie)
    {
        console.log(movie.toLowerCase())
        return this.all_movies_lowercase.includes(movie.toLowerCase())
    }

    match_string(string)
    {
        return trend.all_movies.filter(x => x.toLowerCase().startsWith(string.toLowerCase())).slice(0, 5)
    }

    get_geo(movie)
    {
        return this.geo.search_movie(movie) 
    }
}