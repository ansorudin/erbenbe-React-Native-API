const { createTransactions, getDataTransactions, getDataTransactionsById, getTransactionFailed, paymentApproved, getTransactionAll, getTransactionByIdUser } = require('../controllers/transactionsController')
const jwtVerify = require('../middleware/jwt')
const Router = require('express').Router()

Router.post('/',jwtVerify ,createTransactions)
Router.get('/',jwtVerify ,getDataTransactions)
Router.get('/by-id/:id',getDataTransactionsById)
Router.get('/failed',jwtVerify,getTransactionFailed)
Router.post('/payment',jwtVerify,paymentApproved)
Router.get('/all', getTransactionAll)
Router.get('/id-user/:idUser', getTransactionByIdUser)

module.exports = Router