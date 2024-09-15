import "dotenv/config";
import { App } from "@slack/bolt";

import LunchClub from "./models/lunch-club";
import DinnerClub from "./models/dinner-club";

import Slack from "./services/messenger";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const slack = new Slack(app);

const lunchClub = new LunchClub(slack);
const dinnerClub = new DinnerClub(slack);

lunchClub.sendGatherMessage();
dinnerClub.sendGatherMessage();
