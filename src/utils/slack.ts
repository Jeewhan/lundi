import { Block } from "@slack/bolt";

export function createBlocks(text: string, actionOptions: Block[]): Block[] {
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
