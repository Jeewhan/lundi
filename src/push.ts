import "dotenv/config";

import { App } from "@slack/bolt";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

import Slack from "./services/messenger";

import { Invitations } from "./entities/invitations";

import serviceAccountCredentials from "../sheet-381101-882712223151.json";
import { 성함, 아이디 } from "./shared/constants";

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

// slack
//   .conversationsMembers(process.env.MEMOIR_17_INTRODUCE_CHANNEL!)
//   .then((res) => console.dir(res.members, { maxArrayLength: null }));

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

// (async () => {
//   const list = [
//     "U07T0P8G6Q7",
//     "U07T1NWKFRD",
//     "U07T9F9G6AD",
//     "U07TDDP4X9T",
//     "U07TV061SAD",
//     "U07U06XV8C9",
//     "U07UCAWP3UG",
//     "U07UK9HGDQV",
//     "U07UN2K81PV",
//     "U07UZHSJ8N9",
//     "U07V3K1N1MF",
//     "U0800EZ8DS6",
//     "U0805ETBUSC",
//     "U0810D1EBRV",
//   ];

//   await doc.loadInfo();

//   const usersSheet = doc.sheetsByTitle["Users"];

//   const users = await Promise.all(list.map((id) => slack.usersInfo(id)));

//   console.log(users);

//   const usersData = users
//     .filter(({ user }) => !user!.is_bot)
//     .map(({ user }) => ({
//       [아이디]: user!.id as string,
//       [성함]: user!.real_name as string,
//     }));

//   usersSheet.addRows(usersData);
// })();
