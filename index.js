function searchCity() {
    this.apikey = key;
    let city = document.getElementById("cityName").value;
    let country = document.getElementById("countryName").value;
    this.lat = 0;
    this.lon = 0;
    this.cityName = "";

    // city left empty
    if (!city) {
        displayError("A city name is required for fetching weather data.");
        return false;
    }
    else {
        if (getCountryCode(country.toLowerCase())) {
            country = "," + getCountryCode(country.toLowerCase());
        }
        else if (country != "") { // else country name was not found
            displayError("Invalid country name. Try re-entering it or leave it blank.");
            return false;
        }
    }

    // use the geocoding api to fetch the coordinates of the city being searched
    let url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}${encodeURIComponent(country)}&appid=${this.apikey}`;
    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error("Response from server was not OK.");
            }
            return res.json();
        })
        .then(data => {
            if (data.length != 0) {
                this.lat = data[0].lat;
                this.lon = data[0].lon;
                this.cityName = data[0].name;
                fetchWeather();
            }
            else {
                displayError("Invalid city name. Try re-entering it.");
                return false;
            }
        })
        .catch(err => {
            console.error(err);
        });
}

// gets all weather data for the given city
function fetchWeather() {
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${this.lat}&lon=${this.lon}&appid=${this.apikey}&units=metric`;
    fetch(url)
        .then(res => {
            if (!res.ok) {
                displayError("Response from server was not OK.");
            }
            else {
                return res.json();
            }
        })
        .then(data => {
            displayData(data);
        })
        .catch(err => {
            displayError(err);
        });
}

// gets air quality data for the given city
function fetchAirQuality(weatherData) {
    let url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${this.lat}&lon=${this.lon}&appid=${this.apikey}`;
    fetch(url)
        .then(res => {
            if (!res.ok) {
                displayError("Response from server was not OK.");
            }
            else {
                return res.json();
            }
        })
        .then(data => {
            setAirQuality(data);
        })
        .catch(err => {
            displayError(err);
        });
}

function displayError(errorMsg) {
    // hide result components, show error component
    document.getElementById("row1").style.display = "none";
    document.getElementById("row2").style.display = "none";
    document.getElementById("result-display").style.display = "none";
    document.getElementById("error-display").style.display = "block";

    document.getElementById("err-msg").innerHTML = errorMsg;
}

// make tiles visible if search succeeds
function displayData(data) {
    // make results components visible, hide error component
    document.getElementById("row1").style.display = "flex";
    document.getElementById("row2").style.display = "flex";
    document.getElementById("result-display").style.display = "block";
    document.getElementById("error-display").style.display = "none";

    // set text fields in result components
    setPrecipitation(data);
    setResultDisplay(data);
    setTemperature(data);
    setWindSpeed(data);

    fetchAirQuality(data);
}

// set the values in the result display
function setResultDisplay(data) {
    if (Object.hasOwn(data, 'name')) {
        if (Object.hasOwn(data, 'sys') && Object.hasOwn(data.sys, 'country')) {
            if (getCountryName(data.sys.country)) {
                console.log(data.sys.country);
                document.getElementById("location-name").innerHTML = this.cityName + ", " + getCountryName(data.sys.country);
            }
            else {
                document.getElementById("location-name").innerHTML = this.cityName;
            }
        }
        else {
            document.getElementById("location-name").innerHTML = data.name;
        }
    }
    else {
        document.getElementById("location-name").innerHTML = "Name Not Found";
    }

    if (Object.hasOwn(data, 'weather') && Object.hasOwn(data.weather[0], 'icon')) {
        console.log("hi");
        document.getElementById("result-weather").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
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