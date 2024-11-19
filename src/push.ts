import "dotenv/config";
import { App } from "@slack/bolt";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

import { Invitation } from "./entities/invitation";

import Slack from "./services/messenger";

import serviceAccountCredentials from "../sheet-381101-882712223151.json";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
const slack = new Slack(app);

const serviceAccountAuth = new JWT({
  email: serviceAccountCredentials.client_email,
  key: serviceAccountCredentials.private_key,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
  ],
});
const doc = new GoogleSpreadsheet(
  process.env.MEMOIR_17_SHEET_ID as string,
  serviceAccountAuth,
);

const invitation = new Invitation(slack, doc);

invitation.sendLunchDinnerClubAnnouncement();
