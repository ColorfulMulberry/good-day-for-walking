# good-day-for-walking
 Is it a good day for walking outside? Type in your city's name and find out.


_good-day-for-walking_ is a website built to create recommendations for or against going outside. It only requires a city's name to work, and optionally a country name if the default result is located in a different country (e.g. London, GB instead of London, CA).

The website gathers current weather data from a weather service, then uses that data to determine if going outside to walk is recommended or not.

## How to use

1. Open the [website](https://colorfulmulberry.github.io/good-day-for-walking/).
   
2. Enter the name of a real city into the `City Name` box.
   
   Optionally, you can specify a country name in the `Country Name` box if the result location was not what you were expecting.

3. Press the `Search` button, or use the Enter key on your keyboard to do a search for the city.

4. If a valid location name was entered, the results should now appear on the screen underneath the search section.

   An error message will show up if there was a problem with the search. Check your input for mistakes and re-do the search if this happens.

## Credits

Weather data used in this website were provided courtesy of OpenWeather's API endpoints.

More specifically, the [Geocoding API](https://openweathermap.org/api/geocoding-api) was used for finding co-ordinates, the [Current Weather Data API](https://openweathermap.org/current) for weather data, and finally the [Air Pollution API](https://openweathermap.org/api/air-pollution) for air quality data. Additionally, OpenWeather's [Weather Icons](https://openweathermap.org/weather-conditions) were used to accompany each weather condition. 
