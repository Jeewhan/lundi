import { App, Block } from "@slack/bolt";

export interface Messenger {
  post(channel: string, text: string, blocks?: Block[]): Promise<void>;
  direct(users: string[], text: string): Promise<void>;
  createBlocks(text: string, actionOptions: Block[]): Block[];
}

class Slack implements Messenger {
  constructor(private readonly slack: App) {}

  public createBlocks(text: string, actionOptions: Block[]): Block[] {
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text,
        },
      } as Block,
      {
        type: "divider",
      },
      ...actionOptions,
    ];
  }

  public async post(channel: string, text: string, blocks?: Block[]) {
    await this.slack.client.chat.postMessage({
      channel,
      text,
      ...(blocks && { blocks }),
    });
  }

  public async direct(users: string[], text: string) {
    const { channel } = await this.slack.client.conversations.open({
      users: users.join(","),
    });

    if (channel?.id) {
      await this.slack.client.chat.postMessage({
        channel: channel.id,
        text,
      });
    }
  }
}

export default Slack;
