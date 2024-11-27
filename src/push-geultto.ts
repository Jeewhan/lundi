import "dotenv/config";
import { App } from "@slack/bolt";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

import Slack from "./services/messenger";
import { MincedGarlic } from "./models/geultto/minced-garlic";

import serviceAccountCredentials from "../sheet-381101-882712223151.json";
import { BookRead } from "./models/geultto/book-read";

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

// const mincedGarlic = new MincedGarlic(slack, doc);
// mincedGarlic.checkMonthlyAttendance();

const bookRead = new BookRead(slack, doc);
bookRead.check();
