import { App, Block } from "@slack/bolt";

export interface Messenger {
  post(channel: string, text: string, blocks?: Block[]): Promise<void>;
  direct(users: string[], text: string): Promise<string>;
  createChannel(name: string): Promise<string>;
  invite(channel: string, users: string[]): Promise<void>;
  createBlocks(text: string, actionOptions: Block[]): Block[];
}

class Slack implements Messenger {
  constructor(private readonly slack: App) {}

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

    if (!channel?.id) {
      throw new Error("Failed to open direct message channel");
    }

    await this.slack.client.chat.postMessage({
      channel: channel.id,
      text,
    });

    return channel.id;
  }

  public async createChannel(name: string) {
    const response = await this.slack.client.conversations.create({
      name,
    });

    if (!response.channel?.id) {
      throw new Error(`Failed to create ${name}: ${response.error}`);
    }

    return response.channel.id;
  }

  public async invite(channel: string, users: string[]) {
    const response = await this.slack.client.conversations.invite({
      channel,
      users: users.join(","),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to invite ${users.join(", ")} to ${channel}: ${response.error}`
      );
    }
  }

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
}

export default Slack;
