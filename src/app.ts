import "dotenv/config";

import {
  App,
  BlockAction,
  AwsLambdaReceiver,
  SlackActionMiddlewareArgs,
  ButtonAction,
} from "@slack/bolt";
import {
  AwsCallback,
  AwsEvent,
  AwsResponse,
} from "@slack/bolt/dist/receivers/AwsLambdaReceiver";

import { LUNCH_DINNER_CLUB_JOIN_ACTION } from "./shared/constants";
import Slack from "./services/messenger";

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
  LUNCH_DINNER_CLUB_JOIN_ACTION,
  async ({
    ack,
    body,
    payload,
  }: SlackActionMiddlewareArgs<BlockAction<ButtonAction>>) => {
    await ack();

    await slack.direct(
      [body.user.id],
      `${payload.action_id} ${payload.action_ts} ${payload.block_id} ${payload.text} ${payload.type} ${payload.value}`,
    );
  },
);

module.exports.handler = handler;

// app.action(
//   GATHER_LUNCH_CLUB,
//   async ({
//     ack,
//     body,
//     payload,
//   }: SlackActionMiddlewareArgs<BlockAction<ButtonAction>>) => {
//     await ack();

//     const requestBody = JSON.stringify({
//       payload: [body.user.id, payload.action_id, payload.value],
//     });

//     await requestGather(requestBody);

//     await slack.direct(
//       [body.user.id],
//       "----- 런치클럽 참여신청이 완료되었습니다.",
//     );
//   },
// );

// app.action(
//   GATHER_DINNER_CLUB,
//   async ({
//     ack,
//     body,
//     payload,
//   }: SlackActionMiddlewareArgs<BlockAction<MultiStaticSelectAction>>) => {
//     await ack();

//     const requestBody = JSON.stringify({
//       payload: [
//         body.user.id,
//         payload.action_id,
//         payload.selected_options.map((option) => option.value).join(", "),
//       ],
//     });

//     await requestGather(requestBody);

//     await slack.direct(
//       [body.user.id],
//       `----- 디너클럽 참여신청이 완료되었습니다. ${payload.selected_options
//         .map((option) => option.value)
//         .join(", ")}`,
//     );
//   },
// );
