const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./model/User');
const Post = require('./model/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cookiesParser = require('cookie-parser'); 
const multer = require('multer');
const uploadMiddleware = multer({dest: 'upload/'});
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = 'asdawrsgcx4re2345234wedfgdsfwrqadd';

app.use(cors({credentials:true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookiesParser());
app.use('/upload', express.static(__dirname + '/upload'));


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
            res.cookie('token', token).json({
                id:userDoc._id,
                username,
            });
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
});


// Create NewPost
app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    const {originalname, path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    const newPath = path + '.' + ext;
    fs.renameSync(path, newPath);

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
        if(err) throw err;
        const {title, summary, content} = req.body;
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover: newPath,
            author: info.id,
        });    
        res.json(postDoc);
    });
});


app.get('/post', async (req,res) => {
    res.json(await Post.find()
    .populate('author',['username'])
    .sort({createdAt: -1})
    .limit(20));   
});


app.get('/post/:id',async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
})


app.listen(4000);
