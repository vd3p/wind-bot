require("dotenv").config()

/* ================== IMPORTS ================== */
const express = require("express")
const cors = require("cors")
const { Client, GatewayIntentBits } = require("discord.js")
const { Redis } = require("@upstash/redis")

/* ================== DISCORD ================== */
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
})

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`)
})

client.login(process.env.DISCORD_TOKEN)

/* ================== REDIS ================== */
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

/* ================== EXPRESS API ================== */
const app = express()
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("OK")
})

/* ================== UPDATE VOICE CHANNEL ================== */
async function updateVoiceChannel(count) {
  try {
    const channel = await client.channels.fetch(
      process.env.VOICE_CHANNEL_ID
    )

    if (!channel) {
      console.log("❌ Channel not found")
      return
    }

    // 2 = Voice Channel
    if (channel.type !== 2) {
      console.log("❌ Not a voice channel")
      return
    }

    const newName = `${count}`

    if (channel.name !== newName) {
      await channel.setName(newName)
      console.log("🔁 Channel renamed to:", newName)
    }
  } catch (err) {
    console.error("❌ Rename error:", err.message)
  }
}

/* ================== EXECUTE ENDPOINT ================== */
app.post("/execute", async (req, res) => {
  try {
    if (req.headers["x-api-key"] !== process.env.API_KEY) {
      return res.sendStatus(403)
    }

    const executions = await redis.incr("executions")

    await updateVoiceChannel(executions)

    res.json({
      success: true,
      executions
    })
  } catch (err) {
    console.error("EXECUTE ERROR:", err)
    res.status(500).json({ success: false })
  }
})

/* ================== START SERVER ================== */
app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 API running on port", process.env.PORT || 3000)
})
