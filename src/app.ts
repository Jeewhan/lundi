import "dotenv/config";

import {
  App,
  BlockAction,
  ButtonAction,
  MultiStaticSelectAction,
} from "@slack/bolt";

import LunchClub from "./controllers/lunch-club";
import DinnerClub from "./controllers/dinner-club";
import Slack from "./services/slack";
import { GATHER_DINNER_CLUB, GATHER_LUNCH_CLUB } from "./constants";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
  await app.start(Number(process.env.PORT) || 3000);

  const slack = new Slack(app);
  const lunchClub = new LunchClub(slack);
  const dinnerClub = new DinnerClub(slack);

  console.log("⚡️ Bolt app is running!");

  app.action(GATHER_LUNCH_CLUB, async (argument) => {
    await argument.ack();

    const body = argument.body as BlockAction;
    const payload = argument.payload as MultiStaticSelectAction;

    // NOTE: 무엇을 기록할 것인가?
    // NOTE: argument

    const requestBody = JSON.stringify({
      payload: [
        body.user.name,
        body.user.id,
        body.channel!.name,
        ...payload.selected_options.map((option) => option.value),
      ],
    });

    await lunchClub.requestGather(requestBody);
  });

  app.action(GATHER_DINNER_CLUB, async (argument) => {
    await argument.ack();

    const body = argument.body as BlockAction;
    const payload = argument.payload as MultiStaticSelectAction;

    const requestBody = JSON.stringify({
      payload: [
        body.user.name,
        body.user.id,
        body.channel!.name,
        ...payload.selected_options.map((option) => option.value),
      ],
    });

    await dinnerClub.requestGather(requestBody);
  });

  await lunchClub.sendGatherMessage();
  await dinnerClub.sendGatherMessage();
})();
