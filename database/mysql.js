const mysql = require('mysql')

const db = mysql.createConnection({
    user : "root",
    password : 'Ahmadansorudin77',
    port :3306,
    database : "hoteloka"
})


module.exports = db