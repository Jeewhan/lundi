import { GoogleSpreadsheet } from "google-spreadsheet";
import { Messenger } from "../../services/messenger";
import { DateTime } from "luxon";

export class BookRead {
  constructor(
    private readonly messenger: Messenger,
    private readonly doc: GoogleSpreadsheet,
  ) {}

  public async check() {
    const { messages } = await this.messenger.conversationHistories(
      process.env.BOOK_READ_CHANNEL_ID!,
      {
        limit: 30,
        once: true,
      },
    );

    if (!messages) {
      throw new Error("No messages");
    }

    await this.doc.loadInfo();

    const sheet = this.doc.sheetsByTitle["책읽어또"];
    const rows = await sheet.getRows();

    const daysPattern = /(\d+)일차/;

    const records = messages.map((message) => {
      if (!message.text) {
        throw new Error(`No text, ${message.ts}`);
      }

      const { ts, user, text } = message;

      if (!user) {
        throw new Error(`No user, ${message.ts}`);
      }

      const datetime = DateTime.fromMillis(Number(ts) * 1000)
        .set({ second: 0 })
        .toFormat("yyyy-MM-dd HH:mm:ss");

      const type = message.root ? "reply" : "root";

      const daysMatch = text.match(daysPattern);

      if (!daysMatch && type === "reply") {
        console.log(text);
        throw new Error(`No days, ${message.ts}`);
      }

      const days = type === "root" ? 0 : daysMatch![1];

      return { datetime, user, type, text, days };
    });

    await sheet.addRows(records);
    // console.log(messages?.length);

    // console.log(messages?.slice(0, 10));
  }
}
