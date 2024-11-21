import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

export class CSV {
  public static read(filename: string) {
    const csv = fs.readFileSync(
      path.join(__dirname, `../assets/${filename}.csv`),
      "utf-8",
    );

    return parse(csv, { columns: true });
  }
}
