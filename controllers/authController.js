const hashPassword = require('./../helpers/hash')
const db = require('./../database/mysql')
const validator = require("validator")
const transporter = require('./../helpers/transporter')
const jwt = require('jsonwebtoken')
const handlebars = require('handlebars')
const fs = require('fs')



const RegisterController = (req,res) => {
     // Get all data value
     const data = req.body // {email,password}
 
     try {
         // validasi data
         if( !data.email || !data.password) throw "Data not complete"
         if(!(validator.isEmail(data.email))) throw "Email format wrong"
         if(data.password.length < 8) throw "password too short (min 8 char)"
 
         // hash password
         const passwordHashed = hashPassword(data.password)
         data.password = passwordHashed
 
 
         // store data to db
         db.query('select * from users where email = ?',data.email ,(err,result) => {
             try {
                 if(err) throw err
                 if(result.length === 0){
                     db.query('insert into users set ?' , data , (err,respInsert) => {
                         try {
                             if(err) throw err
                            //  console.log(result)
                             
                             fs.readFile('/Users/macbookpro/Documents/Purwadhika/React-Native/erbenbe/bekend/hoteloka-backend/template/emailConfirmation.html',{encoding : 'utf-8'},(err,file) => {
                                    if(err) throw err
                                    const template = handlebars.compile(file)
                                    const hasilTemplating = template({email : data.email , link :"http://localhost:3000/verification/" + respInsert.insertId + '/' + passwordHashed , text1 : "ini merupakan deskripsi teks 1",text2 : "ini merupakan deskripsi teks 2"})
                                    transporter.sendMail({
                                        from : "Admin Sporteens",
                                        subject : "Email Verification Sporteens",
                                        to : data.email,
                                        html : hasilTemplating
                                    })
                                    .then((respons) => {
                                        jwt.sign({id : respInsert.insertId},'123abc',(err,token) => {
                                            try {
                                                if(err) throw err
                                                res.send({
                                                    error: false,
                                                    message : "register success",
                                                    token
                                                })
                                            } catch (error) {
                                                res.send({
                                                    error: true,
                                                    message : err.message
                                                })
                                            }
                                        })
                                    })
                                    .catch((err) => {
                                        res.send({
                                            error: true,
                                            message : err.message
                                        })
                                    })
                                
                            })

 
 
 
                             // send email
 
             
                         } catch (error) {
                             res.send({
                                 error : true,
                                 message : error.message
                             })
                         }
                     })
                 }else{
                     res.send({
                         error : true,
                         message : "Email already been registered"
                     })
                 }
             } catch (error) {
                 res.send({
                     error : true,
                     message : error.message
                 })
             }
         })

         
 
 
 
     } catch (error) {
         res.send({
             error : true,
             message : error
         })
     }
 
 
     // hash password data
     // store data ke db
     // kirim email
}


const LoginController = (req,res) => {
    // get data from users {email & password}
    const data = req.body

    // password hash
    const passwordHashed = hashPassword(data.password)

    // baru query
    db.query('select * from users where email = ? and password = ?;' ,[data.email,passwordHashed], (err,result) => {
        try {
            if(err) throw err
            if(result.length ===0){
                res.send({
                    error : true,
                    message : "Password or email invalid"
                })
            }else{

                jwt.sign({id : result[0].id} , '123abc' , (err,token) => {
                    try {
                        if(err) throw err
                        res.send({
                            error : false,
                            message : "login success",
                            token
                        })

                    } catch (error) {
                        res.json({
                            error : true,
                            message : error
                        })
                    }
                })

            }

        } catch (error) {
            res.send({
                error : true,
                message : error.message
            })
        }
    })
}

const UserEmailVerificationController = (req,res) => {
    const data = req.body // {id,password}
    db.query('update users set is_email_confirmed = 1 where id = ? and password = ?;',[data.id,data.password],(err,result) => {
        try {
            if(err) throw err
            res.status(201).send({
                error : false,
                message : "user email verified"
            })
        } catch (error) {
            res.status(500).send({
                error : true,
                message : error
            })
        }
    })
}

const isUserVerify = (req,res) => {
    const data = req.bebas
    db.query('select * from users where id = ?', data.id , (err,result) => {
        try {
            if(err) throw err
            res.json({error : false, is_verified : result[0].is_email_confirmed})
        } catch (error) {
            res.json({error : true,message :error.message,detail : error})
        }
    })
}



module.exports = {
    register : RegisterController,
    login : LoginController,
    verification : UserEmailVerificationController,
    isUserVerify
}


// send email flow
    // register user to db
    // read html file with fs
    // replace variable in html {{}} with handlebars
    // send handlebars result to nodemailer




// login ==> token ==> id,email,is_email_confirmed
// verifikasi email

    

