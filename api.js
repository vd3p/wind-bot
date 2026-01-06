require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Low } = require('lowdb')
const { JSONFile } = require('lowdb/node')

const app = express()
app.use(cors())
app.use(express.json())

// ✅ حط default data هنا
const adapter = new JSONFile('db.json')
const db = new Low(adapter, { executions: 0 })

async function start() {
    await db.read()

    app.post('/execute', async (req, res) => {
        if (req.headers['x-api-key'] !== process.env.API_KEY) {
            return res.sendStatus(403)
        }

        db.data.executions++
        await db.write()

        res.json({
            success: true,
            executions: db.data.executions
        })
    })

    app.listen(process.env.PORT, () => {
        console.log('API running on port', process.env.PORT)
    })
}

start()
