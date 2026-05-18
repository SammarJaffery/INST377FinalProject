# INST377FinalProject

# Climate Risk Intelligence

## Project Description

Climate Risk Intelligence is a web application that allows users to search for a city or location and generate a simple climate risk report. The app displays location data, current weather conditions, weekly temperature and precipitation forecast trends, a simple weather risk score, forecast charts, and an interactive map. Users can also save generated reports to a Supabase database and view recently saved reports on the homepage.

This project was created for INST377 as a Node.js web application using HTML, CSS, JavaScript, Express, Supabase, Open-Meteo, Chart.js, and Leaflet.js.

## Target Browsers

This application is designed for modern desktop browsers, including:

- Google Chrome
- Safari
- Microsoft Edge
- Firefox

The site may also work on mobile browsers, but the primary target is desktop browsers.

## Links

- GitHub Repository: https://github.com/SammarJaffery/INST377FinalProject
- Deployed Vercel Site: finalproject-xi-eight.vercel.app
- Developer Manual: [Developer Manual](#developer-manual)
- Supabase Project: https://supabase.com/dashboard/project/pahlkjarwntfmxckxddt/editor/17625?schema=public 

---

# Developer Manual

## Overview

Climate Risk Intelligence is a web application that helps users search for a location and view climate/weather risk information. The frontend is built with HTML, CSS, and JavaScript. The backend uses Node.js and Express. Supabase is used as the database for storing saved climate risk reports. Open-Meteo is used for location geocoding and weather forecast data.

## Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- Supabase
- Open-Meteo API
- Chart.js
- Leaflet.js
- Vercel

## Installation Instructions

To install this application locally, clone the repository and install the required dependencies.

```bash
git clone git@github.com:SammarJaffery/INST377FinalProject.git
cd INST377FinalProject
npm install
```

## Environment Variables

Create a `.env` file in the main project directory. Add the following variables:

```env
SUPABASE_URL=https://pahlkjarwntfmxckxddt.supabase.co
SUPABASE_KEY=sb_publishable_bsfZez-vhf2W6-M8RBPk6w__zpFRx57
```

The `.env` file should not be pushed to GitHub. Make sure `.env` is listed in `.gitignore`.

## Running the Application Locally

To run the application locally, use:

```bash
node index.js
```

Then open the site in a browser:

```text
http://localhost:3000
```

If using nodemon for development, you can run:

```bash
npm start
```
then open site in browser at http://localhost:3000

## Running Tests

There are currently no automated tests written for this project.

Manual testing steps:

1. Open the homepage.
2. Enter a location, such as `College Park`.
3. Click **Generate Report**.
4. Confirm that the report page loads with location and weather data.
5. Confirm that the temperature and precipitation charts display.
6. Confirm that the interactive map appears.
7. Click **Save Report**.
8. Return to the homepage.
9. Confirm that the saved report appears under **Recent Saved Reports**.

## Server API Endpoints

### GET `/`

Loads the homepage.

### GET `/api/geocode?location=LOCATION_NAME`

Uses the Open-Meteo Geocoding API to convert a searched location into latitude, longitude, state, country, and timezone data.

Example request:

```text
/api/geocode?location=College%20Park
```

Example response:

```json
{
  "name": "College Park",
  "country": "United States",
  "state": "Maryland",
  "latitude": 38.98067,
  "longitude": -76.93692,
  "timezone": "America/New_York"
}
```

### GET `/api/weather?latitude=LATITUDE&longitude=LONGITUDE`

Uses the Open-Meteo Weather API to retrieve current weather and daily forecast data for the selected location.

Example request:

```text
/api/weather?latitude=38.98067&longitude=-76.93692
```

Example response includes current temperature, precipitation, wind speed, daily high temperatures, daily low temperatures, and daily precipitation totals.

### GET `/api/reports`

Retrieves recently saved climate risk reports from the Supabase `climate_reports` table.

Example response:

```json
[
  {
    "id": 1,
    "location_name": "College Park",
    "state": "Maryland",
    "country": "United States",
    "latitude": 38.98067,
    "longitude": -76.93692,
    "risk_score": "Low",
    "temperature": 70.8,
    "precipitation": 0,
    "wind_speed": 8.5
  }
]
```

### POST `/api/reports`

Saves a generated climate risk report to the Supabase `climate_reports` table.

Expected request body:

```json
{
  "location_name": "College Park",
  "state": "Maryland",
  "country": "United States",
  "latitude": 38.98067,
  "longitude": -76.93692,
  "risk_score": "Low",
  "temperature": 70.8,
  "precipitation": 0,
  "wind_speed": 8.5
}
```

## Database

The application uses a Supabase table named `climate_reports`.

Suggested table columns:

| Column Name   | Type        | Description                      |
| ------------- | ----------- | -------------------------------- |
| id            | int8        | Primary key                      |
| created_at    | timestamptz | Time the report was saved        |
| location_name | text        | Name of the searched location    |
| state         | text        | State or administrative region   |
| country       | text        | Country of the searched location |
| latitude      | float8      | Location latitude                |
| longitude     | float8      | Location longitude               |
| risk_score    | text        | Calculated risk score            |
| temperature   | float8      | Current temperature              |
| precipitation | float8      | Current precipitation            |
| wind_speed    | float8      | Current wind speed               |

## Known Bugs and Limitations

- The current climate risk score is a simplified calculation based on temperature, precipitation, and wind speed.
- The app currently uses forecast data rather than long-term historical climate data.
- The Report page works best when a location is passed through the URL from the homepage search.
- If a user enters a very broad or unclear location, the geocoding API may return an unexpected result.
- The app currently displays the most recent saved reports but does not include a delete or edit option.

## Roadmap for Future Development

Future improvements could include:

- Adding historical climate data for long-term trend analysis.
- Adding separate risk categories for heat, cold, precipitation, flooding, wind, and storms.
- Adding separate risk categories for heat, precipitation, flooding, wind, and storms.
- Adding NOAA or OpenWeather data for more complete weather and climate information.
- Allowing users to delete or update saved reports.
- Adding user accounts and personalized saved reports.
- Improving accessibility and mobile responsiveness.
- Adding more detailed charts and comparison tools.
