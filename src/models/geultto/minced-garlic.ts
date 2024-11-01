import { DateTime } from "luxon";

import type { MessageElement } from "@slack/web-api/dist/response/ConversationsRepliesResponse";

import "dotenv/config";

import { Messenger } from "../../services/messenger";
import { GoogleSpreadsheet } from "google-spreadsheet";

export class MincedGarlic {
  constructor(
    private readonly messenger: Messenger,
    private readonly doc: GoogleSpreadsheet
  ) {}

  public async checkYesterdaysAttendance() {
    const oldest = DateTime.now()
      .setZone("Asia/Seoul")
      .minus({ days: 1 })
      .startOf("day")
      .toUnixInteger()
      .toString();

    const { messages } = await this.messenger.conversationHistories(
      process.env.GARLIC_CHANNEL_ID!,
      oldest
    );

    if (!messages) {
      throw new Error("No messages found");
    }

    const replies = await Promise.all(
      messages
        .filter((message) => message.bot_id === "B01")
        .map((message) => message.thread_ts)
        .filter((ts): ts is string => !!ts)
        .map((ts) =>
          this.messenger.conversationsReplies(
            process.env.GARLIC_CHANNEL_ID!,
            ts
          )
        )
    );

    const list = replies
      .flatMap((reply) => reply.messages)
      .filter((message): message is MessageElement => !!message)
      .filter((message) => message.bot_id !== "B01")
      .filter((message) => message.type === "message")
      .filter((message) => message.text!.includes("마늘"))
      .sort((a, b) => Number(a.ts) - Number(b.ts))
      .map(
        (message) =>
          [
            message.user,
            DateTime.fromMillis(Number(message.ts) * 1000).toFormat(
              "yyyy-MM-dd HH:mm:ss"
            ),
          ] as [string, string]
      );

    await this.doc.loadInfo();

    const sheet = this.doc.sheetsByTitle["출근장부"];

    for (const [user, datetime] of list) {
      await sheet.addRow({
        datetime: datetime,
        user: user,
      });
    }
  }
}
