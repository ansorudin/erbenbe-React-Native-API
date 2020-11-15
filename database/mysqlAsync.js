const util = require('util')
const mysql = require('mysql')

const db = mysql.createConnection({
    user : "root",
    password : 'Ahmadansorudin77',
    port :3306,
    database : "hoteloka"
})

const query = util.promisify(db.query).bind(db)

module.exports = query