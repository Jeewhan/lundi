import "dotenv/config";
import { App } from "@slack/bolt";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

// import { Introduces } from "./entities/introduce";

import Slack from "./services/messenger";

import serviceAccountCredentials from "../sheet-381101-882712223151.json";
import { Names } from "./entities/names";
import { Invitations } from "./entities/invitations";
import { CSV } from "./services/csv";

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

// const invitations = new Invitations(slack, doc);
// invitations.sendLunchDinnerClubAnnouncement();

// const introduce = new Introduces(slack, doc);
// introduce.getIntroduceChannelMessages(
//   process.env.MEMOIR_17_INTRODUCE_CHANNEL!,
//   "1729740646.098289",
// );

// const users = new Names(slack, doc);
// users.updateNames();

// const csv = CSV.read("17");

// const obj: Record<
//   string,
//   {
//     name: string;
//     group: string;
//     introduce: string;
//     groupMembers: string[];
//   }
// > = {};

// for (const row of csv) {
//   obj[`"${row.id}"`] = {
//     name: row.name,
//     group: row.group,
//     introduce: row.introduce,
//     groupMembers: row.groupMembers,
//   };
// }

// console.dir(obj, { maxArrayLength: null });
