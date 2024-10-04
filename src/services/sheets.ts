export interface Sheets {
  read(sheetName: string): Promise<any>;
  write(sheetName: string, data: any): Promise<void>;
}

class GoogleSpreadSheets implements Sheets {
  constructor(private readonly apiUrl: string) {}

  public async read(sheetName: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}?sheet=${sheetName}`);

    return await response.json();
  }

  public async write(sheetName: string, data: string[]): Promise<void> {
    const requestBody = JSON.stringify({
      payload: data,
    });

    await fetch(`${this.apiUrl}?sheet=${sheetName}`, {
      method: "POST",
      body: requestBody,
    });
  }
}

export default GoogleSpreadSheets;
