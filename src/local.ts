import "dotenv/config";
import { App } from "@slack/bolt";

import LunchClub from "./controllers/lunch-club";
import DinnerClub from "./controllers/dinner-club";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const lunchClub = new LunchClub(app);
const dinnerClub = new DinnerClub(app);

lunchClub.sendGatherMessage();
dinnerClub.sendGatherMessage();
