import { App, Block } from "@slack/bolt";

class Slack {
  constructor(private readonly app: App) {}

  public async postMessage(channel: string, text: string, blocks: Block[]) {
    await this.app.client.chat.postMessage({
      channel,
      text,
      blocks,
    });
  }
}

export default Slack;
