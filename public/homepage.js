const locationInput = document.getElementById('locationInput');
const generateReportButton = document.getElementById('generateReportButton');
const searchMessage = document.getElementById('searchMessage');
const savedReportsList = document.getElementById('savedReportsList');

generateReportButton.addEventListener('click', () => {
  const location = locationInput.value.trim();

  if (location === '') {
    searchMessage.textContent = 'Please enter a city or location.';
    return;
  }

  const encodedLocation = encodeURIComponent(location);
  window.location.href = `report.html?location=${encodedLocation}`;
});

locationInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    generateReportButton.click();
  }
});

async function loadSavedReports() {
  try {
    const response = await fetch('/api/reports');
    const reports = await response.json();

    if (!response.ok) {
      savedReportsList.innerHTML = '<p>Saved reports could not be loaded.</p>';
      return;
    }

    if (reports.length === 0) {
      savedReportsList.innerHTML = '<p>No saved reports yet.</p>';
      return;
    }

    savedReportsList.innerHTML = '';

    reports.forEach((report) => {
      const reportCard = document.createElement('div');
      reportCard.classList.add('saved-report-card');

      reportCard.innerHTML = `
        <h3>${report.location_name}, ${report.state}</h3>
        <p><span class="risk-label">Risk Score:</span> ${report.risk_score}</p>
        <p>Temperature: ${report.temperature}°F</p>
        <p>Precipitation: ${report.precipitation} in</p>
        <p>Wind Speed: ${report.wind_speed} mph</p>
      `;

      savedReportsList.appendChild(reportCard);
    });
  } catch (error) {
    console.log('Error loading saved reports:', error);
    savedReportsList.innerHTML = '<p>There was an error loading saved reports.</p>';
  }
}

loadSavedReports();