const query = require('./../database/mysqlAsync')
const db = require('./../database/mysql')
const upload = require('./../helpers/uploadSinggle')()
const fs = require('fs')

module.exports = {
    getAllHotels : (req,res) => {
        let location = req.query.location
        let startDate = req.query.startDate
        let endDate = req.query.endDate
        console.log(location)

        db.query(`select lh.city as location, h.id,h.name, min(r.price) as price,address, phone,star,hi.url from hotels h 
        join rooms r on h.id = r.hotels_id
        join hotel_images hi on hi.hotels_id = h.id 
        join location_hotel lh on lh.id = h.location_id
        where h.id in(
        select hotels_id from rooms where id in(
        select get_id_room_avail(?,?,id,room_counts) from rooms)) and location = ? GROUP BY h.name;`,[startDate,endDate,location],(err,result) => {
            
            try {
                if(err) throw err
                if(result.length === 0) throw {message : 'location not found'}
                res.send({
                    error: false,
                    data : result
                })
            } catch (error) {
                res.send({
                    error: true,
                    message : error.message
                })
            }
        })
        
    }
    ,getRoomById : (req, res) => {
        let id = req.params.id

        db.query(`select * from room_images where rooms_id = (select id from rooms where id = ?);`, id, (err, result) => {
            try {
                if(err) throw err
                res.send({
                    error: false,
                    data : result
                })
            } catch (error) {
                res.send({
                    error: true,
                    message : error.message
                })
            }
        })
    },
    getHotelById : async (req, res) => {
        let id = req.params.id
        const startDate = req.query.startDate
        const endDate = req.query.endDate

        let queryRooms = 'SELECT r.id,r.name, guest_count,price,hotels_id, GROUP_CONCAT(DISTINCT(ri.url)) as room_image, get_room_available(?,?,r.id,room_counts) as room_left FROM rooms r JOIN room_images ri on r.id = ri.rooms_id WHERE hotels_id = ? GROUP BY rooms_id;'
        let queryFacilities = 'SELECT facilities_id,name,icon FROM hotels_has_facilities h JOIN facilities f ON h.facilities_id = f.id WHERE h.hotels_id = ?;'
        let queryHotelImages = 'SELECT * FROM hotel_images WHERE hotels_id = ?;'
        let queryHotelsData = 'select * from hotels where id = ?'

        try {
            let hotelsData = await query(queryHotelsData, id)
            let facilities = await query(queryFacilities, id)
            let rooms = await query(queryRooms,[startDate,endDate, id])
            let hotelImages = await query(queryHotelImages, id)

            res.send({
                error : false,
                hotels : hotelsData[0],
                facilities : facilities,
                rooms : rooms,
                hotelImages : hotelImages
            })

        } catch (error) {
            res.send({
                error: true,
                message : error.message
            })
        }
    },
    getMostVisited : async (req, res) => {
        let queryGetVisited = `select h.id, name, lh.city as location, visited, hi.url from hotels h
        join location_hotel lh on lh.id = h.location_id
        join hotel_images hi on hi.hotels_id = h.id
        group by h.id order by h.visited DESC limit 5`

        try {
            let dataVisited = await query(queryGetVisited)
            res.send({
                error : false,
                mostVisited : dataVisited
            })
        } catch (error) {
            res.send({
                error: true,
                message : error.message
            })
        }
    },
    getPupularLocation : async (req, res) => {
        let queryPopularLocation = `select lh.city as location, lh.image as image_location,avg(r.price) as price from hotels h
        join location_hotel lh on lh.id = h.location_id
        join rooms r on r.hotels_id = h.id 
        group by location;`

        try {
            let locationPopular = await query(queryPopularLocation)
            res.send({
                error : false,
                location : locationPopular
            })
        } catch (error) {
            res.send({
                error: true,
                message : error.message
            })
        }
    },
    onUpdateAvatar : (req, res) => {
        let token = req.token
        let users_id = token.id

        upload(req,res,(err) => {
            try {
                console.log(req.file)
                if(err) throw err
                // req.bebas for filtering file
                if(req.bebas) throw req.bebas
                if(req.file === undefined) throw "File Not Found"

                // get Image Path
                var imagePath = 'http://localhost:4000/' + req.file.path

                db.query('update users set avatar = ? where id = ?', [imagePath, users_id], (err, result) => {
                    try {
                        if(err) throw err
                        res.send({
                            error : false,
                            message : 'update avatar succes'
                        })
                    } catch (error) {
                        fs.unlinkSync(req.file)
                        console.log(error)
                    }
                })

            } catch (error) {
                console.log(error)
            }
        })
    }

}