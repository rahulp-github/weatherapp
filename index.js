// import required packages
const express = require('express');
const path = require('path');

// express object
const router = express();

// Setting template engine and serving static files
router.set('views', path.join(__dirname, '/views'));
router.set('view engine','ejs');
router.use(express.static(path.join(__dirname, 'public')));

// endpoints
router.get('/',(req,res) => {
    res.render('index');
});

router.get('/search',(req,res) => {
    res.render('user');
});

router.get('/result',(req,res) => {
    res.render('result');
});

// Testing Purpose
router.listen(3000,(req,res) => {
    console.log("Listening on port 3000");
});