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
import { DateTime } from "luxon";

import Slack from "./services/messenger";
import { ClubJoinFormDTO } from "./dtos/club-join-form-dto";

import { Member } from "./entities/member";
import { ClubJoinModalView } from "./views/club-join-modal-view";

import {
  DINNER_CLUB_JOIN_ACTION,
  LUNCH_CLUB_JOIN_ACTION,
  LUNCH_DINNER_CLUB_CANCEL_ACTION,
  LUNCH_DINNER_CLUB_JOIN_ACTION,
  NOT_EXIST_JOIN,
  NOT_READY_FOR_JOIN_CLUB_CALLBACK_ID,
  READY_FOR_JOIN_CLUB_CALLBACK_ID,
  런치클럽_관심사,
  링크,
  분류,
  아이디,
  연락처,
  일시,
  자기소개,
  클럽선택,
  텍스트,
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

  const usersSheet = doc.sheetsByTitle["Users"];
  const users = await usersSheet.getRows();
  const user = users.find((row) => row.get(아이디) === id);

  const joinsSheet = doc.sheetsByTitle["Joins"];
  const joins = await joinsSheet.getRows();
  const join = joins.find((row) => row.get(아이디) === id);

  if (!user) {
    await slack.direct([process.env.LUNDI_MANAGER_SLACK_ID!], {
      text: `인지되지 못한 사용자입니다. ${id}`,
    });

    throw new Error("User not found");
  }

  if (!user.get(자기소개)) {
    const introduceChannel = process.env.MEMOIR_17_INTRODUCE_CHANNEL!;

    const { messages } = await slack.conversationHistories(introduceChannel, {
      limit: 400,
    });

    if (messages) {
      const introduce = messages.find(
        ({ user, blocks }) => user === id && blocks,
      );

      if (introduce) {
        const introducesSheet = doc.sheetsByTitle["Introduces"];

        await introducesSheet.addRow({
          [일시]: introduce.ts!,
          [아이디]: id,
          [링크]: `https://slack.com/archives/${introduceChannel}/p${introduce.ts?.replace(
            ".",
            "",
          )}`,
          [텍스트]: introduce.text!,
        });

        const users = await usersSheet.getRows();
        const user = users.find((row) => row.get(아이디) === id);

        if (user) {
          const clubJoinModalView = new ClubJoinModalView(
            new UserDTO(user.toObject()),
          );

          return clubJoinModalView;
        }
      }
    }
  }

  const clubJoinModalView = new ClubJoinModalView(
    new UserDTO(user.toObject()),
    join && new ClubJoinRecordDTO(join.toObject()),
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
  },
);

app.action(
  LUNCH_DINNER_CLUB_CANCEL_ACTION,
  async ({
    ack,
    body,
    payload,
  }: SlackActionMiddlewareArgs<BlockAction<ButtonAction>>) => {
    await ack();

    await doc.loadInfo();

    const usersSheet = doc.sheetsByTitle["Users"];
    const users = await usersSheet.getRows();
    const user = users.find((row) => row.get(아이디) === body.user.id);

    if (!user) {
      await slack.direct([process.env.LUNDI_MANAGER_SLACK_ID!], {
        text: `인지되지 못한 사용자입니다. ${body.user.id}`,
      });

      throw new Error("User not found");
    }

    const joinsSheet = doc.sheetsByTitle["Joins"];
    const joins = await joinsSheet.getRows();
    const join = joins.find((row) => row.get(아이디) === body.user.id);

    const cancellationsSheet = doc.sheetsByTitle["Cancellations"];

    if (!join) {
      await cancellationsSheet.addRow({
        [일시]: DateTime.now()
          .setZone("Asia/Seoul")
          .toFormat("yyyy-MM-dd HH:mm:ss"),
        [아이디]: body.user.id,
        [분류]: NOT_EXIST_JOIN,
      });

      await slack.direct([body.user.id], {
        text: "신청내역이 존재하지 않습니다. 먼저 신청해주시길 부탁드립니다.",
      });
    } else {
      await cancellationsSheet.addRow({
        [일시]: DateTime.now()
          .setZone("Asia/Seoul")
          .toFormat("yyyy-MM-dd HH:mm:ss"),
        [아이디]: body.user.id,
        [분류]: LUNCH_DINNER_CLUB_CANCEL_ACTION,
      });

      await join.delete();

      await slack.direct([body.user.id], {
        text: "참가신청이 취소되었습니다. 다음 기회에라도 뵙고 싶습니다.",
      });
    }
  },
);

app.view(
  { callback_id: READY_FOR_JOIN_CLUB_CALLBACK_ID, type: "view_submission" },
  async ({ ack, body, payload }: SlackViewMiddlewareArgs<ViewSubmitAction>) => {
    try {
      await ack();

      const clubJoinFormDTO = new ClubJoinFormDTO(body.user.id);
      const values = clubJoinFormDTO.parse(payload);

      const member = new Member(body.user.id, values);

      await doc.loadInfo();

      const joinsSheet = doc.sheetsByTitle["Joins"];
      const rows = await joinsSheet.getRows();

      const existingJoin = rows.find((row) => row.get(아이디) === body.user.id);
      const purpose = existingJoin ? "수정" : "신청";

      if (existingJoin) {
        existingJoin.assign(member.row);

        await existingJoin.save();
      } else {
        await joinsSheet.addRow(member.row);
      }

      await slack.direct([body.user.id], {
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `${purpose}이 완료되었습니다.`,
            },
          },

          ...member.blocks,
        ],
      });
    } catch (error) {
      await slack.direct([process.env.LUNDI_MANAGER_SLACK_ID!], {
        text: `오류가 발생했습니다. ${JSON.stringify(error)}`,
      });
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
      [일시]: DateTime.now()
        .setZone("Asia/Seoul")
        .toFormat("yyyy-MM-dd HH:mm:ss"),
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
      [일시]: DateTime.now()
        .setZone("Asia/Seoul")
        .toFormat("yyyy-MM-dd HH:mm:ss"),
      [아이디]: body.user.id,
      분류: NOT_READY_FOR_JOIN_CLUB_CALLBACK_ID,
    });
  },
);

module.exports.handler = handler;
