// import required packages
const express = require('express');
const path = require('path');
const axios = require('axios');

let api;

// express object
const router = express();

// Setting template engine and serving static files
router.set('views', path.join(__dirname, 'views'));
router.set('view engine','ejs');
router.use(express.static(path.join(__dirname, 'public')));

// Body Parser
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// endpoints
router.get('/',(eq,res) => {
    res.render('index');
});

router.get('/search',(req,res) =>{
    res.render('user');
});

router.get('/result',(req,res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;
  if(lat !== undefined && lon !== undefined){
      onSuccess(lat,lon,req,res);
  }
  else{
      console.log('undefined');
  }
});

// Calls api based on latitude and longitude
function onSuccess(lat,lon,req,res){
    const latitude = lat;
    const longitude = lon;
    api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=51037b79a5e01469c1f1ea624d394c1e`;
    fetchData(req,res);
}

// fetches the json from open weather api
function fetchData(req,res){
    (async () => {
        try {
          const response = await axios.get(api)
          weatherDetails(response.data,req,res);
        } catch (error) {
          console.log(error);
        }
      })();
}

// Extracts The important details from the json 
function weatherDetails(info,req,res){
    if(info.cod == "404"){
        console.log('error');
    }else{
        const city = info.name;
        const {country} = info.sys;
        var sunrise = info.sys.sunrise;
        var sunset = info.sys.sunset;
        sunrise = unixDecode(sunrise);
        sunset = unixDecode(sunset);
        const visibility = info.visibility;
        const {description, id,main} = info.weather[0];
        const {temp, feels_like, humidity,temp_min,temp_max} = info.main;
        const wind = info.wind.speed;
        const d = new Date();
        const month = d.getMonth() + 1;	  // Month	    [mm]	(1 - 12)
        const day  =  d.getDate();		  // Day		[dd]	(1 - 31)
        const year =  d.getFullYear();	  // Year		[yyyy]
        const fullDate =  day + '-' + month + '-' + year;
        const dayName = getDay();
        const data = {
            city,
            country,
            temp,
            fullDate,
            dayName,
            temp_max,
            temp_min,
            humidity,
            wind,
            main,
            sunrise,
            sunset,
            visibility
        };
        res.render('result',{
            data:data 
        });
        
    }

}

// Returns the day name 
function getDay(){
    const arr = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const d = new Date();
    return arr[d.getDay()];
      
}

// Decodes the unix style time stamp in 24-hr format time
function unixDecode(timestamp){
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(timestamp * 1000);
    // Hours part from the timestamp
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();
    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // display time in hh:mm:ss format
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    return formattedTime;
    //console.log(formattedTime);
}


// Testing Purpose
router.listen(3000,(req,res) => {
    console.log("Listening on port 3000");
});