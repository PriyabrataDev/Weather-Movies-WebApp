const weatherForm = document.getElementById("weatherSearchForm");
const cityInput = document.getElementById("tmc");
const weatherOutput = document.getElementById("mkc");
const weatherSubmitButton = document.getElementById("submitbtn");
const openWeatherApiKey = process.env.API_KEY;

function showWeatherMessage(message, isError = false) {
    const paragraph = document.createElement("p");
    paragraph.className = isError ? "status-message status-error" : "status-message";
    paragraph.textContent = message;
    weatherOutput.replaceChildren(paragraph);
}

function addWeatherStat(container, label, value) {
    const stat = document.createElement("div");
    stat.className = "weather-stat";
    const name = document.createElement("span");
    name.textContent = label;
    const reading = document.createElement("strong");
    reading.textContent = value;
    stat.append(name, reading);
    container.append(stat);
}

function renderWeather(data) {
    const card = document.createElement("article");
    card.className = "weather-card";

    const location = document.createElement("h2");
    location.className = "weather-location";
    location.textContent = `${data.name}${data.sys?.country ? `, ${data.sys.country}` : ""}`;

    const condition = document.createElement("p");
    condition.className = "weather-condition";
    condition.textContent = data.weather?.[0]?.description || "Current conditions";

    const temperature = document.createElement("p");
    temperature.className = "temperature";
    temperature.textContent = `${Math.round(data.main.temp)}°`;

    const stats = document.createElement("div");
    stats.className = "weather-grid";
    addWeatherStat(stats, "Feels like", `${Math.round(data.main.feels_like)}°C`);
    addWeatherStat(stats, "Humidity", `${data.main.humidity}%`);
    addWeatherStat(stats, "Pressure", `${data.main.pressure} hPa`);
    addWeatherStat(stats, "High", `${Math.round(data.main.temp_max)}°C`);
    addWeatherStat(stats, "Low", `${Math.round(data.main.temp_min)}°C`);
    addWeatherStat(stats, "Wind", `${data.wind.speed} m/s`);

    if (Number.isFinite(data.wind.deg)) {
        addWeatherStat(stats, "Wind direction", `${data.wind.deg}°`);
    }
    if (Number.isFinite(data.wind.gust)) {
        addWeatherStat(stats, "Wind gust", `${data.wind.gust} m/s`);
    }

    card.append(location, condition, temperature, stats);
    weatherOutput.replaceChildren(card);
}

weatherForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();

    if (!city) {
        showWeatherMessage("Enter a city name to search.", true);
        cityInput.focus();
        return;
    }

    weatherOutput.setAttribute("aria-busy", "true");
    weatherSubmitButton.disabled = true;
    showWeatherMessage(`Searching for ${city}…`);

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${openWeatherApiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 404) {
                showWeatherMessage("We couldn't find that city. Check the name and try again.", true);
                return;
            }
            throw new Error(data.message || `Weather request failed with status ${response.status}`);
        }

        renderWeather(data);
    } catch (error) {
        console.error("Unable to fetch weather:", error);
        showWeatherMessage("Something went wrong while loading the weather. Please try again.", true);
    } finally {
        weatherOutput.setAttribute("aria-busy", "false");
        weatherSubmitButton.disabled = false;
    }
});
