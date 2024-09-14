import { Block } from "@slack/bolt";

export function createBlocks(
  text: string,
  actionId: string,
  actionOptions: any[]
): Block[] {
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
    {
      type: "actions",
      elements: [
        {
          type: "checkboxes",
          action_id: actionId,
          options: actionOptions,
        },
      ],
    } as Block,
  ];
}
