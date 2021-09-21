// import required packages
const express = require('express');
const path = require('path');
const axios = require('axios');

// Global Variable
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
  // Parse the longitude and latitude from the url bar
  const lat = req.query.lat;
  const lon = req.query.lon;

  if(lat !== undefined && lon !== undefined){
      onSuccess(lat,lon,req,res);
  }
  else{
      console.log('Error');
  }
});


// Calls api based on latitude and longitude
function onSuccess(lat,lon,req,res){
    const latitude = lat;
    const longitude = lon;
    api = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=d1bc0fcd14e6a0ee9cd81e89b686cd7f`;
    fetchData(req,res);
}

// fetches the json from open weather api
function fetchData(req,res){
    (async () => {
        try {
          const response = await axios.get(api);
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
        // City Name
        const city = info.city.name;
        // Country Code
        const country = info.city.country;
        // Sunrise in unix format
        var sunrise = info.city.sunrise;
        // Sunset in unix format
        var sunset = info.city.sunset;
        // Decoding unix to standard format
        sunrise = unixDecode(sunrise);
        sunset = unixDecode(sunset);
        // Visibility
        const visibility = info.list[0].visibility;
        // Temperature,temp_max,humidity
        const {temp,temp_max,humidity} = info.list[0].main;
        // Wind Speed
        const wind = info.list[0].wind.speed;
        // Short Description
        const description = info.list[0].weather[0].description;
        const d = new Date();
        const month = d.getMonth() + 1;	  // Month	    [mm]	(1 - 12)
        const day  =  d.getDate();		  // Day		[dd]	(1 - 31)
        const year =  d.getFullYear();	  // Year		[yyyy]
        const fullDate =  day + '-' + month + '-' + year;
        // Get the day Name 
        const dayName = getDay();
        // info.list contains an array of 5 day forecast
        const forecast = info.list;
        // Packing all the extracted data into json 
        const data = {
            city,
            country,
            temp,
            fullDate,
            dayName,
            temp_max,
            humidity,
            wind,
            sunrise,
            sunset,
            visibility,
            description,
            forecast
            
        };
        // Send the data to result page
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