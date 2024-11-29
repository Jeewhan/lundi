import "dotenv/config";
import { App } from "@slack/bolt";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

import Slack from "./services/messenger";

import serviceAccountCredentials from "../sheet-381101-882712223151.json";

const serviceAccountAuth = new JWT({
  email: serviceAccountCredentials.client_email,
  key: serviceAccountCredentials.private_key,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
  ],
});

const app = new App({
  token: process.env.GEULTTO_SLACK_BOT_TOKEN,
  signingSecret: process.env.GEULTTO_SLACK_SIGNING_SECRET,
});

const slack = new Slack(app);

const doc = new GoogleSpreadsheet(
  process.env.CHECK_SHEET_ID!,
  serviceAccountAuth,
);
