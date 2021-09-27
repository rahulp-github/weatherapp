// import required packages
const express = require('express');
const path = require('path');
const axios = require('axios');
const session = require('express-session');
const flash = require('connect-flash');
const spawn = require('child_process').spawn;
// Global Variable
let api;
const PORT = process.env.PORT || 3000;

// Python Code
function python(){
    let num1 = 10;
    let num2 = 20;
    const pythonProcess = spawn('python',["main.py", num1, num2]);
    pythonProcess.stdout.on('data', (data) => {
        console.log("Addition is : ",data.toString());
    });
}

// express object
const router = express();

// Setting template engine and serving static files
router.set('views', path.join(__dirname, 'views'));
router.set('view engine','ejs');
router.use(express.static(path.join(__dirname, 'public')));

// Body Parser
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

// Express Session Middleware
router.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

router.use(flash());

// Global variable - Store  error messages 
router.use((req, res, next) => {
    res.locals.error = req.flash('error');
    next();
});


// endpoints

router.get('/',(eq,res) => {
    res.render('index');
});

router.get('/search',(req,res) =>{
    res.render('user');
});

router.get('/result',(req,res) => {
   // python();
  // Parse the longitude and latitude from the url bar
  const lat = req.query.lat;
  const lon = req.query.lon;
  // Parse city from url bar
  const city = req.query.city;
  //console.log(lat,lon,city);
  if(lat !== undefined && lon !== undefined){
      useLatLon(lat,lon,req,res);
  }
  else if(city !== undefined){
      useCity(city,req,res);
  }
  else{
      console.log('Error');
  }
});


// Calls api based on latitude and longitude
function useLatLon(lat,lon,req,res){
    const latitude = lat;
    const longitude = lon;
    api = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=d1bc0fcd14e6a0ee9cd81e89b686cd7f`;
    fetchData(req,res);
}

function useCity(city,req,res){
    api = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=d1bc0fcd14e6a0ee9cd81e89b686cd7f`;
    fetchData(req,res);
}

// fetches the json from open weather api
function fetchData(req,res){
    (async () => {
        try {
          const response = await axios.get(api);
          check(response.data,req,res);
        } catch (error) {
            req.flash('error','Entered City isnt valid city name');
            res.redirect('/search');
        }
      })();
}

// Checks to integrate ml code or not
function check(info,req,res){
    if(info.cod == "404"){
        console.log("Not Found");
    }else{
        const country = info.city.country;

        // If country is India integrate ML Code

        if(country === "IN"){
             callPython().then(data => {
                getDetails(req,res,info,data);
            }).catch(error => {
                console.log(error);
            });
        }
        else{
            getDetails(req,res,info,false);
        }
      
        
    }

}

// get Details From Api
function getDetails(req,res,info,mlAvgTemp){
    var avgTemp;
     if(mlAvgTemp){
         avgTemp = mlAvgTemp.toString();
        avgTemp = avgTemp.replace('[','');
        avgTemp = avgTemp.replace(']','');
     }
     else{
         avgTemp = false;
     }
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
     // Icon selection id
     const iconId = info.list[0].weather[0].id;
     // Get The Icon Path
     const iconPath = icon(iconId);
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
         forecast,
         iconPath,
         avgTemp
         
     };
     // Send the data to result page
     res.render('result',{
         data:data 
     });
     
 
}

 // Function which returns the path of icon based on weather conditions
 function icon(iconId){
    var iconPath = "/icons/clear.svg";
    if(iconId == 800){
        iconPath = "/icons/clear.svg";
    }else if(iconId >= 200 && iconId <= 232){
        iconPath = "/icons/storm.svg";  
    }else if(iconId >= 600 && iconId <= 622){
        iconPath = "/icons/snow.svg";
    }else if(iconId >= 701 && iconId <= 781){
        iconPath = "/icons/haze.svg";
    }else if(iconId >= 801 && iconId <= 804){
        iconPath = "/icons/cloud.svg";
    }else if((iconId >= 500 && iconId <= 531) || (iconId >= 300 && iconId <= 321)){
        iconPath = "/icons/rain.svg";
    }
    return iconPath;
  }

// Calls Python Script
async function callPython(){
    const dObj = new Date;
    const year = dObj.getFullYear();
    const month = getMonth();
    const callPythonScript = spawn('python',["main.py", year, month]);
    for await (const chunk of callPythonScript.stdout) {
            return chunk;
    }
    
}

// Returns the day name 
function getDay(){
    const arr = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const d = new Date();
    return arr[d.getDay()];
      
}

function getMonth(){
    const months = ["jan","feb","march","april","may","june","july","aug","sept","oct","nov","dec"]
    const d = new Date();
    return months[d];
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
router.listen(PORT,(req,res) => {
    console.log(`Listening on port ${PORT}`);
});