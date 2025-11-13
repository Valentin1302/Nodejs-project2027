// config/config.js
require('dotenv').config();

const googleConfig = {
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3005/api/calendar/oauth2callback',
  scopes: ['https://www.googleapis.com/auth/calendar'],
};

module.exports = { googleConfig };
