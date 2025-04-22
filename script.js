const METEO_API_KEY = '';
const GEO_API_URL = 'https://geo.api.gouv.fr/communes';
const METEO_API_URL = 'https://api.meteo-concept.com/api/forecast/daily';

async function fetchCities(zipcode, citySelectId) {
    try {
        const response = await fetch(`${GEO_API_URL}?codePostal=${zipcode}`);
        if (!response.ok) throw new Error('Code postal invalide');
        const cities = await response.json();
        const citySelect = document.getElementById(citySelectId);
        citySelect.innerHTML = '<option value="">Sélectionnez une commune</option>';
        
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = JSON.stringify({
                name: city.nom,
                insee: city.code,
                lat: city.centre.coordinates[1],
                lon: city.centre.coordinates[0]
            });
            option.textContent = city.nom;
            citySelect.appendChild(option);
        });
    } catch (error) {
        displayError(error.message);
    }
}

function displayError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    setTimeout(() => errorDiv.textContent = '', 5000);
}

async function fetchBasicWeather() {
    const zipcode = document.getElementById('zipcode').value;
    const citySelect = document.getElementById('city');
    const cityData = citySelect.value ? JSON.parse(citySelect.value) : null;

    if (!zipcode || !cityData) {
        displayError('Veuillez remplir tous les champs');
        return;
    }

    try {
        const response = await fetch(`${METEO_API_URL}?token=${METEO_API_KEY}&insee=${cityData.insee}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des données météo');
        const data = await response.json();
        const forecast = data.forecast[0];

        const weatherData = {
            city: cityData.name,
            tempMin: forecast.tmin,
            tempMax: forecast.tmax,
            rainProb: forecast.rr10,
            sunHours: forecast.sun_hours,
            weather: forecast.weather
        };

        displayWeather([weatherData]);
    } catch (error) {
        displayError(error.message);
    }
}

async function fetchAdvancedWeather() {
    const zipcode = document.getElementById('adv-zipcode').value;
    const citySelect = document.getElementById('adv-city');
    const days = parseInt(document.getElementById('days').value);
    const cityData = citySelect.value ? JSON.parse(citySelect.value) : null;

    if (!zipcode || !cityData || isNaN(days)) {
        displayError('Veuillez remplir tous les champs correctement');
        return;
    }

    try {
        const response = await fetch(`${METEO_API_URL}/${days}?token=${METEO_API_KEY}&insee=${cityData.insee}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des données météo');
        const data = await response.json();
        const forecasts = data.forecast;

        const showLatitude = document.getElementById('latitude').checked;
        const showLongitude = document.getElementById('longitude').checked;
        const showRain = document.getElementById('rain').checked;
        const showWindSpeed = document.getElementById('wind-speed').checked;
        const showWindDirection = document.getElementById('wind-direction').checked;

        const weatherDataArray = forecasts.map((forecast, index) => ({
            city: cityData.name,
            day: `Jour ${index + 1}`,
            tempMin: forecast.tmin,
            tempMax: forecast.tmax,
            rainProb: forecast.rr10,
            sunHours: forecast.sun_hours,
            weather: forecast.weather,
            latitude: showLatitude ? cityData.lat : null,
            longitude: showLongitude ? cityData.lon : null,
            rain: showRain ? forecast.rr1 : null,
            windSpeed: showWindSpeed ? forecast.wind10m : null,
            windDirection: showWindDirection ? forecast.dirwind10m : null
        }));

        displayWeather(weatherDataArray);
    } catch (error) {
        displayError(error.message);
    }
}

function displayWeather(weatherDataArray) {
    const resultsDiv = document.getElementById('weather-results');
    resultsDiv.innerHTML = '';

    weatherDataArray.forEach(data => {
        const card = document.createElement('div');
        card.className = 'weather-card';
        card.setAttribute('role', 'region');
        card.setAttribute('aria-label', `Prévisions météo pour ${data.city}`);

        const weatherIcon = document.createElement('img');
        weatherIcon.src = `https://api.meteo-concept.com/static/icons/flat/${data.weather}.svg`;
        weatherIcon.alt = `Icône météo pour ${data.city}`;
        
        const content = `
            <h3>${data.city}${data.day ? ' - ' + data.day : ''}</h3>
            <p>Temp. min: ${data.tempMin}°C</p>
            <p>Temp. max: ${data.tempMax}°C</p>
            <p>Probabilité de pluie: ${data.rainProb}%</p>
            <p>Ensoleillement: ${data.sunHours}h</p>
            ${data.latitude !== null ? `<p>Latitude: ${data.latitude}</p>` : ''}
            ${data.longitude !== null ? `<p>Longitude: ${data.longitude}</p>` : ''}
            ${data.rain !== null ? `<p>Pluie: ${data.rain}mm</p>` : ''}
            ${data.windSpeed !== null ? `<p>Vent: ${data.windSpeed}km/h</p>` : ''}
            ${data.windDirection !== null ? `<p>Direction vent: ${data.windDirection}°</p>` : ''}
        `;

        card.appendChild(weatherIcon);
        card.innerHTML += content;
        resultsDiv.appendChild(card);
    });
}

document.getElementById('zipcode').addEventListener('input', (e) => {
    if (e.target.value.length === 5) {
        fetchCities(e.target.value, 'city');
    }
});

document.getElementById('adv-zipcode').addEventListener('input', (e) => {
    if (e.target.value.length === 5) {
        fetchCities(e.target.value, 'adv-city');
    }
});