const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  uvIndex = document.querySelector(".uv-index"),
  uvText = document.querySelector(".uv-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "week";

navigator.geolocation.getCurrentPosition(function(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  // You can use latitude and longitude to display the current location on your weather app
  // For example, you can use a reverse geocoding API to get the city name and country code based on the latitude and longitude
  console.log('Latitude:', latitude);
  console.log('Longitude:', longitude);
}, function(error) {
  console.error('Error getting current location:', error.message);
});

// function to get date and time
function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // 12 hours format
  hour = hour % 12;
  if (hour < 12) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}`;
}

//Updating date and time
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

// function to get public ip address
function getPublicIp() {
  fetch("https://geolocation-db.com/json/", {
    method: "GET",
    headers: {},
  })
    .then((response) => response.json())
    .then((data) => {
      currentCity = data.city;
      getWeatherData(data.city, currentUnit, hourlyorWeek);
    })
    .catch((err) => {
      console.error(err);
    });
}

getPublicIp();

// function to get weather data
function getWeatherData(city, unit, hourlyorWeek) {
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=988TYNLEJ6AH563CDDVA3ACW7&contentType=json`,
    {
      method: "GET",
      headers: {},
    }
  )
    .then((response) => response.json())
    .then((data) => {
      let today = data.currentConditions;
      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celciusToFahrenheit(today.temp);
      }
      currentLocation.innerText = data.resolvedAddress;
      condition.innerText = today.conditions;
      rain.innerText = "Perc - " + today.precip + "%";
      uvIndex.innerText = today.uvindex;
      windSpeed.innerText = today.windspeed;
      measureUvIndex(today.uvindex);
      mainIcon.src = getIcon(today.icon);
      changeBackground(today.icon);
      humidity.innerText = today.humidity + "%";
      updateHumidityStatus(today.humidity);
      visibilty.innerText = today.visibility;
      updateVisibiltyStatus(today.visibility);
      airQuality.innerText = today.winddir;
      updateAirQualityStatus(today.winddir);
      if (hourlyorWeek === "hourly") {
        updateForecast(data.days[0].hours, unit, "day");
      } else {
        updateForecast(data.days, unit, "week");
      }
      sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
      sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
    })
    .catch((err) => {
      alert("City not found in our database");
    });
}

//function to update Forecast
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celciusToFahrenheit(data[day].temp);
    }
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "°C";
    if (unit === "f") {
      tempUnit = "°F";
    }
    card.innerHTML = `
                <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
              <img src="${iconSrc}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp}</h2>
              <span class="temp-unit">${tempUnit}</span>
            </div>
  `;
    weatherCards.appendChild(card);
    day++;
  }
}

// function to change weather icons
function getIcon(condition) {
  if (condition === "partly-cloudy-day") {
    return "https://i.ibb.co/PZQXH8V/27.png";
  } else if (condition === "partly-cloudy-night") {
    return "https://i.ibb.co/Kzkk59k/15.png";
  } else if (condition === "rain") {
    return "https://i.ibb.co/kBd2NTS/39.png";
  } else if (condition === "clear-day") {
    return "https://i.ibb.co/rb4rrJL/26.png";
  } else if (condition === "clear-night") {
    return "https://i.ibb.co/1nxNGHL/10.png";
  } else {
    return "https://i.ibb.co/rb4rrJL/26.png";
  }
}

// function to change background depending on weather conditions
function changeBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";
  if (condition === "partly-cloudy-day") {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  } else if (condition === "partly-cloudy-night") {
    bg = "https://i.ibb.co/RDfPqXz/pcn.jpg";
  } else if (condition === "rain") {
    bg = "https://i.ibb.co/h2p6Yhd/rain.webp";
  } else if (condition === "clear-day") {
    bg = "https://i.ibb.co/WGry01m/cd.jpg";
  } else if (condition === "clear-night") {
    bg = "https://i.ibb.co/kqtZ1Gx/cn.jpg";
  } else {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  }
  body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}

//get hours from hh:mm:ss
function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}

// convert time to 12 hour format
function covertTimeTo12HourFormat(time) {
  let hour = parseInt(time.split(":")[0]); // Convert hour to a number
  let minute = time.split(":")[1];
  let ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12 || 24; // Set hour to 12 if it's 0
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;
  let strTime = hour + ":" + minute + " " + ampm;
  return strTime;
}




// function to get day name from date
function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

// function to get uv index status
function measureUvIndex(uvIndex) {
  if (uvIndex <= 2) {
    uvText.innerText = "Low";
  } else if (uvIndex <= 5) {
    uvText.innerText = "Moderate";
  } else if (uvIndex <= 7) {
    uvText.innerText = "High";
  } else if (uvIndex <= 10) {
    uvText.innerText = "Very High";
  } else {
    uvText.innerText = "Extreme";
  }
}

// function to get humidity status
function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

// function to get visibility status
function updateVisibiltyStatus(visibility) {
  if (visibility <= 0.03) {
    visibilityStatus.innerText = "Dense Fog";
  } else if (visibility <= 0.16) {
    visibilityStatus.innerText = "Moderate Fog";
  } else if (visibility <= 0.35) {
    visibilityStatus.innerText = "Light Fog";
  } else if (visibility <= 1.13) {
    visibilityStatus.innerText = "Very Light Fog";
  } else if (visibility <= 2.16) {
    visibilityStatus.innerText = "Light Mist";
  } else if (visibility <= 5.4) {
    visibilityStatus.innerText = "Very Light Mist";
  } else if (visibility <= 10.8) {
    visibilityStatus.innerText = "Clear Air";
  } else {
    visibilityStatus.innerText = "Very Clear Air";
  }
}

// function to get air quality status
function updateAirQualityStatus(airquality) {
  if (airquality <= 50) {
    airQualityStatus.innerText = "Good👌";
  } else if (airquality <= 100) {
    airQualityStatus.innerText = "Moderate😐";
  } else if (airquality <= 150) {
    airQualityStatus.innerText = "Unhealthy for Sensitive Groups😷";
  } else if (airquality <= 200) {
    airQualityStatus.innerText = "Unhealthy😷";
  } else if (airquality <= 250) {
    airQualityStatus.innerText = "Very Unhealthy😨";
  } else {
    airQualityStatus.innerText = "Hazardous😱";
  }
}

// function to handle search form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(location, currentUnit, hourlyorWeek);
  }
});

// function to conver celcius to fahrenheit
function celciusToFahrenheit(temp) {
  return ((temp * 9) / 5 + 32).toFixed(1);
}


var currentFocus;
search.addEventListener("input", function (e) {
  removeSuggestions();
  var a,
    b,
    i,
    val = this.value;
  if (!val) {
    return false;
  }
  currentFocus = -1;

  a = document.createElement("ul");
  a.setAttribute("id", "suggestions");

  this.parentNode.appendChild(a);

  for (i = 0; i < cities.length; i++) {
    /*check if the item starts with the same letters as the text field value:*/
    if (
      cities[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()
    ) {
      /*create a li element for each matching element:*/
      b = document.createElement("li");
      /*make the matching letters bold:*/
      b.innerHTML =
        "<strong>" + cities[i].name.substr(0, val.length) + "</strong>";
      b.innerHTML += cities[i].name.substr(val.length);
      /*insert a input field that will hold the current array item's value:*/
      b.innerHTML += "<input type='hidden' value='" + cities[i].name + "'>";
      /*execute a function when someone clicks on the item value (DIV element):*/
      b.addEventListener("click", function (e) {
        /*insert the value for the autocomplete text field:*/
        search.value = this.getElementsByTagName("input")[0].value;
        removeSuggestions();
      });

      a.appendChild(b);
    }
  }
});
/*execute a function presses a key on the keyboard:*/
search.addEventListener("keydown", function (e) {
  var x = document.getElementById("suggestions");
  if (x) x = x.getElementsByTagName("li");
  if (e.keyCode == 40) {
    /*If the arrow DOWN key
      is pressed,
      increase the currentFocus variable:*/
    currentFocus++;
    /*and and make the current item more visible:*/
    addActive(x);
  } else if (e.keyCode == 38) {
    /*If the arrow UP key
      is pressed,
      decrease the currentFocus variable:*/
    currentFocus--;
    /*and and make the current item more visible:*/
    addActive(x);
  }
  if (e.keyCode == 13) {
    /*If the ENTER key is pressed, prevent the form from being submitted,*/
    e.preventDefault();
    if (currentFocus > -1) {
      /*and simulate a click on the "active" item:*/
      if (x) x[currentFocus].click();
    }
  }
});
function addActive(x) {
  /*a function to classify an item as "active":*/
  if (!x) return false;
  /*start by removing the "active" class on all items:*/
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;
  /*add class "autocomplete-active":*/
  x[currentFocus].classList.add("active");
}
function removeActive(x) {
  /*a function to remove the "active" class from all autocomplete items:*/
  for (var i = 0; i < x.length; i++) {
    x[i].classList.remove("active");
  }
}

function removeSuggestions() {
  var x = document.getElementById("suggestions");
  if (x) x.parentNode.removeChild(x);
}

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
  changeUnit("c");
});

