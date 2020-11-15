const jwt = require('jsonwebtoken')


const jwtVerify = (req,res,next) => {
    const token = req.query.id
    if(!token) return res.json({error : true ,message : "Token not found"})
    jwt.verify(token , '123abc' , (err,token) => {
        try {
            if(err) throw err
            req.token = token
            next()
        } catch (error) {
            res.json({
                error : true,
                message : error.message,
                detail : error
            })
        }
    })
}

module.exports = jwtVerify