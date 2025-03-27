import API_KEY from "./config.js";
class WeatherAPI {
  constructor() {
    this.baseURL = "https://api.openweathermap.org/data/2.5";
  }
  async getCurrentWeather(city) {
    try {
      const response = await fetch(
        `${this.baseURL}/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) throw new Error("City not found");
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
  async getForecast(city) {
    try {
      const response = await fetch(
        `${this.baseURL}/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) {
        throw new Error("Forecast data not available");
        return await response.json();
      }
    } catch (error) {
      throw error;
    }
  }
  async getWeatherByCoords(lat, lon) {
    try {
      const response = await fetch(
        `${this.baseURL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      if (!response.ok) {
        throw new Error("Location not found");
        return await response.json();
      }
    } catch (error) {
      throw error;
    }
  }
}
export default new WeatherAPI();
