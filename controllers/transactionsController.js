const { response } = require('express')
const query = require('./../database/mysqlAsync')
const db = require('./../database/mysql')
const moment = require('moment')
const sendNotification = require('../helpers/sendNotif')
const redis = require('./../database/redis')

module.exports = {
    createTransactions : async (req, res) => {
        let findUser = 'select * from users where id = ?'
        let insertTransactions = 'insert into transactions set ?'
        let findTransactions = 'select * from transactions where id = ?'

        let data = req.body  // {begin_book_date, end_book_date, rooms_id, users_id}
        let token = req.token
        data.users_id = token.id
        let redisKey = 'transactions_user_id' + token.id

        try {

            if(data.begin_book_date && data.rooms_id && data.price && data.hotel_name && data.hotel_room){
                
                await query('START TRANSACTION')
                const dataUser = await query(findUser, token.id)
                .catch(error => {
                throw error
                })
                data.email_buyer = dataUser[0].email
                
                const result = await query(insertTransactions, data)
                .catch(error => {
                    throw error
                })
                
                const findTrans = await query(findTransactions, result.insertId)
                .catch(error => {
                    throw error
                })
                
                let formated = moment(findTrans[0].expired_at).format()
                const createdEvent = await query(`CREATE EVENT auto_cancel_transaction_${result.insertId} ON SCHEDULE AT '${formated}' DO update transactions set status = 'failed' where id = ${result.insertId};`)
                .catch(error => {
                    throw error
                })
    
                await query("COMMIT");

                redis.del(redisKey, (err, ok) => {
                    if(err) throw err
                    res.send({
                        error : false,
                        message : 'Transaction Succes'
                    })
                })
            }else{
                res.send({
                    error : true,
                    message : 'data not complete'
                })
            }
            
        } catch (error) {
            await query("ROLLBACK");
            console.log('ROLLBACK gagal insert');
            res.send({
                error: true,
                message : error.message
            })
        }
    },
    getDataTransactions : async(req, res) => {
        let token = req.token
        let users_id = token.id
        let queryGetTransaction = `select status, h.address ,t.id, t.users_id ,created_at, begin_book_date, end_book_date , hotel_name, hotel_room, r.name, group_concat(distinct(hi.url)) as hotel_images  from transactions t
        join rooms r on r.id = t.rooms_id
        join hotel_images hi on hi.hotels_id = r.hotels_id
        join hotels h on h.id = r.hotels_id
        where t.users_id = ? and status <> 'failed' 
        group by t.id;`

        try {
            if(token.id){
                const dataTransactions = await query(queryGetTransaction, users_id)

                res.send({
                    error : false,
                    dataTransactions : dataTransactions
                })
            }else{
                res.send({
                    error : true,
                    message : 'token not null'
                })
            }
        } catch (error) {
            res.send({
                error: true,
                message : error.message
            })
        }
    },
    getDataTransactionsById : async(req, res) => {
        let id = req.params.id
        let queryTransactionId = `select t.id, h.address, h.location ,t.users_id ,created_at, begin_book_date, end_book_date ,t.price, hotel_name, hotel_room, group_concat(distinct(hi.url)) as hotel_images  from transactions t
        join rooms r on r.id = t.rooms_id
        join hotel_images hi on hi.hotels_id = r.hotels_id
        join hotels h on h.id = r.hotels_id
        where t.id = ?;`

        try {
            if(id){
                const dataTransactionById = await query(queryTransactionId, id)
                dataTransactionById[0].hotel_images = dataTransactionById[0].hotel_images.split(',')
                res.send({
                    error : false,
                    dataTransactionById
                })
            }else{
                res.send({
                    error : true,
                    message : 'id not null'
                })
            }
        } catch (error) {
            res.send({
                error: true,
                message : error.message
            })
        }
    },
    getTransactionFailed : async(req, res) => {
        let token = req.token
        let users_id = token.id
        let queryTransactionFailed = `select hotel_name, begin_book_date, end_book_date, url, status, t.id  from transactions t
        join rooms r on r.id = t.rooms_id
        join hotel_images hi on hi.hotels_id = r.hotels_id
        where t.users_id = ? and t.status = 'failed'
        group by t.id;`

        try {
            if(users_id){
                const dataFailed = await query(queryTransactionFailed, users_id)
                res.send({
                    error : false,
                    dataFailed
                })
            }else{
                res.send({
                    error : true,
                    message : 'id not null'
                })
            }
        } catch (error) {
            res.send({
                error: true,
                message : error.message
            })
        }

    },
    paymentApproved : (req, res) => {
        let token = req.token
        let users_id = token.id
        let data = req.body

        db.query('update transactions set status = "succes" where id = ? and users_id = ?', [data.id, users_id], (err, result) => {
            try {
                if(err) throw err

                db.query(`drop event auto_cancel_transaction_${data.id}`, (err, result) => {
                    try {
                        if(err) throw err

                        let dataNotif ={
                            app_id: "5440b917-b5c5-4f43-81a9-63693ce6fa96",
                            contents: {"en": "huehuehuehue"},
                            channel_for_external_user_ids: "push",
                            include_external_user_ids: [users_id]
                        }
                        sendNotification(dataNotif,res)
                    } catch (error) {
                        console.log(error)
                    }
                })
            } catch (error) {
                console.log(error)
            }
        } )
    }, 
    getTransactionAll : (req, res) => {
        var start = Date.now()

        // chek data transactions dari redis terlebih dahulu
        redis.get('all_transactions', (err, redisData) => {
            try {
                if(err) throw err
                // jika data trx di redis ada maka return ke fe data dari redis
                if(redisData){
                    var end = Date.now()
                    var resTime = end - start
                    var redisParsed = JSON.parse(redisData)
                    res.send({
                        resTime,
                        redisParsed
                    })
                // jika di redis tida ada maka ambil ke database dan simpan data nya di redis
                }else{
                    db.query('select * from transactions', (err, result) => {
                        try {
                            if (err) throw err
                            var end = Date.now()
            
                            // simpan hasil query ke redis
                            var resultString = JSON.stringify(result)
                            redis.set('all_transactions', resultString, (err, ok) => {

                                // jika berhasil ke simpan di redis balikin ke fe data result nya
                                try {
                                    if(err) throw err
                                    var resTime = end - start
                                    res.send({
                                        resTime,
                                        result
                                    })
                                } catch (error) {
                                    console.log(error)
                                }
                            })
                        } catch (error) {
                            console.log(error)
                        }
                    })
                }
            } catch (error) {
                console.log(error)
            }
        })
    },
    getTransactionByIdUser : (req, res) => {
        let idUser = req.params.idUser
        let redisKey = 'transactions_user_id' + idUser

        redis.get(redisKey, (err, redisData) => {
            try {
                if(err) throw err
                if(redisData){
                    res.send({
                        redis : JSON.parse(redisData)
                    })
                }else{
                    db.query('select * from transactions where users_id = ?', idUser, (err, result) => {
                        try {
                            if(err) throw err
                            redis.set(redisKey, JSON.stringify(result), (err, ok) => {
                                try {
                                    if(err) throw err
                                    res.send({
                                        db : result
                                    })
                                } catch (error) {
                                    console.log(error)
                                }
                            })
                        } catch (error) {
                            console.log(error)
                        }
                    })
                }
            } catch (error) {
                console.log(error)
            }
        })
    }


}