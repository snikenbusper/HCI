class Trend
{
    constructor()
    {
        this.geo = new Geo()
        this.time_data = JSON.parse(time_data)
        this.all_movies = Object.keys(this.time_data).sort()
        this.all_movies_lowercase = this.all_movies.map(s => { return s.toLowerCase() })
        this.geo_data = this.geo.country_names
    }

    get_interest_over_time(movie)
    {
        var obj = this.time_data[movie]
        var res = Object.entries(obj)
        res = res.filter((d) => { return new Date(parseInt(d[0])) >= new Date('2023-01-01') })
        res.forEach((d) => { d[0] = new Date(parseInt(d[0])) })
        return res
    }

    movie_exists(movie)
    {
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

    async get_all()
    {
        var res = []

        for (let i = 0; i < this.all_movies.length; i++)
        {
            var temp = {}

            const url = "https://www.omdbapi.com/?apikey=7f65a9b3&t=" + this.all_movies[i]
            const options =
            {   
                    methodP:'GET'
            }
            
            try {
                const response = await fetch(url, options)
                const result = await response.text()
                var parsed_res = JSON.parse(result)
            } catch (error)
            {
                alert("Something went wrong when getting movie data")
                continue;
            }

            temp["title"] = parsed_res["Title"]
            temp["poster"] = parsed_res["Poster"]
            temp["rating"] = parsed_res["imdbRating"]
            res.push(temp);
        }

        return res;
    }

    async get_movie_overview(movie)
    {
        //http://www.omdbapi.com/?apikey=[yourkey]&
        const url = "https://www.omdbapi.com/?apikey=7f65a9b3&t=" + movie
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
            alert("Something went wrong when getting movie data")
        }

    }

    async get_curr_movies()
    {

        //951a8b8fcamsh0576953f6630afbp158694jsnad91e8ccfebd
        //spare key
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

    async get_news(amnt)
    {
        const url = 'https://moviesverse1.p.rapidapi.com/get-movie-news';
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
            const res = JSON.parse(result);
            return res["news"].slice(0, amnt)
        } catch (error) {
            alert("Problem getting news")
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