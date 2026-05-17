const urlParams = new URLSearchParams(window.location.search);
const locationName = urlParams.get('location');

const reportLocation = document.getElementById('reportLocation');
const riskScore = document.getElementById('riskScore');
const currentWeather = document.getElementById('currentWeather');
const temperatureTrends = document.getElementById('temperatureTrends');
const precipitationTrends = document.getElementById('precipitationTrends');
const saveReportButton = document.getElementById('saveReportButton');
const saveMessage = document.getElementById('saveMessage');

let currentReportData = null;

async function loadLocationData() {
  if (!locationName) {
    reportLocation.textContent = 'No location selected.';
    return;
  }

  reportLocation.textContent = `Loading report for: ${locationName}`;

  try {
    const geocodeResponse = await fetch(`/api/geocode?location=${encodeURIComponent(locationName)}`);
    const locationData = await geocodeResponse.json();

    if (!geocodeResponse.ok) {
      reportLocation.textContent = locationData.message || 'Location could not be found.';
      return;
    }

    reportLocation.textContent = `Report for: ${locationData.name}, ${locationData.state}, ${locationData.country}`;

    const weatherResponse = await fetch(
      `/api/weather?latitude=${locationData.latitude}&longitude=${locationData.longitude}`
    );

    const weatherData = await weatherResponse.json();

    if (!weatherResponse.ok) {
      currentWeather.textContent = weatherData.message || 'Weather data could not be loaded.';
      return;
    }

    displayWeatherData(locationData, weatherData);
  } catch (error) {
    console.log('Error loading report data:', error);
    reportLocation.textContent = 'There was an error loading the report data.';
  }
}

function displayWeatherData(locationData, weatherData) {
  const current = weatherData.current;
  const daily = weatherData.daily;

  currentWeather.innerHTML = `
    Temperature: ${current.temperature_2m}°F<br>
    Precipitation: ${current.precipitation} in<br>
    Wind Speed: ${current.wind_speed_10m} mph
  `;

  const maxTemps = daily.temperature_2m_max;
  const minTemps = daily.temperature_2m_min;
  const precipitation = daily.precipitation_sum;

  const averageMaxTemp = calculateAverage(maxTemps);
  const averageMinTemp = calculateAverage(minTemps);
  const totalPrecipitation = calculateTotal(precipitation);

  temperatureTrends.innerHTML = `
    Average High This Week: ${averageMaxTemp.toFixed(1)}°F<br>
    Average Low This Week: ${averageMinTemp.toFixed(1)}°F<br>
    Highest Forecasted Temp: ${Math.max(...maxTemps)}°F
  `;

  precipitationTrends.innerHTML = `
    Total Forecasted Precipitation: ${totalPrecipitation.toFixed(2)} in<br>
    Wettest Day Estimate: ${Math.max(...precipitation)} in
  `;

  const calculatedRiskScore = calculateRiskScore(
    averageMaxTemp,
    totalPrecipitation,
    current.wind_speed_10m
  );

  riskScore.textContent = calculatedRiskScore;

  createCharts(daily);

  createMap(locationData);

  currentReportData = {
    location_name: locationData.name,
    state: locationData.state,
    country: locationData.country,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    risk_score: calculatedRiskScore,
    temperature: current.temperature_2m,
    precipitation: current.precipitation,
    wind_speed: current.wind_speed_10m,
  };
}

function calculateAverage(numbers) {
  const total = numbers.reduce((sum, number) => sum + number, 0);
  return total / numbers.length;
}

function calculateTotal(numbers) {
  return numbers.reduce((sum, number) => sum + number, 0);
}

function calculateRiskScore(averageMaxTemp, totalPrecipitation, windSpeed) {
  let score = 'Low';

  if (averageMaxTemp >= 90 || totalPrecipitation >= 1 || windSpeed >= 25) {
    score = 'Medium';
  }

  if (averageMaxTemp >= 95 || totalPrecipitation >= 2 || windSpeed >= 35) {
    score = 'High';
  }

  if (averageMaxTemp >= 100 || totalPrecipitation >= 3 || windSpeed >= 45) {
    score = 'Extreme';
  }

  return score;
}

async function saveReport() {
  if (!currentReportData) {
    saveMessage.textContent = 'Report data is not ready yet.';
    return;
  }

  try {
    saveMessage.textContent = 'Saving report...';

    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentReportData),
    });

    const data = await response.json();

    if (!response.ok) {
      saveMessage.textContent = data.message || 'Report could not be saved.';
      return;
    }

    saveMessage.textContent = 'Report saved successfully!';
  } catch (error) {
    console.log('Error saving report:', error);
    saveMessage.textContent = 'There was an error saving the report.';
  }
}

saveReportButton.addEventListener('click', saveReport);

function createCharts(daily) {
  createTemperatureChart(daily);
  createPrecipitationChart(daily);
}

function createTemperatureChart(daily) {
  const temperatureChart = document.getElementById('temperatureChart');

  new Chart(temperatureChart, {
    type: 'line',
    data: {
      labels: daily.time,
      datasets: [
        {
          label: 'Daily High Temperature (°F)',
          data: daily.temperature_2m_max,
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

function createPrecipitationChart(daily) {
  const precipitationChart = document.getElementById('precipitationChart');

  new Chart(precipitationChart, {
    type: 'bar',
    data: {
      labels: daily.time,
      datasets: [
        {
          label: 'Daily Precipitation (in)',
          data: daily.precipitation_sum,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function createMap(locationData) {
  const map = L.map('map').setView(
    [locationData.latitude, locationData.longitude],
    10
  );

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  L.marker([locationData.latitude, locationData.longitude])
    .addTo(map)
    .bindPopup(`${locationData.name}, ${locationData.state}`)
    .openPopup();
}

loadLocationData();