// finds a city given a mandatory city name and optional country name
function searchCity() {
    this.apikey = key;
    let city = document.getElementById("cityName").value;
    let country = document.getElementById("countryName").value;
    this.lat = 0;
    this.lon = 0;
    // using the city name returned from geocoding since weather api can return incorrect city name
    this.cityName = "";
    this.countryCode = "";

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
                if (Object.hasOwn(data[0], 'country')) this.countryCode = data[0].country;
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
    if (this.cityName) {
        if (this.countryCode) {
            document.getElementById("location-name").innerHTML = this.cityName
                + ", " + getCountryName(this.countryCode)
                + " " + isoToUnicode(this.countryCode);
        }
        else {
            document.getElementById("location-name").innerHTML = this.cityName;
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
    document.getElementById("score-summary").innerHTML = scoreVals.scoreSummary;
}

// set the values in the precipitation tile
function setPrecipitation(data) {
    if (Object.hasOwn(data, 'rain') && Object.hasOwn(data.rain, '1h')) {
        document.getElementById("precip-amt").innerHTML = `Rain - ${data.rain["1h"]} mm/h`;
    }
    else if (Object.hasOwn(data, 'snow') && Object.hasOwn(data.snow, '1h')) {
        document.getElementById("precip-amt").innerHTML = `Snow - ${data.snow["1h"]} mm/h`;
    }
    else {
        document.getElementById("precip-amt").innerHTML = "0 mm/h";
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
        4: "Bad",
        3: "Below Average",
        2: "Average",
        1: "Good",
        0: "Excellent"
    };
    const scoreText = {
        4: "It's a bad day for walking outside.",
        3: "It's a below average day for walking outside.",
        2: "It's an okay day for walking outside.",
        1: "It's a good day for walking outside.",
        0: "It's an excellent day for walking outside.",
    };
    let mainWeather = "";
    let [airScore, windScore, precipScore, tempScore] = [0, 0, 0, 0];
    // summary for each of the four criteria
    let [airSumm, windSumm, precipSumm, tempSumm] = ["(air quality)", "(wind speed)", "(precipitation)", "(temperature)"];
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
            return { score: score[4], scoreText: scoreText[4], scoreSummary: "Extreme weather conditions present." + inadvisable };
    }

    // more "killer" conditions
    // check for moderate rain (>4 mm/h)
    if (Object.hasOwn(weatherData, "rain") && weatherData.rain["1h"] >= 4) {
        return { score: score[4], scoreText: scoreText[4], scoreSummary: "Very heavy rainfall present." + inadvisable };
    }
    // check for heavy snow (>15 mm/h)
    else if (Object.hasOwn(weatherData, "snow") && weatherData.snow["1h"] >= 15) {
        return { score: score[4], scoreText: scoreText[4], scoreSummary: "Very heavy snowfall present." + inadvisable };
    }
    // check for extremely poor air quality (aqi 5)
    else if (Object.hasOwn(airData, 'list') && Object.hasOwn(airData.list[0], 'main')
        && Object.hasOwn(airData.list[0].main, 'aqi') && airData.list[0].main.aqi === 5) {
        return { score: score[4], scoreText: scoreText[4], scoreSummary: "Extremely poor air quality present." + inadvisable };
    }
    // check for extremely low or high temperatures (>40C or <-20C)
    else if (Object.hasOwn(weatherData, "main") && Object.hasOwn(weatherData.main, "temp")) {
        let temperature = weatherData.main.temp;
        if (temperature >= 40) {
            return { score: score[4], scoreText: scoreText[4], scoreSummary: "Extremely high outdoor temperatures present." + inadvisable };
        }
        else if (temperature <= -20) {
            return { score: score[4], scoreText: scoreText[4], scoreSummary: "Extremely low outdoor temperatures present." + inadvisable };
        }
    }
    // check for very strong wind (>62km/h)
    else if (Object.hasOwn(weatherData, 'wind')
        && Object.hasOwn(weatherData.wind, 'speed')
        && (Math.round(weatherData.wind.speed * 36) / 10) >= 62) {
        return { score: score[4], scoreText: scoreText[4], scoreSummary: "Extremely strong winds present." + inadvisable };
    }

    // calculate the air quality score
    if (Object.hasOwn(airData, 'list')
        && Object.hasOwn(airData.list[0], 'main')
        && Object.hasOwn(airData.list[0].main, 'aqi')) {
        let aqi = airData.list[0].main.aqi;
        if (aqi === 1) [airSumm, airScore] = ["good", 0];
        else if (aqi === 2) [airSumm, airScore] = ["fair", 0];
        else if (aqi === 3) [airSumm, airScore] = ["moderate", 1];
        else[airSumm, airScore] = ["poor", 2];
    }

    // calculate wind speed score
    if (Object.hasOwn(weatherData, 'wind')
        && Object.hasOwn(weatherData.wind, 'speed')) {
        let wind = Math.round(weatherData.wind.speed * 36) / 10;
        if (wind < 12) [windSumm, windScore] = ["light", 0];
        else if (wind < 29) [windSumm, windScore] = ["moderate", 1];
        else if (wind < 40) [windSumm, windScore] = ["strong", 2];
        else[windSumm, windScore] = ["very strong", 3];
    }

    // calculate temperature score
    if (Object.hasOwn(weatherData, 'main') && Object.hasOwn(weatherData.main, 'temp')) {
        let temperature = weatherData.main.temp;
        if (temperature < -10) [tempSumm, tempScore] = ["very cold", 3];
        else if (temperature < 5) [tempSumm, tempScore] = ["cold", 2];
        else if (temperature < 20) [tempSumm, tempScore] = ["somewhat cold", 1];
        else if (temperature < 25) [tempSumm, tempScore] = ["ideal", 0];
        else if (temperature < 30) [tempSumm, tempScore] = ["somewhat warm", 1];
        else if (temperature < 35) [tempSumm, tempScore] = ["warm", 2];
        else[tempSumm, tempScore] = ["very warm", 3];
    }

    // calculate precipitation score
    if (Object.hasOwn(weatherData, 'rain') && Object.hasOwn(weatherData.rain, '1h')) {
        let rain = weatherData.rain["1h"];
        if (rain < 0.5) [precipSumm, precipScore] = ["Very light rain", 1];
        else if (rain < 3) [precipSumm, precipScore] = ["Light rain", 2];
        else[precipSumm, precipScore] = ["Moderate rain", 3];
    }
    else if (Object.hasOwn(weatherData, 'snow') && Object.hasOwn(weatherData.snow, '1h')) {
        let snow = weatherData.snow["1h"];
        if (snow < 5) [precipSumm, precipScore] = ["Very light snow", 1];
        if (snow < 10) [precipSumm, precipScore] = ["Light snow", 2];
        else[precipSumm, precipScore] = ["Moderate snow", 1];
    }
    else[precipSumm, precipScore] = ["No precipitation", 0];

    // 0 = Excellent, 1 = Good, 2 = Average, 3 = Below Average
    // worst (largest) score determines the overall score
    let scoreRes = Math.max(precipScore, tempScore, airScore, windScore);

    // return the results of the calculations
    return {
        score: score[scoreRes],
        scoreText: scoreText[scoreRes],
        scoreSummary: `${precipSumm} forecasted. The temperature will be ${tempSumm},
        with ${windSumm} winds and ${airSumm} air quality.`
    };
}