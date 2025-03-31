import WeatherAPI from "./api.js";
import LocalStorageManager from "./storage.js";

class WeatherApp {
  constructor() {
    this.currentUnit = "celsius";
    this.initEventListeners();
    this.displayRecentSearches();
  }

  initEventListeners() {
    document
      .getElementById("search-btn")
      .addEventListener("click", () => this.handleSearch());
    document
      .getElementById("location-btn")
      .addEventListener("click", () => this.getUserLocation());
    document
      .getElementById("celsius-btn")
      .addEventListener("click", () => this.toggleTemperatureUnit("celsius"));
    document
      .getElementById("fahrenheit-btn")
      .addEventListener("click", () =>
        this.toggleTemperatureUnit("fahrenheit")
      );
    document.getElementById("city-search").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleSearch();
    });
  }

  async handleSearch() {
    const cityInput = document.getElementById("city-search");
    const city = cityInput.value.trim();

    if (city) {
      try {
        const currentWeather = await WeatherAPI.getCurrentWeather(city);
        const forecast = await WeatherAPI.getForecast(city);

        this.displayCurrentWeather(currentWeather);
        this.displayForecast(forecast);
        LocalStorageManager.saveRecentSearch(city);
        this.displayRecentSearches();
        cityInput.value = "";
      } catch (error) {
        this.showErrorModal(error.message);
      }
    }
  }

  displayCurrentWeather(data) {
    const cityName = document.getElementById("city-name");
    const weatherIcon = document.getElementById("weather-icon");
    const currentTemp = document.getElementById("current-temp");
    const weatherDesc = document.getElementById("weather-description");
    const humidity = document.getElementById("humidity");
    const windSpeed = document.getElementById("wind-speed");

    cityName.textContent = data.name;
    weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    const temp = this.convertTemperature(data.main.temp);
    currentTemp.textContent = `${temp}°${
      this.currentUnit === "celsius" ? "C" : "F"
    }`;

    weatherDesc.textContent = data.weather[0].description;
    humidity.textContent = data.main.humidity;
    windSpeed.textContent = data.wind.speed.toFixed(1);
  }

  displayForecast(data) {
    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = "";

    const dailyData = this.processforecastData(data.list);

    dailyData.forEach((day) => {
      const forecastDay = document.createElement("div");
      forecastDay.classList.add("forecast-day");

      const temp = this.convertTemperature(day.temp);
      forecastDay.innerHTML = `
                <img src="http://openweathermap.org/img/wn/${
                  day.icon
                }@2x.png" alt="Weather Icon">
                <p>${day.date}</p>
                <p>${temp}°${this.currentUnit === "celsius" ? "C" : "F"}</p>
                <p>${day.description}</p>
            `;

      forecastContainer.appendChild(forecastDay);
    });
  }

  processforecastData(list) {
    const dailyData = {};
    list.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString("en-US", { weekday: "short" });

      if (!dailyData[day]) {
        dailyData[day] = {
          date: day,
          temp: item.main.temp,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
        };
      }
    });

    return Object.values(dailyData).slice(0, 5);
  }

  convertTemperature(temp) {
    return this.currentUnit === "celsius"
      ? temp.toFixed(1)
      : ((temp * 9) / 5 + 32).toFixed(1);
  }

  toggleTemperatureUnit(unit) {
    this.currentUnit = unit;
    const cityName = document.getElementById("city-name").textContent;

    if (cityName !== "Select a City") {
      this.handleSearch();
    }
  }

  displayRecentSearches() {
    const recentSearchesContainer = document.getElementById("recent-searches");
    const searches = LocalStorageManager.getRecentSearches();

    recentSearchesContainer.innerHTML = searches
      .map((city) => `<button class="recent-search">${city}</button>`)
      .join("");

    document.querySelectorAll(".recent-search").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("city-search").value = btn.textContent;
        this.handleSearch();
      });
    });
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const currentWeather = await WeatherAPI.getWeatherByCoords(
              position.coords.latitude,
              position.coords.longitude
            );
            const forecast = await WeatherAPI.getForecast(currentWeather.name);

            this.displayCurrentWeather(currentWeather);
            this.displayForecast(forecast);
            LocalStorageManager.saveRecentSearch(currentWeather.name);
            this.displayRecentSearches();
          } catch (error) {
            this.showErrorModal("Could not retrieve location weather");
          }
        },
        () => {
          this.showErrorModal("Geolocation permission denied");
        }
      );
    } else {
      this.showErrorModal("Geolocation not supported");
    }
  }

  showErrorModal(message) {
    const modal = document.getElementById("error-modal");
    const errorMessage = document.getElementById("error-message");
    const closeBtn = document.querySelector(".close-btn");

    errorMessage.textContent = message;
    modal.style.display = "block";

    closeBtn.onclick = () => {
      modal.style.display = "none";
    };

    window.onclick = (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    };
  }
}

new WeatherApp();
