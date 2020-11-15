const { getAllHotels, getHotelById, getRoomById, getMostVisited, getPupularLocation, onUpdateAvatar } = require('../controllers/hotelsController')
const jwtVerify = require('../middleware/jwt')
const Router = require('express').Router()

Router.get('/',getAllHotels)
Router.get('/detail/:id',getHotelById)
Router.get('/detail/room/:id',getRoomById)
Router.get('/visited',getMostVisited)
Router.get('/location',getPupularLocation)
Router.post('/edit-avatar',jwtVerify,onUpdateAvatar)

module.exports = Router