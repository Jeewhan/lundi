import "dotenv/config";
import { App } from "@slack/bolt";

import LunchClub from "./controllers/lunch-club";
import DinnerClub from "./controllers/dinner-club";
import Slack from "./services/slack";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const slack = new Slack(app);

const lunchClub = new LunchClub(slack);
const dinnerClub = new DinnerClub(slack);

lunchClub.sendGatherMessage();
dinnerClub.sendGatherMessage();
