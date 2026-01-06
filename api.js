require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Low } = require('lowdb')
const { JSONFile } = require('lowdb/node')

const app = express()
app.use(cors())
app.use(express.json())

const adapter = new JSONFile('db.json')
const db = new Low(adapter, { executions: 0 })

async function start() {
    await db.read()

    app.post('/execute', async (req, res) => {
        console.log('🔥 EXECUTE HIT')

        if (req.headers['x-api-key'] !== process.env.API_KEY) {
            console.log('❌ INVALID API KEY:', req.headers['x-api-key'])
            return res.sendStatus(403)
        }

        db.data.executions++
        await db.write()

        console.log('✅ EXECUTIONS =', db.data.executions)

        res.json({
            success: true,
            executions: db.data.executions
        })
    })

    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        console.log('API running on port', PORT)
    })
}

start()
