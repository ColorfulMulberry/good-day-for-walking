// finds a city given a mandatory city name and optional country name
function searchCity() {
    this.apikey = key;
    let city = document.getElementById("cityName").value;
    let country = document.getElementById("countryName").value;
    this.lat = 0;
    this.lon = 0;
    // using the city name returned from geocoding since weather api can return incorrect city name
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
            setResultDisplay(weatherData, data);
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
    setTemperature(data);
    setWindSpeed(data);

    fetchAirQuality(data);
}

// set the values in the result display
function setResultDisplay(weatherData, airData) {
    if (Object.hasOwn(weatherData, 'name')) {
        if (Object.hasOwn(weatherData, 'sys') && Object.hasOwn(weatherData.sys, 'country')) {
            if (getCountryName(weatherData.sys.country)) {
                console.log(weatherData.sys.country);
                document.getElementById("location-name").innerHTML = this.cityName + ", " + getCountryName(weatherData.sys.country) + " " + isoToUnicode(weatherData.sys.country);
            }
            else {
                document.getElementById("location-name").innerHTML = this.cityName;
            }
        }
        else {
            document.getElementById("location-name").innerHTML = weatherData.name;
        }
    }
    else {
        document.getElementById("location-name").innerHTML = "Name Not Found";
    }

    if (Object.hasOwn(weatherData, 'weather')) {
        if (Object.hasOwn(weatherData.weather[0], 'icon')) {
            document.getElementById("result-image").src = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
        }
        if (Object.hasOwn(weatherData.weather[0], 'description')) {
            document.getElementById("weather-status").innerHTML = capitalize(weatherData.weather[0].description);
        }
    }

    scoreVals = calcScore(weatherData, airData);
    document.getElementById("score").innerHTML = scoreVals.score;
    document.getElementById("score-text").innerHTML = scoreVals.scoreText;
}

// set the values in the precipitation tile
function setPrecipitation(data) {
    if (Object.hasOwn(data, 'rain')) {
        document.getElementById("precip-amt").innerHTML = `Rain - ${data.rain["1h"]} mm/h`;
    }
    else if (Object.hasOwn(data, 'snow')) {
        document.getElementById("precip-amt").innerHTML = `Snow - ${data.snow["1h"]} mm/h`;
    }
    else {
        document.getElementById("precip-amt").innerHTML = "None";
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

// capitalize a string's first letter of each word, excluding certain words
function capitalize(s) {
    if (s) {
        words = s.split(" ");
        for (let i = 0; i < words.length; i++) {
            if (s !== "with" && s !== "and") {
                words[i] = words[i][0].toUpperCase() + words[i].substr(1);
            }
        }
        return words.join(" ");
    }
    else {
        return "";
    }
}

// calculates the score for how advisable it is to go outside
function calcScore(weatherData, airData) {
    const score = {
        1: "Bad",
        2: "Below Average",
        3: "Average",
        4: "Good",
        5: "Excellent"
    };
    const scoreText = {
        1: "It's a bad day for walking outside.",
        2: "It's a below average day for walking outside.",
        3: "It's an okay day for walking outside.",
        4: "It's a good day for walking outside.",
        5: "It's an excellent day for walking outside.",
        6: "It's a perfect day for walking outside.",
    };
    let mainWeather = "";
    let numScore = 3;
    let airScore = 0;
    let windScore = 0;
    let precipScore = 0;
    let tempScore = 0;
    const inadvisable = " Walking outside is inadvisable.";

    if (Object.hasOwn(weatherData, "weather") && Object.hasOwn(weatherData.weather[0], "main")) {
        mainWeather = weatherData.weather[0].main;
    }
    // "killer" main weather conditions (bad idea to go outside with these conditions)
    switch (mainWeather) {
        case "Dust":
        case "Smoke":
        case "Sand":
        case "Dust":
        case "Ash":
        case "Tornado":
            return { score: score[1], scoreText: scoreText[1] };
    }

    // more "killer" conditions
    // check for moderate rain (>4 mm/h)
    if (Object.hasOwn(weatherData, "rain") && data.rain["1h"] >= 4) {
        return { score: score[1], scoreText: scoreText[1] };
    }
    // check for heavy snow (>15 mm/h)
    else if (Object.hasOwn(weatherData, "snow") && data.snow["1h"] >= 15) {
        return { score: score[1], scoreText: scoreText[1] };
    }
    // check for extremely poor air quality (aqi 5)
    else if (Object.hasOwn(airData, 'list') && Object.hasOwn(airData.list[0], 'main')
        && Object.hasOwn(airData.list[0].main, 'aqi') && airData.list[0].main.aqi === 5) {
        return { score: score[1], scoreText: scoreText[1] };
    }
    // check for extremely low or high temperatures (>40C or <-20C)
    else if (Object.hasOwn(weatherData, "main") && Object.hasOwn(weatherData.main, "temp")
        && (weatherData.main.temp >= 40 || weatherData.main.temp <= -20)) {
        return { score: score[1], scoreText: scoreText[1] };
    }
    // check for very strong wind (>62km/h)
    else if (Object.hasOwn(data, 'wind') && Object.hasOwn(data.wind, 'speed') && (Math.round(data.wind.speed * 36) / 10) >= 62) {
        return { score: score[1], scoreText: scoreText[1] };
    }

    // calculate the air quality score
    if (Object.hasOwn(airData, 'list') && Object.hasOwn(airData.list[0], 'main' && Object.hasOwn(airData.list[0].main, 'aqi'))) {
        airScore = airData.list[0].main.aqi;
        switch (airScore) {
            case 1:
            case 2:
                airScore = 0;
                break;
            case 3:
                airScore = 1;
                break;
            case 4:
                airScore = 2;
                break;
        }
    }

    if (Object.hasOwn(data, 'wind') && Object.hasOwn(data.wind, 'speed') && (Math.round(data.wind.speed * 36) / 10) >= 62) {
        wind = Math.round(data.wind.speed * 36) / 10;
        if (wind < 12) {
            windScore = 0;
        }
    }

    // 0 = Excellent, 1 = Good, 2 = Average, 3 = Below Average

    // return the results of the calculations
    return { score: score[numScore], scoreText: scoreText[numScore] };
}