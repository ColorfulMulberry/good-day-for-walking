function searchCity() {
    let apikey = key;
    let city = document.getElementById("cityName").value;
    let country = document.getElementById("countryName").value;

    // city left empty
    if (!city) {
        document.getElementById("result").innerHTML = "A city name is required for fetching weather data.";
    }
    else {
        if (getCountryCode(country.toLowerCase())) {
            country = "," + getCountryCode(country.toLowerCase());
        }
        else if (country != "") { // else country name was not found
            document.getElementById("result").innerHTML = "Invalid country name. Try re-entering it or leaving it blank.";
            country = "";
        }
    }

    // use the geocoding api to fetch the coordinates of the city being searched
    let url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}${country}&appid=${apikey}`;
    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error("Response from server was not OK.");
            }
            return res.json();
        })
        .then(data => {
            if (data) {
                let lat = data[0].lat;
                let lon = data[0].lon;
                fetchWeather(lat, lon, apikey);
                fetchAirQuality(lat, lon, apikey);
            }
        })
        .catch(err => {
            console.error(err);
        });
}

// gets all weather data for the given city
function fetchWeather(lat, lon, apikey) {
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apikey}&units=metric`;
    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error("Response from server was not OK.");
            }
            return res.json();
        })
        .then(data => {
            displayData(data);
        })
        .catch(err => {
            console.error(err);
        });
}

// gets air quality data for the given city
function fetchAirQuality(lat, lon, apikey) {
    let url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apikey}`;
    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error("Response from server was not OK.");
            }
            return res.json();
        })
        .then(data => {
            setAirQuality(data);
        })
        .catch(err => {
            console.error(err);
        });
}

// make tiles visible if search succeeds
function displayData(data) {
    document.getElementById("row1").style.display = "flex";
    document.getElementById("row2").style.display = "flex";
    document.getElementById("result-display").style.display = "block";
    setPrecipitation(data);
    setResultDisplay(data);
    setTemperature(data);
    setWindSpeed(data);
}

// set the values in the result display
function setResultDisplay(data) {
    if (Object.hasOwn(data, 'name')) {
        if (Object.hasOwn(data, 'sys') && Object.hasOwn(data.sys, 'country')) {
            document.getElementById("location-name").innerHTML = data.name + ", " + getCountryName(data.sys.country);
        }
        else {
            document.getElementById("location-name").innerHTML = data.name;
        }
    }
    else {
        document.getElementById("location-name").innerHTML = "Name Not Found";
    }
}

// set the values in the precipitation tile
function setPrecipitation(data) {
    if (Object.hasOwn(data, 'rain')) {
        document.getElementById("precip-amt").innerHTML = `Rain - ${data.rain["1h"]} mm/hour`;
    }
    else if (Object.hasOwn(data, 'snow')) {
        document.getElementById("precip-amt").innerHTML = `Snow - ${data.snow["1h"]} mm/hour`;
    }
    else {
        document.getElementById("precip-amt").innerHTML = "No Precipitation";
    }
}

// set the values in the temperature tile
function setTemperature(data) {
    if (Object.hasOwn(data, 'main') && Object.hasOwn(data.main, 'temp')) {
        document.getElementById("current-temp").innerHTML = data.main.temp + "°C";
    }
    else {
        document.getElementById("current-temp").innerHTML = "[No Temperature Data Found]";
    }
}

// set the values in the wind speed tile
function setWindSpeed(data) {
    if (Object.hasOwn(data, 'wind') && Object.hasOwn(data.wind, 'speed')) {
        document.getElementById("wind").innerHTML = Math.round(data.wind.speed * 36) / 10 + " km/h";
    }
    else {
        document.getElementById("wind").innerHTML = "[No Wind Speed Data Found]";
    }
}

// set the values in the wind speed tile
function setAirQuality(data) {
    const scores = {
        1: 'Good',
        2: 'Fair',
        3: 'Moderate',
        4: 'Poor',
        5: 'Very Poor',
    }
    if (Object.hasOwn(data, 'list') && Object.hasOwn(data.list[0], 'main') && Object.hasOwn(data.list[0].main, 'aqi')) {
        document.getElementById("aqi").innerHTML = `${data.list[0].main.aqi} (${scores[data.list[0].main.aqi]})`;
    }
    else {
        document.getElementById("aqi").innerHTML = "[No Air Quality Data Found]";
    }
}