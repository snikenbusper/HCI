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

    async get_movie_overview(movie)
    {
        //http://www.omdbapi.com/?apikey=[yourkey]&
        const url = "http://www.omdbapi.com/?apikey=7f65a9b3&t=" + movie
        const options =
            {   
                methodP:'GET'
        }
        
        try {
            const response = await fetch(url, options)
            const result = await response.text()
            const res = JSON.parse(result)
            console.log(res)
            return res;
        } catch (error)
        {
            console.log(error)
            alert("Something went wrong when getting movie data")
        }

    }

    async get_curr_movies()
    {
        const url = 'https://moviesverse1.p.rapidapi.com/top-box-office';
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': 'f6919426dfmshe6742c4699ee369p1753a1jsn489031a4b128',
                'X-RapidAPI-Host': 'moviesverse1.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            const result = await response.text();
            this.current_showing = JSON.parse(result);
        } catch (error) {
            alert("Problem getting recent movies")
        }
    }

    get_top_week(top_x)
    {
        var movies = this.current_showing.movies
        movies.sort((a, b) => { return parseFloat(b.imdbRating.split(' ')[0]) - parseFloat(a.imdbRating.split(' ')[0]) })
        return movies.slice(0, top_x)
    }

    get_worst_week(top_x)
    {
        var movies = this.current_showing.movies
        movies.sort((a, b) => { return parseFloat(a.imdbRating.split(' ')[0]) - parseFloat(b.imdbRating.split(' ')[0]) })
        return movies.slice(0, top_x)
    }

    

}