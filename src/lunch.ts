import "dotenv/config";

import { App } from "@slack/bolt";
import { JWT } from "google-auth-library";
import { GoogleSpreadsheet } from "google-spreadsheet";

import Slack from "./services/messenger";

import serviceAccountCredentials from "../sheet-381101-882712223151.json";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
const slack = new Slack(app);

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

class LunchMember {
  public readonly excludesSet: Set<string>;
  public readonly keywordsSet: Set<string>;

  constructor(
    public readonly id: string,
    public readonly excludes: string,
    public readonly keywords: string,
  ) {
    this.excludesSet = new Set(excludes.split(", "));
    this.keywordsSet = new Set(keywords.split(", "));
  }

  get score() {
    return this.excludesSet.size * -1 + this.keywordsSet.size * 10;
  }

  public isExcluded(id: string) {
    return this.excludesSet.has(id);
  }

  public isKeyword(keyword: string) {
    return this.keywordsSet.has(keyword);
  }

  public hasCommonKeywords(other: LunchMember): boolean {
    return Array.from(this.keywordsSet).some((keyword) =>
      other.isKeyword(keyword),
    );
  }
}

class Lunch {
  constructor(
    private readonly slack: Slack,
    private readonly doc: GoogleSpreadsheet,
  ) {}

  public async initialize() {
    await this.doc.loadInfo();

    const sheet = this.doc.sheetsByTitle["Lunch"];

    const rows = await sheet.getRows();

    const members = rows.map(
      (row) =>
        new LunchMember(
          row.get("아이디"),
          row.get("만나지_않아도_될_멤버들"),
          row.get("런치클럽_관심사"),
        ),
    );

    return members;
  }

  public async pair(members: LunchMember[]) {
    const list = [...members];
    const sorted = list.sort((a, b) => a.score - b.score);

    const pairs: LunchMember[][] = [];
    const used = new Set<string>();

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];

      if (used.has(current.id)) continue;

      let partner: LunchMember | null = null;
      for (let j = i + 1; j < sorted.length; j++) {
        const candidate = sorted[j];

        if (used.has(candidate.id)) continue;

        if (
          current.isExcluded(candidate.id) ||
          candidate.isExcluded(current.id)
        )
          continue;

        if (!current.hasCommonKeywords(candidate)) continue;

        partner = candidate;
        break;
      }

      if (partner) {
        pairs.push([current, partner]);
        used.add(current.id);
        used.add(partner.id);
      } else {
        pairs.push([current]);
        used.add(current.id);
      }
    }

    return pairs;
  }

  public write = async (pairs: LunchMember[][]) => {
    const sheet = this.doc.sheetsByTitle["Logs"];

    const rows = pairs.map((pair) => {
      const type = "lunch";
      const [l, m] = pair;
      const leader = l.id;
      const members = m?.id ?? "";

      return [type, leader, members];
    });

    await sheet.addRows(rows);
  };
}

const lunch = new Lunch(slack, doc);
lunch.initialize().then(lunch.pair).then(lunch.write);