// function to change unit
function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    tempUnit.forEach((elem) => {
      elem.innerText = `°${unit.toUpperCase()}`;
    });
    if (unit === "c") {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celciusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});

// function to change hourly to weekly or vice versa
function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    hourlyorWeek = unit;
    if (unit === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

// Cities add your own to get in search

cities = [
  {
    "country":"IN",
    "name":" Berhampur",
    "latitude":19.3027,
    "longitude":84.7899

  },
  {
    "country": "IN",
    "name": "Gulbarga",
    "latitude": 24.1544,
    "longitude": 91.9722
  },
  {
    "country": "IN",
    "name": "Raipur",
    "latitude": 27.6761,
    "longitude": 82.3144
  },
  {
    "country": "IN",
    "name": "Karnal",
    "latitude": 24.2236,
    "longitude": 95.8419
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 27.7048,
    "longitude": 75.5514
  },
  {
    "country": "IN",
    "name": "Gulbarga",
    "latitude": 26.1566,
    "longitude": 94.9622
  },
  {
    "country": "IN",
    "name": "Jabalpur",
    "latitude": 23.2491,
    "longitude": 92.1974
  },
  {
    "country": "IN",
    "name": "Khammam",
    "latitude": 24.1713,
    "longitude": 96.9525
  },
  {
    "country": "IN",
    "name": "Rajpur Sonarpur",
    "latitude": 9.7281,
    "longitude": 94.1817
  },
  {
    "country": "IN",
    "name": "Kulti",
    "latitude": 29.7765,
    "longitude": 91.4707
  },
  {
    "country": "IN",
    "name": "Bijapur",
    "latitude": 8.6758,
    "longitude": 74.3885
  },
  {
    "country": "IN",
    "name": "Bareilly",
    "latitude": 10.4549,
    "longitude": 80.1648
  },
  {
    "country": "IN",
    "name": "Nanded",
    "latitude": 22.5958,
    "longitude": 93.4019
  },
  {
    "country": "IN",
    "name": "Tumkur",
    "latitude": 16.1088,
    "longitude": 84.6331
  },
  {
    "country": "IN",
    "name": "Bikaner",
    "latitude": 35.6499,
    "longitude": 82.526
  },
  {
    "country": "IN",
    "name": "Darbhanga",
    "latitude": 35.7269,
    "longitude": 91.6578
  },
  {
    "country": "IN",
    "name": "Mathura",
    "latitude": 13.641,
    "longitude": 76.3946
  },
  {
    "country": "IN",
    "name": "Tirupur",
    "latitude": 23.2304,
    "longitude": 86.4555
  },
  {
    "country": "IN",
    "name": "Korba",
    "latitude": 16.0734,
    "longitude": 70.9716
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 15.9782,
    "longitude": 83.7424
  },
  {
    "country": "IN",
    "name": "Karnal",
    "latitude": 28.6334,
    "longitude": 71.6521
  },
  {
    "country": "IN",
    "name": "Aligarh",
    "latitude": 14.6436,
    "longitude": 85.6977
  },
  {
    "country": "IN",
    "name": "South Dumdum",
    "latitude": 13.5587,
    "longitude": 88.5528
  },
  {
    "country": "IN",
    "name": "Karnal",
    "latitude": 26.0329,
    "longitude": 83.0385
  },
  {
    "country": "IN",
    "name": "Aizawl",
    "latitude": 35.3957,
    "longitude": 82.8182
  },
  {
    "country": "IN",
    "name": "Haridwar",
    "latitude": 23.8563,
    "longitude": 91.0416
  },
  {
    "country": "IN",
    "name": "Aizawl",
    "latitude": 24.8456,
    "longitude": 75.9782
  },
  {
    "country": "IN",
    "name": "Lucknow",
    "latitude": 33.8646,
    "longitude": 94.7546
  },
  {
    "country": "IN",
    "name": "Rajpur Sonarpur",
    "latitude": 8.1977,
    "longitude": 81.9731
  },
  {
    "country": "IN",
    "name": "Tiruchirappalli",
    "latitude": 9.4655,
    "longitude": 91.3235
  },
  {
    "country": "IN",
    "name": "Bikaner",
    "latitude": 28.5508,
    "longitude": 94.8456
  },
  {
    "country": "IN",
    "name": "Bhilai",
    "latitude": 20.9572,
    "longitude": 80.4988
  },
  {
    "country": "IN",
    "name": "Guntur",
    "latitude": 15.0383,
    "longitude": 79.6283
  },
  {
    "country": "IN",
    "name": "Loni",
    "latitude": 25.9111,
    "longitude": 92.1349
  },
  {
    "country": "IN",
    "name": "Rourkela",
    "latitude": 21.77,
    "longitude": 86.3925
  },
  {
    "country": "IN",
    "name": "Kulti",
    "latitude": 8.7091,
    "longitude": 86.137
  },
  {
    "country": "IN",
    "name": "Darbhanga",
    "latitude": 26.9272,
    "longitude": 75.4687
  },
  {
    "country": "IN",
    "name": "South Dumdum",
    "latitude": 15.7539,
    "longitude": 71.5913
  },
  {
    "country": "IN",
    "name": "Saharanpur",
    "latitude": 23.1255,
    "longitude": 83.7089
  },
  {
    "country": "IN",
    "name": "Shivpuri",
    "latitude": 29.9724,
    "longitude": 92.6717
  },
  {
    "country": "IN",
    "name": "Meerut",
    "latitude": 29.2532,
    "longitude": 94.2124
  },
  {
    "country": "IN",
    "name": "Durgapur",
    "latitude": 18.3024,
    "longitude": 81.9959
  },
  {
    "country": "IN",
    "name": "Bangalore",
    "latitude": 15.7402,
    "longitude": 79.8785
  },
  {
    "country": "IN",
    "name": "Haridwar",
    "latitude": 28.8587,
    "longitude": 89.3416
  },
  {
    "country": "IN",
    "name": "Jhansi",
    "latitude": 13.7928,
    "longitude": 71.2141
  },
  {
    "country": "IN",
    "name": "Asansol",
    "latitude": 21.5335,
    "longitude": 83.3928
  },
  {
    "country": "IN",
    "name": "Alwar",
    "latitude": 12.2884,
    "longitude": 82.3333
  },
  {
    "country": "IN",
    "name": "Thanjavur",
    "latitude": 29.054,
    "longitude": 77.1562
  },
  {
    "country": "IN",
    "name": "Kolkata",
    "latitude": 22.4028,
    "longitude": 74.4115
  },
  {
    "country": "IN",
    "name": "Bhilai",
    "latitude": 26.7483,
    "longitude": 87.2595
  },
  {
    "country": "IN",
    "name": "Karnal",
    "latitude": 12.1546,
    "longitude": 68.6149
  },
  {
    "country": "IN",
    "name": "Nellore",
    "latitude": 20.8804,
    "longitude": 85.2884
  },
  {
    "country": "IN",
    "name": "Shivpuri",
    "latitude": 29.0735,
    "longitude": 69.7621
  },
  {
    "country": "IN",
    "name": "Jabalpur",
    "latitude": 9.9452,
    "longitude": 80.6668
  },
  {
    "country": "IN",
    "name": "Bardhaman",
    "latitude": 27.8128,
    "longitude": 78.2298
  },
  {
    "country": "IN",
    "name": "Madurai",
    "latitude": 10.598,
    "longitude": 75.2163
  },
  {
    "country": "IN",
    "name": "Gurgaon",
    "latitude": 31.2081,
    "longitude": 96.3318
  },
  {
    "country": "IN",
    "name": "Bidar",
    "latitude": 15.4047,
    "longitude": 78.376
  },
  {
    "country": "IN",
    "name": "Tirupati",
    "latitude": 24.6599,
    "longitude": 96.5989
  },
  {
    "country": "IN",
    "name": "Karnal",
    "latitude": 11.9459,
    "longitude": 72.5175
  },
  {
    "country": "IN",
    "name": "Mirzapur",
    "latitude": 33.7117,
    "longitude": 96.2217
  },
  {
    "country": "IN",
    "name": "Tumkur",
    "latitude": 23.0178,
    "longitude": 83.7825
  },
  {
    "country": "IN",
    "name": "Tirupati",
    "latitude": 10.3499,
    "longitude": 91.4334
  },
  {
    "country": "IN",
    "name": "Ambattur",
    "latitude": 14.9601,
    "longitude": 83.5902
  },
  {
    "country": "IN",
    "name": "Bhiwandi",
    "latitude": 31.8417,
    "longitude": 91.6784
  },
  {
    "country": "IN",
    "name": "Jaipur",
    "latitude": 23.9268,
    "longitude": 72.2286
  },
  {
    "country": "IN",
    "name": "Rajahmundry",
    "latitude": 14.6361,
    "longitude": 82.1065
  },
  {
    "country": "IN",
    "name": "Cuttack",
    "latitude": 17.1816,
    "longitude": 82.9061
  },
  {
    "country": "IN",
    "name": "Mumbai",
    "latitude": 27.6878,
    "longitude": 70.3759
  },
  {
    "country": "IN",
    "name": "Saharanpur",
    "latitude": 15.6428,
    "longitude": 73.0152
  },
  {
    "country": "IN",
    "name": "Darbhanga",
    "latitude": 27.2057,
    "longitude": 82.4518
  },
  {
    "country": "IN",
    "name": "Shahjahanpur",
    "latitude": 20.2712,
    "longitude": 83.6673
  },
  {
    "country": "IN",
    "name": "Ichalkaranji",
    "latitude": 36.0069,
    "longitude": 83.1161
  },
  {
    "country": "IN",
    "name": "South Dumdum",
    "latitude": 36.432,
    "longitude": 73.8872
  },
  {
    "country": "IN",
    "name": "Rajahmundry",
    "latitude": 27.5711,
    "longitude": 84.4544
  },
  {
    "country": "IN",
    "name": "Aizawl",
    "latitude": 32.532,
    "longitude": 90.4808
  },
  {
    "country": "IN",
    "name": "Solapur",
    "latitude": 36.2834,
    "longitude": 71.9399
  },
  {
    "country": "IN",
    "name": "Nangloi Jat",
    "latitude": 28.5589,
    "longitude": 91.8413
  },
  {
    "country": "IN",
    "name": "Satna",
    "latitude": 17.8319,
    "longitude": 90.7314
  },
  {
    "country": "IN",
    "name": "Tumkur",
    "latitude": 18.7192,
    "longitude": 90.629
  },
  {
    "country": "IN",
    "name": "Pune",
    "latitude": 29.3743,
    "longitude": 84.4478
  },
  {
    "country": "IN",
    "name": "Kulti",
    "latitude": 8.6057,
    "longitude": 93.6928
  },
  {
    "country": "IN",
    "name": "Bihar Sharif",
    "latitude": 25.7229,
    "longitude": 93.9197
  },
  {
    "country": "IN",
    "name": "Siliguri",
    "latitude": 15.746,
    "longitude": 81.6704
  },
  {
    "country": "IN",
    "name": "Satara",
    "latitude": 21.4301,
    "longitude": 78.6499
  },
  {
    "country": "IN",
    "name": "Kanpur",
    "latitude": 35.0447,
    "longitude": 73.7131
  },
  {
    "country": "IN",
    "name": "Nangloi Jat",
    "latitude": 34.8868,
    "longitude": 85.2249
  },
  {
    "country": "IN",
    "name": "Nagpur",
    "latitude": 9.363,
    "longitude": 71.9925
  },
  {
    "country": "IN",
    "name": "Kulti",
    "latitude": 18.1995,
    "longitude": 73.0854
  },
  {
    "country": "IN",
    "name": "Surat",
    "latitude": 24.7679,
    "longitude": 94.2545
  },
  {
    "country": "IN",
    "name": "Erode",
    "latitude": 35.6485,
    "longitude": 79.885
  },
  {
    "country": "IN",
    "name": "Bardhaman",
    "latitude": 19.3784,
    "longitude": 72.114
  },
  {
    "country": "IN",
    "name": "Nangloi Jat",
    "latitude": 25.0684,
    "longitude": 91.487
  },
  {
    "country": "IN",
    "name": "Nangloi Jat",
    "latitude": 31.6244,
    "longitude": 69.1953
  },
  {
    "country": "IN",
    "name": "Kharagpur",
    "latitude": 8.1036,
    "longitude": 88.5096
  },
  {
    "country": "IN",
    "name": "Jalgaon",
    "latitude": 24.4714,
    "longitude": 88.4331
  },
  {
    "country": "IN",
    "name": "Bhilwara",
    "latitude": 35.877,
    "longitude": 76.6702
  },
  {
    "country": "IN",
    "name": "Guntur",
    "latitude": 27.3049,
    "longitude": 88.8934
  },
  {
    "country": "IN",
    "name": "Aizawl",
    "latitude": 24.0697,
    "longitude": 83.9331
  },
  {
    "country": "IN",
    "name": "Mumbai",
    "latitude": 29.472,
    "longitude": 69.7257
  },
  {
    "country": "IN",
    "name": "Noida",
    "latitude": 26.4446,
    "longitude": 69.6847
  },
  {
    "country": "IN",
    "name": "Kalyan-Dombivli",
    "latitude": 10.2923,
    "longitude": 68.3957
  },
  {
    "country": "IN",
    "name": "Tiruchirappalli",
    "latitude": 17.3586,
    "longitude": 91.1226
  },
  {
    "country": "IN",
    "name": "Siliguri",
    "latitude": 21.1676,
    "longitude": 76.5126
  },
  {
    "country": "IN",
    "name": "Kamarhati",
    "latitude": 36.6445,
    "longitude": 84.8879
  },
  {
    "country": "IN",
    "name": "Bilaspur",
    "latitude": 11.3581,
    "longitude": 68.5255
  },
  {
    "country": "IN",
    "name": "Bhavnagar",
    "latitude": 22.7017,
    "longitude": 82.8452
  },
  {
    "country": "IN",
    "name": "Surat",
    "latitude": 20.9955,
    "longitude": 68.9174
  },
  {
    "country": "IN",
    "name": "Berhampur",
    "latitude": 20.8724,
    "longitude": 75.7077
  },
  {
    "country": "IN",
    "name": "Shivpuri",
    "latitude": 32.6155,
    "longitude": 92.1369
  },
  {
    "country": "IN",
    "name": "Bardhaman",
    "latitude": 14.3644,
    "longitude": 76.0013
  },
  {
    "country": "IN",
    "name": "Berhampur",
    "latitude": 26.5338,
    "longitude": 91.246
  },
  {
    "country": "IN",
    "name": "Bidar",
    "latitude": 12.8383,
    "longitude": 73.4074
  },
  {
    "country": "IN",
    "name": "Solapur",
    "latitude": 22.7779,
    "longitude": 83.5481
  },
  {
    "country": "IN",
    "name": "Mango",
    "latitude": 27.1174,
    "longitude": 68.2831
  },
  {
    "country": "IN",
    "name": "Bhilai",
    "latitude": 34.4847,
    "longitude": 76.8954
  },
  {
    "country": "IN",
    "name": "Mysore",
    "latitude": 29.5641,
    "longitude": 82.1671
  },
  {
    "country": "IN",
    "name": "Bangalore",
    "latitude": 23.013,
    "longitude": 94.0515
  },
  {
    "country": "IN",
    "name": "Jalandhar",
    "latitude": 22.4172,
    "longitude": 82.4317
  },
  {
    "country": "IN",
    "name": "Mirzapur",
    "latitude": 23.7072,
    "longitude": 78.712
  },
  {
    "country": "IN",
    "name": "Solapur",
    "latitude": 29.6831,
    "longitude": 81.6338
  },
  {
    "country": "IN",
    "name": "Bihar Sharif",
    "latitude": 15.8123,
    "longitude": 81.2866
  },
  {
    "country": "IN",
    "name": "Visakhapatnam",
    "latitude": 9.4939,
    "longitude": 73.2852
  },
  {
    "country": "IN",
    "name": "Kurnool",
    "latitude": 22.9498,
    "longitude": 78.9927
  },
  {
    "country": "IN",
    "name": "Udaipur",
    "latitude": 35.0232,
    "longitude": 93.3011
  },
  {
    "country": "IN",
    "name": "Rajpur Sonarpur",
    "latitude": 16.7301,
    "longitude": 88.6373
  },
  {
    "country": "IN",
    "name": "Bellary",
    "latitude": 20.3346,
    "longitude": 69.8888
  },
  {
    "country": "IN",
    "name": "Hyderabad",
    "latitude": 19.4225,
    "longitude": 88.5864
  },
  {
    "country": "IN",
    "name": "Tirupur",
    "latitude": 34.6662,
    "longitude": 93.3842
  },
  {
    "country": "IN",
    "name": "Panipat",
    "latitude": 9.6597,
    "longitude": 77.1808
  },
  {
    "country": "IN",
    "name": "Indore",
    "latitude": 18.4076,
    "longitude": 77.7819
  },
  {
    "country": "IN",
    "name": "Khammam",
    "latitude": 26.8815,
    "longitude": 94.1818
  },
  {
    "country": "IN",
    "name": "Jamnagar",
    "latitude": 23.5839,
    "longitude": 88.9681
  },
  {
    "country": "IN",
    "name": "Ghaziabad",
    "latitude": 33.0476,
    "longitude": 78.7725
  },
  {
    "country": "IN",
    "name": "Satna",
    "latitude": 24.3628,
    "longitude": 90.2373
  },
  {
    "country": "IN",
    "name": "Davanagere",
    "latitude": 19.4527,
    "longitude": 69.3988
  },
  {
    "country": "IN",
    "name": "Meerut",
    "latitude": 21.7901,
    "longitude": 75.1466
  },
  {
    "country": "IN",
    "name": "Bhilai",
    "latitude": 35.1109,
    "longitude": 96.3862
  },
  {
    "country": "IN",
    "name": "Guwahati",
    "latitude": 32.3499,
    "longitude": 71.9017
  },
  {
    "country": "IN",
    "name": "Erode",
    "latitude": 18.0564,
    "longitude": 75.3462
  },
  {
    "country": "IN",
    "name": "Panihati",
    "latitude": 8.7165,
    "longitude": 71.3618
  },
  {
    "country": "IN",
    "name": "Chennai",
    "latitude": 21.9829,
    "longitude": 94.6839
  },
  {
    "country": "IN",
    "name": "Ahmednagar",
    "latitude": 30.2394,
    "longitude": 76.7901
  },
  {
    "country": "IN",
    "name": "Mango",
    "latitude": 27.4622,
    "longitude": 86.619
  },
  {
    "country": "IN",
    "name": "Khammam",
    "latitude": 34.1315,
    "longitude": 71.1234
  },
  {
    "country": "IN",
    "name": "Rajkot",
    "latitude": 31.2164,
    "longitude": 95.4087
  },
  {
    "country": "IN",
    "name": "Madurai",
    "latitude": 8.7546,
    "longitude": 90.1917
  },
  {
    "country": "IN",
    "name": "Mathura",
    "latitude": 12.2312,
    "longitude": 93.867
  },
  {
    "country": "IN",
    "name": "Parbhani",
    "latitude": 20.2605,
    "longitude": 76.0896
  },
  {
    "country": "IN",
    "name": "Kalyan-Dombivli",
    "latitude": 13.1733,
    "longitude": 68.0165
  },
  {
    "country": "IN",
    "name": "South Dumdum",
    "latitude": 24.6298,
    "longitude": 93.7206
  },
  {
    "country": "IN",
    "name": "Asansol",
    "latitude": 36.7764,
    "longitude": 91.203
  },
  {
    "country": "IN",
    "name": "Chandigarh",
    "latitude": 24.5329,
    "longitude": 77.7317
  },
  {
    "country": "IN",
    "name": "Vijayawada",
    "latitude": 23.3348,
    "longitude": 73.6402
  },
  {
    "country": "IN",
    "name": "Nizamabad",
    "latitude": 23.1014,
    "longitude": 94.8666
  },
  {
    "country": "IN",
    "name": "Darbhanga",
    "latitude": 14.4235,
    "longitude": 69.7454
  },
  {
    "country": "IN",
    "name": "Dhanbad",
    "latitude": 20.6194,
    "longitude": 83.234
  },
  {
    "country": "IN",
    "name": "Thane",
    "latitude": 31.6361,
    "longitude": 86.1922
  },
  {
    "country": "IN",
    "name": "Ajmer",
    "latitude": 24.7518,
    "longitude": 96.9355
  },
  {
    "country": "IN",
    "name": "Parbhani",
    "latitude": 17.7498,
    "longitude": 95.6868
  },
  {
    "country": "IN",
    "name": "Rohtak",
    "latitude": 22.6001,
    "longitude": 72.3584
  },
  {
    "country": "IN",
    "name": "Bhubaneswar",
    "latitude": 30.6555,
    "longitude": 74.5591
  },
  {
    "country": "IN",
    "name": "Vadodara",
    "latitude": 30.1345,
    "longitude": 76.0863
  },
  {
    "country": "IN",
    "name": "Nashik",
    "latitude": 35.8078,
    "longitude": 92.1086
  },
  {
    "country": "IN",
    "name": "Bardhaman",
    "latitude": 29.0579,
    "longitude": 95.025
  },
  {
    "country": "IN",
    "name": "Tumkur",
    "latitude": 10.8543,
    "longitude": 82.4891
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 31.7737,
    "longitude": 74.7557
  },
  {
    "country": "IN",
    "name": "Ichalkaranji",
    "latitude": 35.8878,
    "longitude": 79.5188
  },
  {
    "country": "IN",
    "name": "Bilaspur",
    "latitude": 18.4447,
    "longitude": 90.187
  },
  {
    "country": "IN",
    "name": "Erode",
    "latitude": 32.6217,
    "longitude": 76.5996
  },
  {
    "country": "IN",
    "name": "Siliguri",
    "latitude": 28.537,
    "longitude": 71.4047
  },
  {
    "country": "IN",
    "name": "Aurangabad",
    "latitude": 18.5198,
    "longitude": 94.5755
  },
  {
    "country": "IN",
    "name": "Karnal",
    "latitude": 36.0725,
    "longitude": 79.7594
  },
  {
    "country": "IN",
    "name": "Bellary",
    "latitude": 17.997,
    "longitude": 92.7355
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 25.0932,
    "longitude": 96.2611
  },
  {
    "country": "IN",
    "name": "Loni",
    "latitude": 36.8968,
    "longitude": 86.001
  },
  {
    "country": "IN",
    "name": "Loni",
    "latitude": 10.9779,
    "longitude": 76.8226
  },
  {
    "country": "IN",
    "name": "Gulbarga",
    "latitude": 17.2894,
    "longitude": 84.5927
  },
  {
    "country": "IN",
    "name": "Kozhikode",
    "latitude": 22.5447,
    "longitude": 82.0794
  },
  {
    "country": "IN",
    "name": "Navi Mumbai",
    "latitude": 28.5626,
    "longitude": 79.4366
  },
  {
    "country": "IN",
    "name": "Darbhanga",
    "latitude": 15.0117,
    "longitude": 95.4407
  },
  {
    "country": "IN",
    "name": "Karnal",
    "latitude": 26.6665,
    "longitude": 85.1926
  },
  {
    "country": "IN",
    "name": "Haridwar",
    "latitude": 34.4376,
    "longitude": 90.6851
  },
  {
    "country": "IN",
    "name": "Shivpuri",
    "latitude": 21.323,
    "longitude": 79.056
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 18.222,
    "longitude": 79.052
  },
  {
    "country": "IN",
    "name": "Amaravati",
    "latitude": 18.026,
    "longitude": 74.6056
  },
  {
    "country": "IN",
    "name": "Jhansi",
    "latitude": 28.3297,
    "longitude": 77.247
  },
  {
    "country": "IN",
    "name": "Ambattur",
    "latitude": 24.6135,
    "longitude": 72.405
  },
  {
    "country": "IN",
    "name": "Dehradun",
    "latitude": 17.8558,
    "longitude": 77.0178
  },
  {
    "country": "IN",
    "name": "Ahmednagar",
    "latitude": 22.3832,
    "longitude": 69.859
  },
  {
    "country": "IN",
    "name": "Thanjavur",
    "latitude": 35.5363,
    "longitude": 77.0869
  },
  {
    "country": "IN",
    "name": "Kurnool",
    "latitude": 15.0951,
    "longitude": 72.6376
  },
  {
    "country": "IN",
    "name": "Vadodara",
    "latitude": 26.2382,
    "longitude": 71.7151
  },
  {
    "country": "IN",
    "name": "Ichalkaranji",
    "latitude": 8.7794,
    "longitude": 68.6725
  },
  {
    "country": "IN",
    "name": "Aizawl",
    "latitude": 10.8579,
    "longitude": 83.6349
  },
  {
    "country": "IN",
    "name": "Faridabad",
    "latitude": 11.5512,
    "longitude": 91.6379
  },
  {
    "country": "IN",
    "name": "Bhilai",
    "latitude": 13.0877,
    "longitude": 71.4011
  },
  {
    "country": "IN",
    "name": "Ahmedabad",
    "latitude": 36.9383,
    "longitude": 80.8745
  },
  {
    "country": "IN",
    "name": "Kurnool",
    "latitude": 8.2783,
    "longitude": 89.5113
  },
  {
    "country": "IN",
    "name": "Bhatpara",
    "latitude": 29.2902,
    "longitude": 92.8283
  },
  {
    "country": "IN",
    "name": "Lucknow",
    "latitude": 13.4769,
    "longitude": 95.9256
  },
  {
    "country": "IN",
    "name": "Parbhani",
    "latitude": 21.1254,
    "longitude": 89.8706
  },
  {
    "country": "IN",
    "name": "Shivpuri",
    "latitude": 25.5265,
    "longitude": 92.1871
  },
  {
    "country": "IN",
    "name": "Darbhanga",
    "latitude": 21.7494,
    "longitude": 84.1167
  },
  {
    "country": "IN",
    "name": "Surat",
    "latitude": 22.0225,
    "longitude": 92.6632
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 10.4714,
    "longitude": 71.9241
  },
  {
    "country": "IN",
    "name": "Bhilai",
    "latitude": 18.529,
    "longitude": 86.1112
  },
  {
    "country": "IN",
    "name": "Bardhaman",
    "latitude": 9.2997,
    "longitude": 75.5978
  },
  {
    "country": "IN",
    "name": "Satna",
    "latitude": 30.7492,
    "longitude": 95.2759
  },
  {
    "country": "IN",
    "name": "Aizawl",
    "latitude": 10.1372,
    "longitude": 89.916
  },
  {
    "country": "IN",
    "name": "Aizawl",
    "latitude": 22.7301,
    "longitude": 89.0692
  },
  {
    "country": "IN",
    "name": "Surat",
    "latitude": 23.5202,
    "longitude": 82.2636
  },
  {
    "country": "IN",
    "name": "Tirupur",
    "latitude": 25.5243,
    "longitude": 79.6644
  },
  {
    "country": "IN",
    "name": "Shahjahanpur",
    "latitude": 10.9438,
    "longitude": 80.32
  },
  {
    "country": "IN",
    "name": "Belgaum",
    "latitude": 10.678,
    "longitude": 87.5756
  },
  {
    "country": "IN",
    "name": "Bhilai",
    "latitude": 15.2492,
    "longitude": 84.9262
  },
  {
    "country": "IN",
    "name": "Rohtak",
    "latitude": 9.3248,
    "longitude": 74.9684
  },
  {
    "country": "IN",
    "name": "Karnal",
    "latitude": 24.8543,
    "longitude": 68.8601
  },
  {
    "country": "IN",
    "name": "Tirupur",
    "latitude": 30.8245,
    "longitude": 72.3827
  },
  {
    "country": "IN",
    "name": "Bhatpara",
    "latitude": 11.5359,
    "longitude": 79.9838
  },
  {
    "country": "IN",
    "name": "Ranchi",
    "latitude": 36.121,
    "longitude": 91.7861
  },
  {
    "country": "IN",
    "name": "Belgaum",
    "latitude": 12.2429,
    "longitude": 70.4452
  },
  {
    "country": "IN",
    "name": "Aurangabad",
    "latitude": 28.1679,
    "longitude": 95.3577
  },
  {
    "country": "IN",
    "name": "Mango",
    "latitude": 35.8935,
    "longitude": 94.4989
  },
  {
    "country": "IN",
    "name": "Bilaspur",
    "latitude": 25.5404,
    "longitude": 83.2219
  },
  {
    "country": "IN",
    "name": "Shimoga",
    "latitude": 26.7077,
    "longitude": 70.1774
  },
  {
    "country": "IN",
    "name": "Siliguri",
    "latitude": 16.2513,
    "longitude": 86.2523
  },
  {
    "country": "IN",
    "name": "Ichalkaranji",
    "latitude": 19.734,
    "longitude": 86.1945
  },
  {
    "country": "IN",
    "name": "Kulti",
    "latitude": 18.9691,
    "longitude": 72.0092
  },
  {
    "country": "IN",
    "name": "Bokaro",
    "latitude": 14.652,
    "longitude": 90.01
  },
  {
    "country": "IN",
    "name": "Asansol",
    "latitude": 10.3588,
    "longitude": 82.0146
  },
  {
    "country": "IN",
    "name": "Bardhaman",
    "latitude": 28.5334,
    "longitude": 94.5775
  },
  {
    "country": "IN",
    "name": "Bellary",
    "latitude": 21.2311,
    "longitude": 72.3903
  },
  {
    "country": "IN",
    "name": "Darbhanga",
    "latitude": 27.9971,
    "longitude": 69.3976
  },
  {
    "country": "IN",
    "name": "Surat",
    "latitude": 18.3071,
    "longitude": 79.9804
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 36.1062,
    "longitude": 87.5424
  },
  {
    "country": "IN",
    "name": "Bilaspur",
    "latitude": 8.2146,
    "longitude": 74.7976
  },
  {
    "country": "IN",
    "name": "Parbhani",
    "latitude": 26.0077,
    "longitude": 91.0475
  },
  {
    "country": "IN",
    "name": "Asansol",
    "latitude": 11.9986,
    "longitude": 84.892
  },
  {
    "country": "IN",
    "name": "Thrissur",
    "latitude": 30.3579,
    "longitude": 94.6373
  },
  {
    "country": "IN",
    "name": "Sangli-Miraj & Kupwad",
    "latitude": 16.7461,
    "longitude": 70.6425
  },
  {
    "country": "IN",
    "name": "Mirzapur",
    "latitude": 34.1776,
    "longitude": 79.3262
  },
  {
    "country": "IN",
    "name": "Alwar",
    "latitude": 34.6091,
    "longitude": 88.3582
  },
  {
    "country": "IN",
    "name": "Bardhaman",
    "latitude": 14.8845,
    "longitude": 68.538
  },
  {
    "country": "IN",
    "name": "Salem",
    "latitude": 25.2243,
    "longitude": 72.699
  },
  {
    "country": "IN",
    "name": "Rohtak",
    "latitude": 13.341,
    "longitude": 93.3013
  },
  {
    "country": "IN",
    "name": "Amritsar",
    "latitude": 8.5968,
    "longitude": 92.1052
  },
  {
    "country": "IN",
    "name": "Kolhapur",
    "latitude": 26.8039,
    "longitude": 80.0039
  },
  {
    "country": "IN",
    "name": "Khammam",
    "latitude": 23.6799,
    "longitude": 80.2604
  },
  {
    "country": "IN",
    "name": "Darbhanga",
    "latitude": 32.5412,
    "longitude": 95.215
  },
  {
    "country": "IN",
    "name": "Vasai-Virar",
    "latitude": 16.0624,
    "longitude": 74.4462
  },
  {
    "country": "IN",
    "name": "Bhagalpur",
    "latitude": 10.5804,
    "longitude": 91.2185
  },
  {
    "country": "IN",
    "name": "Satna",
    "latitude": 28.343,
    "longitude": 81.7422
  },
  {
    "country": "IN",
    "name": "Mirzapur",
    "latitude": 22.6039,
    "longitude": 81.7984
  },
  {
    "country": "IN",
    "name": "Bidar",
    "latitude": 33.141,
    "longitude": 79.3886
  },
  {
    "country": "IN",
    "name": "Anantapur",
    "latitude": 16.1069,
    "longitude": 76.5234
  },
  {
    "country": "IN",
    "name": "Satna",
    "latitude": 25.9734,
    "longitude": 84.1861
  },
  {
    "country": "IN",
    "name": "Bareilly",
    "latitude": 16.6552,
    "longitude": 75.7488
  },
  {
    "country": "IN",
    "name": "Surat",
    "latitude": 8.7183,
    "longitude": 94.4531
  },
  {
    "country": "IN",
    "name": "Bhilai",
    "latitude": 8.4651,
    "longitude": 92.2508
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 28.9961,
    "longitude": 71.1973
  },
  {
    "country": "IN",
    "name": "Kamarhati",
    "latitude": 16.1148,
    "longitude": 85.6338
  },
  {
    "country": "IN",
    "name": "Kalyan-Dombivli",
    "latitude": 25.8863,
    "longitude": 75.7707
  },
  {
    "country": "IN",
    "name": "Rajkot",
    "latitude": 14.3152,
    "longitude": 75.427
  },
  {
    "country": "IN",
    "name": "Varanasi",
    "latitude": 35.5821,
    "longitude": 96.1225
  },
  {
    "country": "IN",
    "name": "Visakhapatnam",
    "latitude": 17.249,
    "longitude": 80.9772
  },
  {
    "country": "IN",
    "name": "Kolkata",
    "latitude": 15.4934,
    "longitude": 81.8981
  },
  {
    "country": "IN",
    "name": "Ulhasnagar",
    "latitude": 15.3873,
    "longitude": 70.4049
  },
  {
    "country": "IN",
    "name": "Amravati",
    "latitude": 10.1653,
    "longitude": 72.07
  },
  {
    "country": "IN",
    "name": "Karnal",
    "latitude": 12.424,
    "longitude": 91.3705
  },
  {
    "country": "IN",
    "name": "Kalyan-Dombivli",
    "latitude": 29.3837,
    "longitude": 93.9019
  },
  {
    "country": "IN",
    "name": "Delhi",
    "latitude": 26.9697,
    "longitude": 78.497
  },
  {
    "country": "IN",
    "name": "Kamarhati",
    "latitude": 13.6221,
    "longitude": 91.7032
  },
  {
    "country": "IN",
    "name": "Shimoga",
    "latitude": 19.3303,
    "longitude": 92.7746
  },
  {
    "country": "IN",
    "name": "Korba",
    "latitude": 34.2314,
    "longitude": 74.7669
  },
  {
    "country": "IN",
    "name": "Bardhaman",
    "latitude": 9.6845,
    "longitude": 74.9212
  },
  {
    "country": "IN",
    "name": "Bhilai",
    "latitude": 32.7012,
    "longitude": 69.9456
  },
  {
    "country": "IN",
    "name": "Visakhapatnam",
    "latitude": 11.5272,
    "longitude": 84.1693
  },
  {
    "country": "IN",
    "name": "Kota",
    "latitude": 28.0894,
    "longitude": 90.5317
  },
  {
    "country": "IN",
    "name": "Parbhani",
    "latitude": 35.2089,
    "longitude": 70.9458
  },
  {
    "country": "IN",
    "name": "Pune",
    "latitude": 28.2244,
    "longitude": 88.5741
  },
  {
    "country": "IN",
    "name": "Haridwar",
    "latitude": 8.8351,
    "longitude": 82.6149
  },
  {
    "country": "IN",
    "name": "Bilaspur",
    "latitude": 17.6871,
    "longitude": 89.3206
  },
  {
    "country": "IN",
    "name": "Hyderabad",
    "latitude": 18.2922,
    "longitude": 90.3566
  },
  {
    "country": "IN",
    "name": "Gwalior",
    "latitude": 19.9209,
    "longitude": 74.4106
  },
  {
    "country": "IN",
    "name": "Lucknow",
    "latitude": 27.4452,
    "longitude": 92.0732
  },
  {
    "country": "IN",
    "name": "Nagpur",
    "latitude": 28.5154,
    "longitude": 87.0306
  },
  {
    "country": "IN",
    "name": "Haridwar",
    "latitude": 20.5714,
    "longitude": 94.4805
  },
  {
    "country": "IN",
    "name": "Lucknow",
    "latitude": 19.023,
    "longitude": 76.6702
  },
  {
    "country": "IN",
    "name": "Meerut",
    "latitude": 30.6562,
    "longitude": 81.6671
  },
  {
    "country": "IN",
    "name": "Bihar Sharif",
    "latitude": 34.8493,
    "longitude": 85.7166
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 15.9226,
    "longitude": 91.2652
  },
  {
    "country": "IN",
    "name": "Malegaon",
    "latitude": 10.3986,
    "longitude": 74.7097
  },
  {
    "country": "IN",
    "name": "Nangloi Jat",
    "latitude": 17.1116,
    "longitude": 75.1408
  },
  {
    "country": "IN",
    "name": "Anantapur",
    "latitude": 14.5751,
    "longitude": 79.4121
  },
  {
    "country": "IN",
    "name": "Ozhukarai",
    "latitude": 8.4258,
    "longitude": 86.2982
  },
  {
    "country": "IN",
    "name": "Rourkela",
    "latitude": 36.9388,
    "longitude": 88.4161
  },
  {
    "country": "IN",
    "name": "Haridwar",
    "latitude": 26.5637,
    "longitude": 77.0133
  },
  {
    "country": "IN",
    "name": "Sangli-Miraj & Kupwad",
    "latitude": 33.9593,
    "longitude": 68.5655
  },
  {
    "country": "IN",
    "name": "Mirzapur",
    "latitude": 9.4195,
    "longitude": 90.8852
  },
  {
    "country": "IN",
    "name": "Karnal",
    "latitude": 9.8871,
    "longitude": 79.0004
  },
  {
    "country": "IN",
    "name": "Thanjavur",
    "latitude": 13.6546,
    "longitude": 83.586
  },
  {
    "country": "IN",
    "name": "Gopalpur",
    "latitude": 22.7351,
    "longitude": 94.5726
  },
  {
    "country": "IN",
    "name": "Mysore",
    "latitude": 24.2085,
    "longitude": 85.2693
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 29.9043,
    "longitude": 96.412
  },
  {
    "country": "IN",
    "name": "Bhiwandi",
    "latitude": 25.0874,
    "longitude": 80.9636
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 12.5723,
    "longitude": 87.4483
  },
  {
    "country": "IN",
    "name": "Kharagpur",
    "latitude": 21.0379,
    "longitude": 86.4733
  },
  {
    "country": "IN",
    "name": "Thanjavur",
    "latitude": 31.6364,
    "longitude": 95.9326
  },
  {
    "country": "IN",
    "name": "Rohtak",
    "latitude": 26.6851,
    "longitude": 72.9649
  },
  {
    "country": "IN",
    "name": "Jalgaon",
    "latitude": 34.8986,
    "longitude": 83.0714
  },
  {
    "country": "IN",
    "name": "Mirzapur",
    "latitude": 18.3971,
    "longitude": 93.7907
  },
  {
    "country": "IN",
    "name": "Ghaziabad",
    "latitude": 30.5532,
    "longitude": 96.1886
  },
  {
    "country": "IN",
    "name": "Sangli-Miraj & Kupwad",
    "latitude": 36.0452,
    "longitude": 96.2508
  },
  {
    "country": "IN",
    "name": "Ahmedabad",
    "latitude": 27.6009,
    "longitude": 76.3345
  },
  {
    "country": "IN",
    "name": "Sangli-Miraj & Kupwad",
    "latitude": 33.1437,
    "longitude": 73.5494
  },
  {
    "country": "IN",
    "name": "Bhilai",
    "latitude": 20.5172,
    "longitude": 81.5001
  },
  {
    "country": "IN",
    "name": "Hyderabad",
    "latitude": 9.2227,
    "longitude": 75.5663
  },
  {
    "country": "IN",
    "name": "Jamshedpur",
    "latitude": 34.1883,
    "longitude": 86.3687
  },
  {
    "country": "IN",
    "name": "Kamarhati",
    "latitude": 28.749,
    "longitude": 95.7257
  },
  {
    "country": "IN",
    "name": "Kanpur",
    "latitude": 11.7559,
    "longitude": 83.9239
  },
  {
    "country": "IN",
    "name": "Kharagpur",
    "latitude": 10.9874,
    "longitude": 82.3707
  },
  {
    "country": "IN",
    "name": "Jaipur",
    "latitude": 21.9913,
    "longitude": 79.7501
  },
  {
    "country": "IN",
    "name": "Kochi",
    "latitude": 17.0573,
    "longitude": 83.8009
  },
  {
    "country": "IN",
    "name": "Khammam",
    "latitude": 10.48,
    "longitude": 83.4449
  },
  {
    "country": "IN",
    "name": "Mango",
    "latitude": 35.7399,
    "longitude": 86.3334
  },
  {
    "country": "IN",
    "name": "Kollam",
    "latitude": 19.0303,
    "longitude": 93.3588
  },
  {
    "country": "IN",
    "name": "Junagadh",
    "latitude": 24.7628,
    "longitude": 76.9292
  },
  {
    "country": "IN",
    "name": "Vasai-Virar",
    "latitude": 31.1887,
    "longitude": 76.1005
  },
  {
    "country": "IN",
    "name": "Tirupati",
    "latitude": 30.6776,
    "longitude": 81.2228
  },
  {
    "country": "IN",
    "name": "Rampur",
    "latitude": 28.1965,
    "longitude": 89.9942
  },
  {
    "country": "IN",
    "name": "Solapur",
    "latitude": 34.9013,
    "longitude": 94.848
  },
  {
    "country": "IN",
    "name": "Bilaspur",
    "latitude": 10.3368,
    "longitude": 70.894
  },
  {
    "country": "IN",
    "name": "Bhavnagar",
    "latitude": 8.2265,
    "longitude": 82.4482
  },
  {
    "country": "IN",
    "name": "Belgaum",
    "latitude": 19.1639,
    "longitude": 82.1698
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 36.4977,
    "longitude": 78.2424
  },
  {
    "country": "IN",
    "name": "Rourkela",
    "latitude": 27.2756,
    "longitude": 89.249
  },
  {
    "country": "IN",
    "name": "Bokaro",
    "latitude": 16.3862,
    "longitude": 81.1906
  },
  {
    "country": "IN",
    "name": "Delhi",
    "latitude": 13.1331,
    "longitude": 93.5265
  },
  {
    "country": "IN",
    "name": "Satna",
    "latitude": 12.0146,
    "longitude": 92.2512
  },
  {
    "country": "IN",
    "name": "Tumkur",
    "latitude": 13.7164,
    "longitude": 79.2407
  },
  {
    "country": "IN",
    "name": "Mumbai",
    "latitude": 12.2505,
    "longitude": 82.3448
  },
  {
    "country": "IN",
    "name": "Rampur",
    "latitude": 10.6372,
    "longitude": 86.2389
  },
  {
    "country": "IN",
    "name": "Davanagere",
    "latitude": 9.6672,
    "longitude": 82.0699
  },
  {
    "country": "IN",
    "name": "Jalgaon",
    "latitude": 19.948,
    "longitude": 85.1451
  },
  {
    "country": "IN",
    "name": "Ulhasnagar",
    "latitude": 36.8197,
    "longitude": 96.4961
  },
  {
    "country": "IN",
    "name": "Bellary",
    "latitude": 25.8022,
    "longitude": 69.1996
  },
  {
    "country": "IN",
    "name": "Kharagpur",
    "latitude": 14.5307,
    "longitude": 70.7028
  },
  {
    "country": "IN",
    "name": "Thanjavur",
    "latitude": 31.1381,
    "longitude": 70.9783
  },
  {
    "country": "IN",
    "name": "Parbhani",
    "latitude": 19.2979,
    "longitude": 88.4213
  },
  {
    "country": "IN",
    "name": "Ozhukarai",
    "latitude": 31.453,
    "longitude": 74.2597
  },
  {
    "country": "IN",
    "name": "Dehradun",
    "latitude": 16.7134,
    "longitude": 69.0663
  },
  {
    "country": "IN",
    "name": "Purnia",
    "latitude": 27.3695,
    "longitude": 78.5381
  },
  {
    "country": "IN",
    "name": "Davanagere",
    "latitude": 23.4572,
    "longitude": 94.2639
  },
  {
    "country": "IN",
    "name": "Jamshedpur",
    "latitude": 22.5948,
    "longitude": 86.3406
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 21.9215,
    "longitude": 85.4732
  },
  {
    "country": "IN",
    "name": "Ozhukarai",
    "latitude": 14.8922,
    "longitude": 76.6412
  },
  {
    "country": "IN",
    "name": "Pune",
    "latitude": 28.8225,
    "longitude": 89.788
  },
  {
    "country": "IN",
    "name": "Ahmednagar",
    "latitude": 23.7386,
    "longitude": 72.3547
  },
  {
    "country": "IN",
    "name": "Dhanbad",
    "latitude": 20.5818,
    "longitude": 72.976
  },
  {
    "country": "IN",
    "name": "Ichalkaranji",
    "latitude": 9.0139,
    "longitude": 74.201
  },
  {
    "country": "IN",
    "name": "Kurnool",
    "latitude": 27.8618,
    "longitude": 93.9576
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 19.2379,
    "longitude": 71.7837
  },
  {
    "country": "IN",
    "name": "Shivpuri",
    "latitude": 34.7938,
    "longitude": 84.4158
  },
  {
    "country": "IN",
    "name": "Mango",
    "latitude": 24.3132,
    "longitude": 82.4608
  },
  {
    "country": "IN",
    "name": "Raipur",
    "latitude": 31.1955,
    "longitude": 75.5807
  },
  {
    "country": "IN",
    "name": "Shivpuri",
    "latitude": 26.2761,
    "longitude": 82.4718
  },
  {
    "country": "IN",
    "name": "Parbhani",
    "latitude": 31.4588,
    "longitude": 88.7908
  },
  {
    "country": "IN",
    "name": "Bhilai",
    "latitude": 17.3425,
    "longitude": 68.8398
  },
  {
    "country": "IN",
    "name": "Alwar",
    "latitude": 15.1544,
    "longitude": 91.5043
  },
  {
    "country": "IN",
    "name": "Vasai-Virar",
    "latitude": 22.4945,
    "longitude": 91.0645
  },
  {
    "country": "IN",
    "name": "Kharagpur",
    "latitude": 28.1842,
    "longitude": 96.9332
  },
  {
    "country": "IN",
    "name": "Shahjahanpur",
    "latitude": 26.9628,
    "longitude": 79.0827
  },
  {
    "country": "IN",
    "name": "Ranchi",
    "latitude": 34.9586,
    "longitude": 68.8285
  },
  {
    "country": "IN",
    "name": "Chandrapur",
    "latitude": 27.5057,
    "longitude": 83.208
  },
  {
    "country": "IN",
    "name": "Navi Mumbai",
    "latitude": 16.5335,
    "longitude": 83.8768
  },
  {
    "country": "IN",
    "name": "Tirunelveli",
    "latitude": 21.3865,
    "longitude": 77.2348
  },
  {
    "country": "IN",
    "name": "Bellary",
    "latitude": 29.3692,
    "longitude": 71.7057
  },
  {
    "country": "IN",
    "name": "Guwahati",
    "latitude": 28.1923,
    "longitude": 93.172
  },
  {
    "country": "IN",
    "name": "Bellary",
    "latitude": 28.3055,
    "longitude": 94.2555
  },
  {
    "country": "IN",
    "name": "Ozhukarai",
    "latitude": 12.748,
    "longitude": 84.7137
  },
  {
    "country": "IN",
    "name": "Jammu",
    "latitude": 12.6929,
    "longitude": 70.7141
  },
  {
    "country": "IN",
    "name": "Ichalkaranji",
    "latitude": 26.7257,
    "longitude": 91.2041
  },
  {
    "country": "IN",
    "name": "Ozhukarai",
    "latitude": 10.0797,
    "longitude": 76.3442
  },
  {
    "country": "IN",
    "name": "Nangloi Jat",
    "latitude": 13.8766,
    "longitude": 69.7174
  },
  {
    "country": "IN",
    "name": "Bidar",
    "latitude": 28.546,
    "longitude": 74.7024
  },
  {
    "country": "IN",
    "name": "Ozhukarai",
    "latitude": 8.0876,
    "longitude": 72.2651
  },
  {
    "country": "IN",
    "name": "Korba",
    "latitude": 20.0288,
    "longitude": 84.3511
  },
  {
    "country": "IN",
    "name": "Bardhaman",
    "latitude": 11.4012,
    "longitude": 87.2151
  },
  {
    "country": "IN",
    "name": "Ulhasnagar",
    "latitude": 35.7646,
    "longitude": 96.2339
  },
  {
    "country": "IN",
    "name": "Kurnool",
    "latitude": 26.8379,
    "longitude": 95.9125
  },
  {
    "country": "IN",
    "name": "Malegaon",
    "latitude": 13.4906,
    "longitude": 80.2185
  },
  {
    "country": "IN",
    "name": "Bhagalpur",
    "latitude": 12.8272,
    "longitude": 87.3749
  },
  {
    "country": "IN",
    "name": "Aligarh",
    "latitude": 22.2043,
    "longitude": 77.4869
  },
  {
    "country": "IN",
    "name": "Tirupur",
    "latitude": 26.0562,
    "longitude": 82.5485
  },
  {
    "country": "IN",
    "name": "Haridwar",
    "latitude": 36.1033,
    "longitude": 92.8109
  },
  {
    "country": "IN",
    "name": "Nangloi Jat",
    "latitude": 23.0598,
    "longitude": 94.82
  },
  {
    "country": "IN",
    "name": "Chandrapur",
    "latitude": 31.8366,
    "longitude": 91.6895
  },
  {
    "country": "IN",
    "name": "Bhilai",
    "latitude": 32.505,
    "longitude": 68.6301
  },
  {
    "country": "IN",
    "name": "Gorakhpur",
    "latitude": 34.1346,
    "longitude": 92.6438
  },
  {
    "country": "IN",
    "name": "Aizawl",
    "latitude": 18.8822,
    "longitude": 95.4038
  },
  {
    "country": "IN",
    "name": "Bihar Sharif",
    "latitude": 13.7646,
    "longitude": 85.7129
  },
  {
    "country": "IN",
    "name": "Ajmer",
    "latitude": 12.6877,
    "longitude": 94.6197
  },
  {
    "country": "IN",
    "name": "Nashik",
    "latitude": 28.649,
    "longitude": 83.8136
  },
  {
    "country": "IN",
    "name": "Durgapur",
    "latitude": 29.6753,
    "longitude": 88.8785
  },
  {
    "country": "IN",
    "name": "Tumkur",
    "latitude": 14.7693,
    "longitude": 84.5504
  },
  {
    "country": "IN",
    "name": "Vasai-Virar",
    "latitude": 34.6507,
    "longitude": 68.4996
  },
  {
    "country": "IN",
    "name": "Muzaffarpur",
    "latitude": 8.5834,
    "longitude": 95.2013
  },
  {
    "country": "IN",
    "name": "Rohtak",
    "latitude": 36.5211,
    "longitude": 95.5636
  },
  {
    "country": "IN",
    "name": "Mysore",
    "latitude": 22.808,
    "longitude": 96.0249
  },
  {
    "country": "IN",
    "name": "Alwar",
    "latitude": 30.8658,
    "longitude": 76.7911
  },
  {
    "country": "IN",
    "name": "Meerut",
    "latitude": 29.3009,
    "longitude": 87.9216
  },
  {
    "country": "IN",
    "name": "Gurgaon",
    "latitude": 34.6125,
    "longitude": 84.3809
  },
  {
    "country": "IN",
    "name": "Faridabad",
    "latitude": 10.7948,
    "longitude": 83.3306
  },
  {
    "country": "IN",
    "name": "Ichalkaranji",
    "latitude": 21.0797,
    "longitude": 79.2638
  },
  {
    "country": "IN",
    "name": "Cuttack",
    "latitude": 16.1047,
    "longitude": 75.6691
  },
  {
    "country": "IN",
    "name": "Karnal",
    "latitude": 25.1931,
    "longitude": 96.229
  },
  {
    "country": "IN",
    "name": "Thanjavur",
    "latitude": 26.2198,
    "longitude": 93.8219
  },
  {
    "country": "IN",
    "name": "Thane",
    "latitude": 11.9503,
    "longitude": 94.5282
  },
  {
    "country": "IN",
    "name": "Satna",
    "latitude": 20.5008,
    "longitude": 80.8684
  },
  {
    "country": "IN",
    "name": "Amaravati",
    "latitude": 19.7146,
    "longitude": 79.313
  },
  {
    "country": "IN",
    "name": "Dhanbad",
    "latitude": 18.2374,
    "longitude": 93.8709
  },
  {
    "country": "IN",
    "name": "Aizawl",
    "latitude": 29.9728,
    "longitude": 70.91
  },
  {
    "country": "IN",
    "name": "Panihati",
    "latitude": 24.9593,
    "longitude": 71.0582
  },
  {
    "country": "IN",
    "name": "Udaipur",
    "latitude": 35.7557,
    "longitude": 83.3711
  },
  {
    "country": "IN",
    "name": "Mirzapur",
    "latitude": 26.2795,
    "longitude": 89.0199
  },
  {
    "country": "IN",
    "name": "Lucknow",
    "latitude": 12.7877,
    "longitude": 77.4224
  },
  {
    "country": "IN",
    "name": "Varanasi",
    "latitude": 34.4281,
    "longitude": 81.3372
  },
  {
    "country": "IN",
    "name": "Erode",
    "latitude": 33.1779,
    "longitude": 77.9818
  },
  {
    "country": "IN",
    "name": "Rampur",
    "latitude": 34.1841,
    "longitude": 92.5789
  },
  {
    "country": "IN",
    "name": "Parbhani",
    "latitude": 17.0646,
    "longitude": 79.4061
  },
  {
    "country": "IN",
    "name": "Panihati",
    "latitude": 24.3857,
    "longitude": 84.8934
  },
  {
    "country": "IN",
    "name": "Aizawl",
    "latitude": 27.3785,
    "longitude": 77.017
  },
  {
    "country": "IN",
    "name": "Parbhani",
    "latitude": 20.6401,
    "longitude": 74.655
  },
  {
    "country": "IN",
    "name": "Sangli-Miraj & Kupwad",
    "latitude": 17.1252,
    "longitude": 92.4768
  },
  {
    "country": "IN",
    "name": "Nashik",
    "latitude": 14.4789,
    "longitude": 89.4653
  },
  {
    "country": "IN",
    "name": "Hubli-Dharwad",
    "latitude": 15.2116,
    "longitude": 78.7348
  },
  {
    "country": "IN",
    "name": "Khammam",
    "latitude": 26.7471,
    "longitude": 90.3973
  },
  {
    "country": "IN",
    "name": "Bikaner",
    "latitude": 21.2014,
    "longitude": 93.1346
  },
  {
    "country": "IN",
    "name": "Khammam",
    "latitude": 13.7605,
    "longitude": 71.3985
  },
  {
    "country": "IN",
    "name": "Guwahati",
    "latitude": 16.385,
    "longitude": 95.0368
  },
  {
    "country": "IN",
    "name": "Korba",
    "latitude": 18.3535,
    "longitude": 84.9186
  },
  {
    "country": "IN",
    "name": "Shimoga",
    "latitude": 9.5279,
    "longitude": 69.0617
  },
  {
    "country": "IN",
    "name": "Dehradun",
    "latitude": 9.231,
    "longitude": 75.3748
  },
  {
    "country": "IN",
    "name": "Haridwar",
    "latitude": 12.4814,
    "longitude": 86.0793
  },
  {
    "country": "IN",
    "name": "Parbhani",
    "latitude": 27.064,
    "longitude": 77.8062
  },
  {
    "country": "IN",
    "name": "Mirzapur",
    "latitude": 17.2321,
    "longitude": 91.8317
  },
  {
    "country": "IN",
    "name": "Shivpuri",
    "latitude": 19.622,
    "longitude": 95.5823
  },
  {
    "country": "IN",
    "name": "Tirupati",
    "latitude": 26.287,
    "longitude": 84.9582
  },
  {
    "country": "IN",
    "name": "Raipur",
    "latitude": 17.4328,
    "longitude": 80.6463
  },
  {
    "country": "IN",
    "name": "Ozhukarai",
    "latitude": 25.2839,
    "longitude": 85.2527
  },
  {
    "country": "IN",
    "name": "Kulti",
    "latitude": 10.7731,
    "longitude": 87.0072
  },
  {
    "country": "IN",
    "name": "Darbhanga",
    "latitude": 36.255,
    "longitude": 69.2167
  },
  {
    "country": "IN",
    "name": "Mango",
    "latitude": 36.744,
    "longitude": 70.2343
  },
  {
    "country": "IN",
    "name": "Shivpuri",
    "latitude": 30.5481,
    "longitude": 84.0691
  },
  {
    "country": "IN",
    "name": "Kadapa",
    "latitude": 23.8973,
    "longitude": 90.6812
  },
  {
    "country": "IN",
    "name": "Kadapa",
    "latitude": 16.0771,
    "longitude": 87.775
  },
  {
    "country": "IN",
    "name": "Kozhikode",
    "latitude": 26.7352,
    "longitude": 85.8964
  },
  {
    "country": "IN",
    "name": "Vadodara",
    "latitude": 9.6149,
    "longitude": 75.8066
  },
  {
    "country": "IN",
    "name": "Tirupur",
    "latitude": 19.1687,
    "longitude": 84.1862
  },
  {
    "country": "IN",
    "name": "Gandhinagar",
    "latitude": 11.9707,
    "longitude": 79.3656
  },
  {
    "country": "IN",
    "name": "Kadapa",
    "latitude": 21.6956,
    "longitude": 83.3025
  },
  {
    "country": "IN",
    "name": "Ozhukarai",
    "latitude": 26.0744,
    "longitude": 92.0104
  },
  {
    "country": "IN",
    "name": "Rourkela",
    "latitude": 25.9874,
    "longitude": 69.2184
  },
  {
    "country": "IN",
    "name": "Loni",
    "latitude": 36.2989,
    "longitude": 93.737
  },
  {
    "country": "IN",
    "name": "Nangloi Jat",
    "latitude": 22.2976,
    "longitude": 69.11
  },
  {
    "country": "IN",
    "name": "Ambattur",
    "latitude": 18.1715,
    "longitude": 79.2808
  },
  {
    "country": "IN",
    "name": "Shivpuri",
    "latitude": 12.773,
    "longitude": 92.988
  },
  {
    "country": "IN",
    "name": "Bhagalpur",
    "latitude": 33.4159,
    "longitude": 83.162
  },
  {
    "country": "IN",
    "name": "Karnal",
    "latitude": 34.4184,
    "longitude": 85.7892
  },
  {
    "country": "IN",
    "name": "Ludhiana",
    "latitude": 24.4111,
    "longitude": 83.5856
  },
  {
    "country": "IN",
    "name": "Lucknow",
    "latitude": 24.9007,
    "longitude": 84.5299
  },
  {
    "country": "IN",
    "name": "Udaipur",
    "latitude": 33.0092,
    "longitude": 84.6242
  },
  {
    "country": "IN",
    "name": "Nangloi Jat",
    "latitude": 26.4696,
    "longitude": 86.2071
  },
  {
    "country": "IN",
    "name": "Nangloi Jat",
    "latitude": 35.6659,
    "longitude": 74.3659
  },
  {
    "country": "IN",
    "name": "Tumkur",
    "latitude": 27.2911,
    "longitude": 90.7416
  },
  {
    "country": "IN",
    "name": "Solapur",
    "latitude": 15.5876,
    "longitude": 80.5714
  },
  {
    "country": "IN",
    "name": "Ichalkaranji",
    "latitude": 11.5983,
    "longitude": 85.2792
  },
  {
    "country": "IN",
    "name": "Gulbarga",
    "latitude": 12.4114,
    "longitude": 88.8184
  },
  {
    "country": "IN",
    "name": "Bhilwara",
    "latitude": 30.8563,
    "longitude": 87.0454
  },
  {
    "country": "IN",
    "name": "Thanjavur",
    "latitude": 15.5335,
    "longitude": 94.7545
  },
  {
    "country": "IN",
    "name": "Mango",
    "latitude": 11.289,
    "longitude": 90.0846
  },
  {
    "country": "IN",
    "name": "Satna",
    "latitude": 27.6072,
    "longitude": 95.5433
  },
  {
    "country": "IN",
    "name": "Tumkur",
    "latitude": 11.6708,
    "longitude": 68.3738
  },
  {
    "country": "IN",
    "name": "Udaipur",
    "latitude": 28.0709,
    "longitude": 94.7948
  },
  {
    "country": "IN",
    "name": "Bilaspur",
    "latitude": 32.6554,
    "longitude": 77.9017
  },
  {
    "country": "IN",
    "name": "Madurai",
    "latitude": 20.5945,
    "longitude": 89.9515
  },
  {
    "country": "IN",
    "name": "Tumkur",
    "latitude": 31.9126,
    "longitude": 94.992
  },
  {
    "country": "IN",
    "name": "Purnia",
    "latitude": 36.0426,
    "longitude": 83.8011
  },
  {
    "country": "IN",
    "name": "Agartala",
    "latitude": 15.7561,
    "longitude": 84.4572
  },
  {
    "country": "IN",
    "name": "Vasai-Virar",
    "latitude": 15.3367,
    "longitude": 86.1576
  },
  {
    "country": "IN",
    "name": "Mangalore",
    "latitude": 36.5021,
    "longitude": 71.5676
  },
  {
    "country": "IN",
    "name": "Korba",
    "latitude": 34.0481,
    "longitude": 81.138
  },
  {
    "country": "IN",
    "name": "Satna",
    "latitude": 11.9079,
    "longitude": 72.0618
  },
  {
    "country": "IN",
    "name": "Moradabad",
    "latitude": 13.9472,
    "longitude": 72.9654
  },
  {
    "country": "IN",
    "name": "Vijayawada",
    "latitude": 15.666,
    "longitude": 80.2867
  },
  {
    "country": "IN",
    "name": "Bardhaman",
    "latitude": 31.9909,
    "longitude": 93.472
  },
  {
    "country": "IN",
    "name": "Thanjavur",
    "latitude": 18.3684,
    "longitude": 72.7407
  },
  {
    "country": "IN",
    "name": "Haridwar",
    "latitude": 26.7615,
    "longitude": 85.8509
  },
  {
    "country": "IN",
    "name": "Thanjavur",
    "latitude": 27.8307,
    "longitude": 80.7215
  },
  {
    "country": "IN",
    "name": "Bally",
    "latitude": 16.5373,
    "longitude": 76.7539
  }
]