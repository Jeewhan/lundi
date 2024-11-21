import { GoogleSpreadsheet } from "google-spreadsheet";

import Slack from "../services/messenger";

export class Names {
  constructor(
    private readonly slack: Slack,
    private readonly doc: GoogleSpreadsheet,
  ) {}

  public async updateNames() {
    await this.doc.loadInfo();

    const usersSheet = this.doc.sheetsByTitle["Users"];

    await usersSheet.loadHeaderRow();
    await usersSheet.loadCells();

    const headers = usersSheet.headerValues;
    const targetIndex = headers.findIndex((header) => header === "name");

    const existingRecords = await usersSheet.getRows();

    const updatedRecords = await Promise.all(
      existingRecords.map(async (record) => {
        const { user } = await this.slack.usersInfo(record.get("id"));

        if (!user) {
          throw new Error(`User is undefined, ${record.get("id")}`);
        }

        if (!user.profile) {
          throw new Error(`User profile is undefined, ${record.get("id")}`);
        }

        const name = user.profile.display_name || user.profile.real_name;

        return {
          record,
          name,
        };
      }),
    );

    for (const { record, name } of updatedRecords) {
      const cell = usersSheet.getCell(record.rowNumber - 1, targetIndex);

      cell.value = name;
    }

    await usersSheet.saveUpdatedCells();
  }
}
