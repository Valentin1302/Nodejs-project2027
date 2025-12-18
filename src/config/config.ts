import dotenv from "dotenv";
dotenv.config();

export interface GoogleConfig {
  client_id: string | undefined;
  client_secret: string | undefined;
  redirect_uri: string;
  scopes: string[];
}

export const googleConfig: GoogleConfig = {
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uri:
    process.env.GOOGLE_REDIRECT_URI ||
    "http://localhost:3005/api/calendar/oauth2callback",
  scopes: ["https://www.googleapis.com/auth/calendar"],
};
