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

app.action(
  GATHER_LUNCH_CLUB,
  async (argument: SlackActionMiddlewareArgs<BlockAction>) => {
    await argument.ack();

    const body = argument.body as BlockAction;
    const action = argument.action as ButtonAction;

    const requestBody = JSON.stringify({
      payload: [body.user.id, action.action_id, action.value],
    });

    await requestGather(requestBody);

    const { channel } = await app.client.conversations.open({
      users: body.user.id,
    });

    if (channel?.id) {
      await app.client.chat.postMessage({
        channel: channel.id,
        text: `----- 런치클럽 참여신청이 완료되었습니다.`,
      });
    }
  }
);

app.action(
  GATHER_DINNER_CLUB,
  async (argument: SlackActionMiddlewareArgs<BlockAction>) => {
    await argument.ack();

    const body = argument.body as BlockAction;
    const payload = argument.payload as MultiStaticSelectAction;

    const requestBody = JSON.stringify({
      payload: [
        body.user.id,
        payload.action_id,
        payload.selected_options.map((option) => option.value).join(", "),
      ],
    });

    await requestGather(requestBody);

    const { channel } = await app.client.conversations.open({
      users: body.user.id,
    });

    if (channel?.id) {
      await app.client.chat.postMessage({
        channel: channel.id,
        text: `----- 디너클럽 참여신청이 완료되었습니다. ${payload.selected_options
          .map((option) => option.value)
          .join(", ")}`,
      });
    }
  }
);

module.exports.handler = handler;
