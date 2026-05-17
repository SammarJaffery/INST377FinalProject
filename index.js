const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const { isValidStateAbbreviation } = require('usa-state-validator');
const dotenv = require('dotenv');

const app = express();
const port = 3000;
dotenv.config();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.get('/test', (req, res) => {
  res.send('Test route is working');
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/homepage.html');
});


app.get('/api/geocode', async (req, res) => {
  const location = req.query.location;

  if (!location) {
    res.status(400).json({
      message: 'Location is required',
    });
    return;
  }

  try {
    const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      res.status(404).json({
        message: 'No location found',
      });
      return;
    }

    const result = data.results[0];

    res.json({
      name: result.name,
      country: result.country,
      state: result.admin1,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone,
    });
  } catch (error) {
    console.log('Geocode API error:', error);
    res.status(500).json({
      message: 'Error getting location data',
    });
  }
});

app.get('/api/weather', async (req, res) => {
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;

  if (!latitude || !longitude) {
    res.status(400).json({
      message: 'Latitude and longitude are required',
    });
    return;
  }

  try {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    res.json({
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      current: data.current,
      daily: data.daily,
    });
  } catch (error) {
    console.log('Weather API error:', error);
    res.status(500).json({
      message: 'Error getting weather data',
    });
  }
});

app.post('/api/reports', async (req, res) => {
  console.log('Saving climate report');
  console.log(`Request body: ${JSON.stringify(req.body)}`);

  const {
    location_name,
    state,
    country,
    latitude,
    longitude,
    risk_score,
    temperature,
    precipitation,
    wind_speed,
  } = req.body;

  const { data, error } = await supabase
    .from('climate_reports')
    .insert({
      location_name: location_name,
      state: state,
      country: country,
      latitude: latitude,
      longitude: longitude,
      risk_score: risk_score,
      temperature: temperature,
      precipitation: precipitation,
      wind_speed: wind_speed,
    })
    .select();

  if (error) {
    console.log('Supabase insert error:', error);
    res.status(500).json({
      message: 'Error saving climate report',
      error: error,
    });
  } else {
    res.json(data);
  }
});

app.get('/api/reports', async (req, res) => {
  console.log('Getting saved climate reports');

  const { data, error } = await supabase
    .from('climate_reports')
    .select()
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.log('Supabase select error:', error);
    res.status(500).json({
      message: 'Error getting saved reports',
      error: error,
    });
  } else {
    res.json(data);
  }
});

app.listen(port, () => {
  console.log(`App is available on port: ${port}`);
});
