const express = require('express');
const AuthRouter = require('./routers/authRouter')
const HotelRouter = require('./routers/hotelsRouter')
const transactionsRouter = require('./routers/transactionsRouter')
const LoggingApi = require('./middleware/loggingApi')
const cors = require('cors');


const app = express()
app.use(express.json())
const PORT = 4000

app.use(cors())

app.get('/' , (req,res) => {
    res.send("Hello hoteloka")
})

app.use('/public', express.static('public'))

app.use(LoggingApi)
app.use('/auth',AuthRouter)
app.use('/hotels',HotelRouter)
app.use('/transaction',transactionsRouter)

app.listen(PORT , () => console.log('API RUNNING ON PORT ' + PORT))





