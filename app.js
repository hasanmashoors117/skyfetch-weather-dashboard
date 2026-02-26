function WeatherApp(apiKey) {
  this.apiKey = apiKey;

  // UI Elements
  this.cityInput = document.getElementById("cityInput");
  this.searchBtn = document.getElementById("searchBtn");

  this.cityEl = document.getElementById("city");
  this.tempEl = document.getElementById("temperature");
  this.descEl = document.getElementById("description");
  this.iconEl = document.getElementById("icon");

  this.errorEl = document.getElementById("error");
  this.loadingEl = document.getElementById("loading");

  this.forecastContainer = document.getElementById("forecast-container");

  // Bind events (use .bind(this) as required)
  this.searchBtn.addEventListener("click", this.handleSearch.bind(this));
  this.cityInput.addEventListener("keypress", this.handleEnter.bind(this));
}

WeatherApp.prototype.showLoading = function () {
  this.loadingEl.style.display = "block";
  this.searchBtn.disabled = true;
};

WeatherApp.prototype.hideLoading = function () {
  this.loadingEl.style.display = "none";
  this.searchBtn.disabled = false;
};

WeatherApp.prototype.showError = function (msg) {
  this.errorEl.textContent = msg;
};

WeatherApp.prototype.clearError = function () {
  this.errorEl.textContent = "";
};

WeatherApp.prototype.clearForecast = function () {
  this.forecastContainer.innerHTML = "";
};

WeatherApp.prototype.buildUrls = function (city) {
  var currentUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    encodeURIComponent(city) +
    "&appid=" +
    this.apiKey +
    "&units=metric";

  // 5-day / 3-hour forecast API
  var forecastUrl =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    encodeURIComponent(city) +
    "&appid=" +
    this.apiKey +
    "&units=metric";

  return { currentUrl: currentUrl, forecastUrl: forecastUrl };
};

WeatherApp.prototype.fetchWeatherAndForecast = async function (city) {
  try {
    this.clearError();
    this.showLoading();
    this.clearForecast();

    var urls = this.buildUrls(city);

    // Promise.all = fetch both APIs together
    var results = await Promise.all([
      axios.get(urls.currentUrl),
      axios.get(urls.forecastUrl),
    ]);

    var currentData = results[0].data;
    var forecastData = results[1].data;

    this.renderCurrent(currentData);
    this.renderForecast(forecastData);
  } catch (err) {
    this.showError("City not found or API error. Please try again.");
  } finally {
    this.hideLoading();
  }
};

WeatherApp.prototype.renderCurrent = function (data) {
  this.cityEl.textContent = data.name;
  this.tempEl.textContent = "Temperature: " + data.main.temp + "\u00B0C";
  this.descEl.textContent = data.weather[0].description;

  var iconCode = data.weather[0].icon;
  this.iconEl.src = "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";
};

WeatherApp.prototype.pickDailyForecasts = function (forecastList) {
  // forecastList has data every 3 hours.
  // We pick one item per day near 12:00.
  var byDate = {};
  for (var i = 0; i < forecastList.length; i++) {
    var item = forecastList[i];
    var dateStr = item.dt_txt.split(" ")[0]; // YYYY-MM-DD
    if (!byDate[dateStr]) byDate[dateStr] = [];
    byDate[dateStr].push(item);
  }

  var dates = Object.keys(byDate).slice(0, 6); // includes today, we will skip today if needed

  var picked = [];
  for (var d = 0; d < dates.length; d++) {
    var dayItems = byDate[dates[d]];
    var best = dayItems[0];
    var bestDiff = 999;

    for (var j = 0; j < dayItems.length; j++) {
      var timePart = dayItems[j].dt_txt.split(" ")[1]; // HH:MM:SS
      var hour = parseInt(timePart.split(":")[0], 10);
      var diff = Math.abs(hour - 12);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = dayItems[j];
      }
    }
    picked.push(best);
  }

  // Keep 5 days (if picked includes today, it still counts as one)
  return picked.slice(0, 5);
};

WeatherApp.prototype.formatDay = function (dateText) {
  var date = new Date(dateText);
  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[date.getDay()];
};

WeatherApp.prototype.renderForecast = function (forecastData) {
  var list = forecastData.list;
  var daily = this.pickDailyForecasts(list);

  this.forecastContainer.innerHTML = "";

  for (var i = 0; i < daily.length; i++) {
    var item = daily[i];
    var dayName = this.formatDay(item.dt_txt);

    var temp = item.main.temp;
    var desc = item.weather[0].description;
    var iconCode = item.weather[0].icon;

    var card = document.createElement("div");
    card.className = "forecast-card";

    card.innerHTML =
      "<h3>" +
      dayName +
      "</h3>" +
      "<img src='https://openweathermap.org/img/wn/" +
      iconCode +
      "@2x.png' alt='icon' />" +
      "<p>" +
      desc +
      "</p>" +
      "<p><b>" +
      temp +
      "\u00B0C</b></p>";

    this.forecastContainer.appendChild(card);
  }
};

WeatherApp.prototype.handleSearch = function () {
  var city = this.cityInput.value.trim();
  if (city === "") {
    this.showError("Please enter a city name.");
    return;
  }
  this.fetchWeatherAndForecast(city);
  this.cityInput.value = "";
};

WeatherApp.prototype.handleEnter = function (e) {
  if (e.key === "Enter") {
    this.handleSearch();
  }
};

// ---- App Start ----
var app = new WeatherApp("1b84248fba7ed7cc40f56bb0b3edc1a5");
app.fetchWeatherAndForecast("London");