require('dotenv').config()
const { Client, GatewayIntentBits, ActivityType } = require('discord.js')
const { Low } = require('lowdb')
const { JSONFile } = require('lowdb/node')

// Discord Client
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
})

// LowDB setup (نفس أسلوب api.js)
const adapter = new JSONFile('db.json')
const db = new Low(adapter, { executions: 0 })

client.once('ready', async () => {
    console.log('Bot Ready')

    // تحديث الحالة كل 5 ثواني
    setInterval(async () => {
        await db.read()

        const count = db.data.executions || 0

        client.user.setActivity(
            `${count.toLocaleString()} Executions`,
            { type: ActivityType.Watching }
        )
    }, 5000)
})

client.login(process.env.DISCORD_TOKEN)
