import { App, Block } from "@slack/bolt";

class Slack {
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

  async post(channel: string, text: string, blocks?: Block[]) {
    await this.slack.client.chat.postMessage({
      channel,
      text,
      ...(blocks && { blocks }),
    });
  }

  async direct(users: string[], text: string) {
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
