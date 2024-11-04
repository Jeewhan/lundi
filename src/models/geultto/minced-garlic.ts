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

  public async checkMonthlyAttendance() {
    const now = DateTime.now().setZone("Asia/Seoul");

    // const yesterday = now.minus({ days: 1 });
    // const oldest = yesterday.startOf("day").toUnixInteger().toString();
    // const latest = now.endOf("day").toUnixInteger().toString();

    const startOfMonth = now.startOf("month");
    const endOfMonth = now.endOf("month");

    const oldest = startOfMonth.toUnixInteger().toString();
    const latest = endOfMonth.toUnixInteger().toString();

    const { messages } = await this.messenger.conversationHistories(
      process.env.GARLIC_CHANNEL_ID!,
      { oldest, latest }
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

    const keywordPattern = /마늘|출근/; // "마늘" 또는 "출근" 포함
    const timePattern = /(?:0?[0-9]|1[0-9]|2[0-3]):(?:[0-5][0-9])/; // HH:MM 형식 (07:22 or 7:22)

    const list = replies
      .flatMap((reply) => reply.messages)
      .filter((message): message is MessageElement => !!message)
      .filter((message) => message.bot_id !== "B01")
      .filter((message) => message.type === "message")
      .filter((message) => {
        const text = message.text!;
        return keywordPattern.test(text) || timePattern.test(text);
      })
      .sort((a, b) => Number(a.ts) - Number(b.ts))
      .map(
        (message) =>
          [
            DateTime.fromMillis(Number(message.ts) * 1000)
              .set({ second: 0 })
              .toFormat("yyyy-MM-dd HH:mm:ss"),
            message.user,
          ] as [string, string]
      );

    await this.doc.loadInfo();

    const sheet = this.doc.sheetsByTitle["출근장부"];

    const rows = await sheet.getRows();

    const existing = rows.map((row) => [
      DateTime.fromFormat(row.get("datetime"), "M월 dd일 HH:mm")
        .set({ year: now.year })
        .toFormat("yyyy-MM-dd HH:mm:ss"),
      row.get("user"),
    ]);

    const freshList = list.filter(
      (item) =>
        !existing.some(
          (existingItem) =>
            existingItem[0] === item[0] && existingItem[1] === item[1]
        )
    );

    await sheet.addRows(
      freshList.map(([datetime, user]) => ({
        datetime,
        user,
      }))
    );
  }
}
