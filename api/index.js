const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./model/User');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookiesParser = require('cookie-parser'); 

const salt = bcrypt.genSaltSync(10);
const secret = 'asdawrsgcx4re2345234wedfgdsfwrqadd';

app.use(cors({credentials:true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookiesParser());


mongoose.connect('mongodb+srv://blog:nguyenminhtri@cluster0.oj4pkds.mongodb.net');


// Register
app.post('/register' , async (req, res) => {
    const {username, password} = req.body;
    try {
        const userDoc = await User.create({
            username,
            password:bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    } catch (e) {
        res.status(400).json(e);
    }
});



// Login
app.post('/login',async (req, res) => {
    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if(passOk) {
        // logged in
        jwt.sign({username, id:userDoc._id}, secret, {}, (err, token) => {
            if(err) throw err;
            res.cookie('token', token).json('ok');
        });
    } else {
        res.status(400).json('Wrong credentials');
    }
});


// Profile 
app.get('/profile', (req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, (err,info) => {
        if(err) throw err;
        res.json(info);
    });
});


// Logout
app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
})




app.listen(4000);
