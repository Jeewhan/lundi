export interface Sheets {
  read(sheetName: string): Promise<any>;
  write(sheetName: string, data: any): Promise<void>;
}

class GoogleSpreadSheets implements Sheets {
  public async read(sheetName: string): Promise<any> {
    const response = await fetch(
      `${process.env.APPS_SCRIPT_API_URL as string}?sheet=${sheetName}`
    );

    return await response.json();
  }

  public async write(sheetName: string, data: string[]): Promise<void> {
    const requestBody = JSON.stringify({
      payload: data,
    });

    await fetch(
      `${process.env.APPS_SCRIPT_API_URL as string}?sheet=${sheetName}`,
      {
        method: "POST",
        body: requestBody,
      }
    );
  }
}

export default GoogleSpreadSheets;
