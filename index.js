require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const { Redis } = require("@upstash/redis");

const app = express();
app.use(express.json());

// ====== Redis ======
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// ====== Discord ======
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

// ====== HTTP health check (مهم جدًا) ======
app.get("/", (req, res) => {
  res.send("OK");
});

// ====== Execute endpoint ======
app.post("/execute", async (req, res) => {
  if (req.headers["x-api-key"] !== process.env.API_KEY) {
    return res.sendStatus(403);
  }

  const count = (await redis.incr("executions")) || 0;

  // غير اسم الروم الصوتي
  const guild = client.guilds.cache.first();
  if (guild) {
    const channel = guild.channels.cache.get(process.env.VOICE_CHANNEL_ID);
    if (channel) {
      await channel.setName(`${count}`);
    }
  }

  res.json({ success: true, executions: count });
});

// ====== Start server ======
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 API running on port", process.env.PORT || 3000);
});
