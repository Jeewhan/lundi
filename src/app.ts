import "dotenv/config";

import { App } from "@slack/bolt";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

(async () => {
  await app.start(Number(process.env.PORT) || 3000);

  console.log("⚡️ Bolt app is running!");
})();
