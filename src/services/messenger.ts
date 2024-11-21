import { App, Block } from "@slack/bolt";
import type { ConversationsHistoryResponse } from "@slack/web-api/dist/response/ConversationsHistoryResponse";
import type { ConversationsRepliesResponse } from "@slack/web-api/dist/response/ConversationsRepliesResponse";
import type { ConversationsMembersResponse } from "@slack/web-api/dist/response/ConversationsMembersResponse";
import type { UsersInfoResponse } from "@slack/web-api/dist/response/UsersInfoResponse";

export interface Messenger {
  post(channel: string, text: string, blocks?: Block[]): Promise<void>;
  direct(users: string[], text: string): Promise<string>;
  createChannel(name: string): Promise<string>;
  invite(channel: string, users: string[]): Promise<void>;
  createBlocks(text: string, actionOptions: Block[]): Block[];
  conversationHistories(
    channel: string,
    options?: {
      oldest: string;
      latest: string;
    },
  ): Promise<ConversationsHistoryResponse>;
  conversationsReplies(
    channel: string,
    ts: string,
  ): Promise<ConversationsRepliesResponse>;
  conversationsMembers(
    channel: string,
    cursor?: string,
  ): Promise<ConversationsMembersResponse>;
  usersInfo(user: string): Promise<UsersInfoResponse>;
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
        `Failed to invite ${users.join(", ")} to ${channel}: ${response.error}`,
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

  public async conversationHistories(
    channel: string,
    options?: { oldest?: string; latest?: string; cursor?: string },
    accumulatedMessages: ConversationsHistoryResponse["messages"] = [],
  ): Promise<ConversationsHistoryResponse> {
    const response = await this.slack.client.conversations.history({
      channel,
      include_all_metadata: true,
      inclusive: true,
      limit: 200,
      cursor: options?.cursor,
      ...(options && { ...options }),
    });

    if (!response.messages) {
      throw new Error("Messages is undefined");
    }

    const updatedMessages = [...accumulatedMessages, ...response.messages];

    if (response.response_metadata?.next_cursor) {
      return this.conversationHistories(
        channel,
        {
          ...options,
          cursor: response.response_metadata.next_cursor,
        },
        updatedMessages,
      );
    }

    return {
      ...response,
      messages: updatedMessages.sort((a, b) => Number(a.ts) - Number(b.ts)),
    };
  }

  public async conversationsReplies(channel: string, ts: string) {
    return await this.slack.client.conversations.replies({
      channel,
      ts,
    });
  }

  public async conversationsMembers(channel: string, cursor?: string) {
    return await this.slack.client.conversations.members({
      channel,
      cursor,
    });
  }

  public async usersInfo(user: string) {
    return await this.slack.client.users.info({
      user,
    });
  }

  public async conversationsMembersList(channel: string) {
    const response = await this.slack.client.conversations.members({
      channel,
    });

    if (response.response_metadata?.next_cursor) {
      return await this.slack.client.conversations.members({
        channel,
        cursor: response.response_metadata?.next_cursor,
      });
    } else {
      return response;
    }
  }
}

export default Slack;
