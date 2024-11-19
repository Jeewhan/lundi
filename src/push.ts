import "dotenv/config";
import { App } from "@slack/bolt";

import LunchClub from "./models/lunch-club";
import DinnerClub from "./models/dinner-club";

import Slack from "./services/messenger";
import GoogleSpreadSheets from "./services/sheets";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const slack = new Slack(app);
const sheets = new GoogleSpreadSheets(
  process.env.APPS_SCRIPT_API_URL as string,
);

const lunchClub = new LunchClub(slack, sheets);
const dinnerClub = new DinnerClub(slack, sheets);

lunchClub.sendGatherMessage();
dinnerClub.sendGatherMessage();
