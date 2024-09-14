import "dotenv/config";

import {
  App,
  BlockAction,
  MultiStaticSelectAction,
  AwsLambdaReceiver,
  SlackActionMiddlewareArgs,
} from "@slack/bolt";
import {
  AwsCallback,
  AwsEvent,
  AwsResponse,
} from "@slack/bolt/dist/receivers/AwsLambdaReceiver";

import LunchClub from "./controllers/lunch-club";
import DinnerClub from "./controllers/dinner-club";
import Slack from "./services/slack";
import { GATHER_DINNER_CLUB, GATHER_LUNCH_CLUB } from "./constants";

const requestGather = async (body: BodyInit) => {
  await fetch(process.env.APPS_SCRIPT_API_URL as string, {
    method: "POST",
    body,
  });
};

if (!process.env.SLACK_SIGNING_SECRET)
  throw new Error("SLACK_SIGNING_SECRET is not defined");

const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,
});

const handler = async (
  event: AwsEvent,
  context: any,
  callback: AwsCallback
): Promise<AwsResponse> => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};

const slack = new Slack(app);
const lunchClub = new LunchClub(slack);
const dinnerClub = new DinnerClub(slack);

const handleGatherAction = async (
  argument: SlackActionMiddlewareArgs<BlockAction>
) => {
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

  await requestGather(requestBody);
};

app.action(
  GATHER_LUNCH_CLUB,
  async (argument: SlackActionMiddlewareArgs<BlockAction>) => {
    await handleGatherAction(argument);
  }
);

app.action(
  GATHER_DINNER_CLUB,
  async (argument: SlackActionMiddlewareArgs<BlockAction>) => {
    await handleGatherAction(argument);
  }
);

// lunchClub.sendGatherMessage();
// dinnerClub.sendGatherMessage();

module.exports.handler = handler;
