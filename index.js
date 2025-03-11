this.apikey = key;

// gets all weather data for the given city
function searchCity() {
    city = document.getElementById("cityName").value;
    url = `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&units=metric&APPID=${this.apikey}`;
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

// make tiles visible if search succeeds
function displayData(data) {
    document.getElementById("row1").style.display = "flex";
    document.getElementById("row2").style.display = "flex";
    document.getElementById("result-display").style.display = "block";
    setPrecipData(data);
    setResultDisplay(data);
}

// set the values in the result display
function setResultDisplay(data) {
    if (Object.hasOwn(data, 'name')) {
        if (Object.hasOwn(data, 'sys') && Object.hasOwn(data.sys, 'country')) {
            document.getElementById("location-name").innerHTML = data.name + ", " + data.sys.country;
        }
        else {
            document.getElementById("location-name").innerHTML = data.name;
        }
    }
    else {
        document.getElementById("location-name").innerHTML = "Error";
    }
}

// set the values in the precipitation tile
function setPrecipData(data) {
    if (Object.hasOwn(data, 'rain')) {
        document.getElementById("precip-amt").innerHTML = "Rain: " + data.rain["1h"] + "mm/h";
    }
    else if (Object.hasOwn(data, 'snow')) {
        document.getElementById("precip-amt").innerHTML = "Snow: " + data.snow["1h"] + "mm/h";
    }
    else {
        document.getElementById("precip-amt").innerHTML = "No Precipitation";
    }
}