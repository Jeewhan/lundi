import "dotenv/config";

import {
  App,
  BlockAction,
  AwsLambdaReceiver,
  SlackActionMiddlewareArgs,
  ButtonAction,
  SlackViewMiddlewareArgs,
  ViewClosedAction,
  ViewSubmitAction,
} from "@slack/bolt";
import {
  AwsCallback,
  AwsEvent,
  AwsResponse,
} from "@slack/bolt/dist/receivers/AwsLambdaReceiver";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

import Slack from "./services/messenger";
import { ClubJoinFormDTO } from "./dtos/club-join-form-dto";

import { Member } from "./entities/member";
import { ClubJoinModalView } from "./views/club-join-modal-view";

import {
  DINNER_CLUB_JOIN_ACTION,
  LUNCH_CLUB_JOIN_ACTION,
  LUNCH_DINNER_CLUB_JOIN_ACTION,
  NOT_READY_FOR_JOIN_CLUB_CALLBACK_ID,
  READY_FOR_JOIN_CLUB_CALLBACK_ID,
  아이디,
} from "./shared/constants";

import serviceAccountCredentials from "../sheet-381101-882712223151.json";
import { UserDTO } from "./dtos/user-dto";
import { ClubJoinRecordDTO } from "./dtos/club-join-record-dto";

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

const serviceAccountAuth = new JWT({
  email: serviceAccountCredentials.client_email,
  key: serviceAccountCredentials.private_key,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
  ],
});
const doc = new GoogleSpreadsheet(
  process.env.MEMOIR_17_SHEET_ID as string,
  serviceAccountAuth,
);

const beforeOpenEach = async (id: string) => {
  await doc.loadInfo();

  const joinsSheet = doc.sheetsByTitle["Joins"];
  const joins = await joinsSheet.getRows();

  const usersSheet = doc.sheetsByTitle["Users"];
  const users = await usersSheet.getRows();

  const user = users.find((row) => row.get(아이디) === id);
  const existingJoin = joins.find((row) => row.get(아이디) === id);

  if (!user) {
    await slack.direct(
      [process.env.LUNDI_MANAGER_SLACK_ID!],
      `인지되지 못한 사용자입니다. ${id}`,
    );
  }

  const clubJoinModalView = new ClubJoinModalView(
    user && new UserDTO(user.toObject()),
    // existingJoin && new ClubJoinRecordDTO(existingJoin.toObject()),
  );

  return clubJoinModalView;
};

app.action(
  LUNCH_CLUB_JOIN_ACTION,
  async ({
    ack,
    body,
    payload,
  }: SlackActionMiddlewareArgs<BlockAction<ButtonAction>>) => {
    await ack();

    const clubJoinModalView = await beforeOpenEach(body.user.id);

    await app.client.views.open(clubJoinModalView.joinLunchClub(body, payload));
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

    const clubJoinModalView = await beforeOpenEach(body.user.id);

    await app.client.views.open(
      clubJoinModalView.joinDinnerClub(body, payload),
    );
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

    const clubJoinModalView = await beforeOpenEach(body.user.id);

    await app.client.views.open(
      clubJoinModalView.joinLunchDinnerClub(body, payload),
    );

    // TODO: 신청내역에 대해 DM으로 보내주기
    // await slack.direct(
    //   [body.user.id],
    //   `${body.user.username}님 런치디너클럽 참가 신청이 완료되었습니다.`,
    // );

    // TODO: 신청한 뒤에 수정할 수 있는 기능
  },
);

app.view(
  { callback_id: READY_FOR_JOIN_CLUB_CALLBACK_ID, type: "view_submission" },
  async ({ ack, body, payload }: SlackViewMiddlewareArgs<ViewSubmitAction>) => {
    await ack();

    const clubJoinFormDTO = new ClubJoinFormDTO(body.user.id);

    const values = clubJoinFormDTO.parse(payload);
    const member = new Member(body.user.id, values);

    await doc.loadInfo();

    const joinsSheet = doc.sheetsByTitle["Joins"];
    const rows = await joinsSheet.getRows();

    const existingJoin = rows.find((row) => row.get("id") === body.user.id);

    if (existingJoin) {
      existingJoin.assign(member.row);

      await existingJoin.save();
    } else {
      await joinsSheet.addRow(member.row);
    }
  },
);

app.view(
  {
    callback_id: READY_FOR_JOIN_CLUB_CALLBACK_ID,
    type: "view_closed",
  },
  async ({ ack, body, payload }: SlackViewMiddlewareArgs<ViewClosedAction>) => {
    await ack();

    await doc.loadInfo();

    const cancellationsSheet = doc.sheetsByTitle["Cancellations"];

    await cancellationsSheet.addRow({
      [아이디]: body.user.id,
      분류: READY_FOR_JOIN_CLUB_CALLBACK_ID,
    });
  },
);

app.view(
  {
    callback_id: NOT_READY_FOR_JOIN_CLUB_CALLBACK_ID,
    type: "view_closed",
  },
  async ({ ack, body, payload }: SlackViewMiddlewareArgs<ViewClosedAction>) => {
    await ack();

    await doc.loadInfo();

    const cancellationsSheet = doc.sheetsByTitle["Cancellations"];

    await cancellationsSheet.addRow({
      [아이디]: body.user.id,
      분류: NOT_READY_FOR_JOIN_CLUB_CALLBACK_ID,
    });
  },
);

module.exports.handler = handler;
