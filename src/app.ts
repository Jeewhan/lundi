import "dotenv/config";

import {
  App,
  BlockAction,
  AwsLambdaReceiver,
  SlackActionMiddlewareArgs,
  ButtonAction,
  SlackViewMiddlewareArgs,
  SlackViewAction,
} from "@slack/bolt";
import {
  AwsCallback,
  AwsEvent,
  AwsResponse,
} from "@slack/bolt/dist/receivers/AwsLambdaReceiver";

import {
  DINNER_CLUB_JOIN_ACTION,
  LUNCH_CLUB_JOIN_ACTION,
  LUNCH_DINNER_CLUB_JOIN_ACTION,
  NOT_READY_FOR_JOIN_CLUB_CALLBACK_ID,
  READY_FOR_JOIN_CLUB_CALLBACK_ID,
} from "./shared/constants";
import Slack from "./services/messenger";
import { Join } from "./entities/join";

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
  LUNCH_CLUB_JOIN_ACTION,
  async ({
    ack,
    body,
    payload,
  }: SlackActionMiddlewareArgs<BlockAction<ButtonAction>>) => {
    await ack();

    const join = new Join(body.user.id);

    await app.client.views.open(join.joinLunchClub(body, payload as any));
  },
);

app.action(
  DINNER_CLUB_JOIN_ACTION,
  async ({
    ack,
    body,
    payload,
  }: SlackActionMiddlewareArgs<BlockAction<ButtonAction>>) => {
    await ack();

    const join = new Join(body.user.id);

    await app.client.views.open(join.joinDinnerClub(body, payload as any));
  },
);

app.action(
  LUNCH_DINNER_CLUB_JOIN_ACTION,
  async ({
    ack,
    body,
    payload,
  }: SlackActionMiddlewareArgs<BlockAction<ButtonAction>>) => {
    await ack();

    const join = new Join(body.user.id);

    await app.client.views.open(join.joinLunchDinnerClub(body, payload as any));

    // TODO: 신청내역에 대해 DM으로 보내주기
    // await slack.direct(
    //   [body.user.id],
    //   `${body.user.username}님 런치디너클럽 참가 신청이 완료되었습니다.`,
    // );

    // TODO: 신청한 뒤에 수정할 수 있는 기능

    // const join = new Join();
    // await app.client.views.open(join.joinLunchDinnerClub(body, payload as any));
  },
);

app.view(
  READY_FOR_JOIN_CLUB_CALLBACK_ID,
  async ({
    ack,
    body,
    payload,
    view,
  }: SlackViewMiddlewareArgs<SlackViewAction>) => {
    await ack();

    await slack.direct([body.user.id], JSON.stringify({ body, payload }));

    await slack.direct([body.user.id], JSON.stringify({ view }));
  },
);

app.view(
  NOT_READY_FOR_JOIN_CLUB_CALLBACK_ID,
  async ({ ack, body, payload }: SlackViewMiddlewareArgs<SlackViewAction>) => {
    await ack();
  },
);

module.exports.handler = handler;

// lunch-dinner-club-join-action 1731988580.634948 uOAVo [object Object] button join
// `${payload.action_id} ${payload.action_ts} ${payload.block_id} ${payload.text} ${payload.type} ${payload.value}`,

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
