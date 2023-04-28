const express = require('express')
const bodyparser = require('body-parser')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const user = require('./models/schema.js')
const app = express()
require('./db/conn.js')

app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json())

const port = 3000;

app.get('/', (req, res) =>{
    res.send("HELLO")
})

app.post('/register', async(req, res)=>{
    try{
        const { username, email, password, confirmpassword } = req.body;
        const salt = await bcrypt.genSalt();
        const passhash = await bcrypt.hash(req.body.password, salt);
        const conpasshash = await bcrypt.hash(req.body.confirmpassword, salt);
        console.log(username, email, password, confirmpassword);
        console.log(username, email, password, confirmpassword );
        if(password===confirmpassword){
            const userr = await user.create({
                username,
                email: email.toLowerCase(),
                password: passhash,
                confirmpassword: conpasshash,
            });

            const token = jwt.sign(
                {email: user.email, userid: user._id},
                "RANDOM-TOKEN",
                {expiresIn: "24h"}
            );

            userr.token = token;

            // console.log(userr);
            console.log(token);
            res.status(200).json({
            msg:"registered",
            user: userr,
            })
        }
        else{
            res.status(500).json({
                msg: "incorrect confirm password"
            })
        }
        
    }   catch(error){
        console.log(error)
        res.status(500).json({
            msg: "not registered",
        })
    }
})

app.post('/signin', async(req, res)=>{
    try{
        console.log(req.body);
        const found = await user.findOne({email: req.body.email})
        console.log(found.password);
        if(found){
            const confirm = await bcrypt.compareSync(req.body.password, found.password)
            console.log(confirm);
            if(confirm){

                const token = jwt.sign(
                    {email: found.email, userid: found._id},
                    "RANDOM-TOKEN",
                    {expiresIn: "24h"}
                );
    
                found.token = token;

                res.status(200).json({
                    msg: "logged in",
                    data: found
                })
            }
            else{
                res.status(500).json({
                    msg: "incorrect password"
                })
            }
        }
        else{
            res.status(500).json({
                msg: "account doesn't exist"
            })
        }
    }   catch(error){
        console.log(error);
        res.status(500).json({
            msg: "account doesn't exist"
        })
    }   
})

app.get('/welcome', async(req, res)=>{
    try{
        const token = req.body.token;
        if(token){
            const decoded = jwt.verify(token, "RANDOM-TOKEN")
            res.status(200).json({
                dec: decoded,
                login: true
            })  
        }
        else{
            res.status(500).json({
                msg: "Token required for authentication",
                login: false
            })
        }
    }   catch(error){
        res.status(500).json({
            msg: "not welcome"
        })
    }
})

app.get('/user/:id', async(req, res)=>{
    try{
        const id = req.params.id;
        const finduser = await user.findById(id);
        res.status(200).json({
            msg: "user found",
            data: finduser,
        })
    }   catch(error){
        res.status(500).json({
            msg: "not found"
        })
    }
})


app.listen(port, function(){
    console.log(`Server running at http://localhost:${port}`)
})