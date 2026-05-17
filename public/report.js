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
  const highestTemp = Math.max(...maxTemps);
  const lowestTemp = Math.min(...minTemps);
  const temperatureSwing = highestTemp - lowestTemp;
  

  temperatureTrends.innerHTML = `
    <strong>7-Day Forecast Period</strong><br>
    Average High: ${averageMaxTemp.toFixed(1)}°F<br>
    Average Low: ${averageMinTemp.toFixed(1)}°F<br>
    Highest Forecasted Temp: ${highestTemp.toFixed(1)}°F<br>
    Lowest Forecasted Temp: ${lowestTemp.toFixed(1)}°F<br>
    Temperature Swing: ${temperatureSwing.toFixed(1)}°F
  `;

  precipitationTrends.innerHTML = `
    Total Forecasted Precipitation: ${totalPrecipitation.toFixed(2)} in<br>
    Wettest Day Estimate: ${Math.max(...precipitation)} in
  `;

  const calculatedRiskScore = calculateRiskScore(
    averageMaxTemp,
    averageMinTemp,
    totalPrecipitation,
    current.wind_speed_10m,
    temperatureSwing
  );

  riskScore.innerHTML = `
    <span class="risk-level">${calculatedRiskScore.level}</span><br>
    <span class="risk-factors">Main factors: ${calculatedRiskScore.factors.join(', ')}</span>
  `;

  createCharts(daily);

  createMap(locationData);

  currentReportData = {
    location_name: locationData.name,
    state: locationData.state,
    country: locationData.country,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    risk_score: `${calculatedRiskScore.level} Risk: ${calculatedRiskScore.factors.join(', ')}`,
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

function calculateRiskScore(averageMaxTemp, averageMinTemp, totalPrecipitation, windSpeed, temperatureSwing) {
  let points = 0;
  const factors = [];

  // Heat risk
  if (averageMaxTemp >= 100) {
    points += 3;
    factors.push('extreme heat');
  } else if (averageMaxTemp >= 95) {
    points += 2;
    factors.push('high heat');
  } else if (averageMaxTemp >= 90) {
    points += 1;
    factors.push('moderate heat');
  }

  // Cold risk
  if (averageMinTemp <= 10) {
    points += 3;
    factors.push('extreme cold');
  } else if (averageMinTemp <= 20) {
    points += 2;
    factors.push('high cold');
  } else if (averageMinTemp <= 32) {
    points += 1;
    factors.push('freezing temperatures');
  }

  // Precipitation risk
  if (totalPrecipitation >= 3) {
    points += 3;
    factors.push('heavy precipitation');
  } else if (totalPrecipitation >= 2) {
    points += 2;
    factors.push('elevated precipitation');
  } else if (totalPrecipitation >= 1) {
    points += 1;
    factors.push('moderate precipitation');
  }

  // Wind risk
  if (windSpeed >= 45) {
    points += 3;
    factors.push('extreme wind');
  } else if (windSpeed >= 35) {
    points += 2;
    factors.push('high wind');
  } else if (windSpeed >= 25) {
    points += 1;
    factors.push('moderate wind');
  }

  // Temperature fluctuation risk
  if (temperatureSwing >= 45) {
    points += 3;
    factors.push('extreme temperature swing');
  } else if (temperatureSwing >= 35) {
    points += 2;
    factors.push('large temperature swing');
  } else if (temperatureSwing >= 25) {
    points += 1;
    factors.push('moderate temperature swing');
  }

  let level = 'Low';

  if (points >= 9) {
    level = 'Extreme';
  } else if (points >= 6) {
    level = 'High';
  } else if (points >= 3) {
    level = 'Medium';
  }

  if (factors.length === 0) {
    factors.push('no major short-term weather risks detected');
  }

  return {
    level: level,
    points: points,
    factors: factors,
  };
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
        {
          label: 'Daily Low Temperature (°F)',
          data: daily.temperature_2m_min,
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '7-Day High and Low Temperature Forecast',
        },
      },
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