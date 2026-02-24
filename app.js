const apiKey = "1b84248fba7ed7cc40f56bb0b3edc1a5";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityEl = document.getElementById("city");
const tempEl = document.getElementById("temperature");
const descEl = document.getElementById("description");
const iconEl = document.getElementById("icon");
const errorEl = document.getElementById("error");
const loadingEl = document.getElementById("loading");

function showLoading() {
  loadingEl.style.display = "block";
}

function hideLoading() {
  loadingEl.style.display = "none";
}

function showError(msg) {
  errorEl.textContent = msg;
}

function clearError() {
  errorEl.textContent = "";
}

async function getWeather(city) {
  try {
    clearError();
    showLoading();
    searchBtn.disabled = true;

    const url =
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const data = response.data;

    cityEl.textContent = data.name;
    tempEl.textContent =
      "Temperature: " + data.main.temp + "\u00B0C";
    descEl.textContent = data.weather[0].description;

    const iconCode = data.weather[0].icon;
    iconEl.src =
      `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  } catch {
    showError("City not found. Try again.");
  } finally {
    hideLoading();
    searchBtn.disabled = false;
  }
}

searchBtn.addEventListener("click", function () {
  const city = cityInput.value.trim();

  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  getWeather(city);
  cityInput.value = "";
});

cityInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

getWeather("London");