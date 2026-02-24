const apiKey = "1b84248fba7ed7cc40f56bb0b3edc1a5";
const city = "London";

const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

axios.get(url)
  .then(function (response) {
    const data = response.data;

    document.getElementById("city").textContent = data.name;

    // Safer degree symbol:
    document.getElementById("temperature").textContent =
      "Temperature: " + data.main.temp + "\u00B0C";

    document.getElementById("description").textContent =
      data.weather[0].description;

    const iconCode = data.weather[0].icon;
    document.getElementById("icon").src =
      `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  })
  .catch(function (error) {
    console.log("Error:", error);
  });