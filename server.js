require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const MOVIES = require('./MOVIES.json');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev';
app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet());

function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    next();
}

app.use(validateBearerToken);

function handleGetMovies(req, res) {
    let response = MOVIES;

    const { genre, country, avg_vote } = req.query;

    if (genre) {
        response = response.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()))
    }

    if (country) {
        response = response.filter(movie => movie.country.toLowerCase().includes(country.toLowerCase()))
    }

    const avg_vote_number = Number(avg_vote);

    if (avg_vote) {
        if (Number.isNaN(avg_vote_number)) {
            res.status(400).json({ error: 'avg_vote should be a number' })
        } else {
            response = response.filter(movie => Number(movie.avg_vote) >= avg_vote_number)
        }
    }
    
    res.send(response)
}

app.get('/movie', handleGetMovies)

app.use((error, req, res, next) => {
    let response;
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000;

app.listen(PORT)