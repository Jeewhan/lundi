import { GoogleSpreadsheet } from "google-spreadsheet";
import { A, F } from "@mobily/ts-belt";
import { match, P } from "ts-pattern";

import Slack from "../services/messenger";
import { 일시 } from "../shared/constants";
import { 아이디 } from "../shared/constants";

export class Introduces {
  constructor(
    private readonly slack: Slack,
    private readonly doc: GoogleSpreadsheet,
  ) {}

  public async getIntroduceChannelMessages(channel: string, oldest: string) {
    const { messages: channelMessages } =
      await this.slack.conversationHistories(channel, {
        oldest,
      });

    if (!channelMessages) {
      throw new Error("Messages is undefined");
    }

    await this.doc.loadInfo();

    const introduceSheet = this.doc.sheetsByTitle["Introduces"];
    const existingRecords = await introduceSheet.getRows();

    const unrecordedMessages = channelMessages.filter(
      (message) =>
        !existingRecords.some(
          (record) =>
            record.get(아이디) === message.user &&
            record.get(일시) === message.ts,
        ),
    );

    if (!unrecordedMessages.length) {
      throw new Error("No new messages found");
    }

    if (
      unrecordedMessages.some(
        (message) => !message.ts || !message.user || !message.text,
      )
    ) {
      throw new Error("Found invalid message format");
    }

    const validatedMessages = A.filterMap(unrecordedMessages, (message) =>
      match(message)
        .with({ ts: P.string, user: P.string, text: P.string }, F.identity)
        .otherwise(() => null),
    ).map((message) => ({
      ...message,
      link: `https://slack.com/archives/${channel}/p${message.ts?.replace(
        ".",
        "",
      )}`,
    }));

    await introduceSheet.addRows(
      validatedMessages.map((message) => ({
        timestamp: message.ts,
        id: message.user,
        link: message.link,
        text: message.text,
      })),
    );
  }
}
