import "dotenv/config";

import {
  App,
  BlockAction,
  AwsLambdaReceiver,
  SlackActionMiddlewareArgs,
  ButtonAction,
  MultiStaticSelectAction,
} from "@slack/bolt";
import {
  AwsCallback,
  AwsEvent,
  AwsResponse,
} from "@slack/bolt/dist/receivers/AwsLambdaReceiver";

import { GATHER_DINNER_CLUB, GATHER_LUNCH_CLUB } from "./constants";
import Slack from "./services/messenger";

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

const slack = new Slack(app);

const handler = async (
  event: AwsEvent,
  context: any,
  callback: AwsCallback,
): Promise<AwsResponse> => {
  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};

app.action(
  GATHER_LUNCH_CLUB,
  async ({
    ack,
    body,
    payload,
  }: SlackActionMiddlewareArgs<BlockAction<ButtonAction>>) => {
    await ack();

    const requestBody = JSON.stringify({
      payload: [body.user.id, payload.action_id, payload.value],
    });

    await requestGather(requestBody);

    await slack.direct(
      [body.user.id],
      "----- 런치클럽 참여신청이 완료되었습니다.",
    );
  },
);

app.action(
  GATHER_DINNER_CLUB,
  async ({
    ack,
    body,
    payload,
  }: SlackActionMiddlewareArgs<BlockAction<MultiStaticSelectAction>>) => {
    await ack();

    const requestBody = JSON.stringify({
      payload: [
        body.user.id,
        payload.action_id,
        payload.selected_options.map((option) => option.value).join(", "),
      ],
    });

    await requestGather(requestBody);

    await slack.direct(
      [body.user.id],
      `----- 디너클럽 참여신청이 완료되었습니다. ${payload.selected_options
        .map((option) => option.value)
        .join(", ")}`,
    );
  },
);

module.exports.handler = handler;
