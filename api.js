require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Redis } = require('@upstash/redis')

const app = express()
app.use(cors())
app.use(express.json())

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
})

// Health check (مهم لRailway)
app.get('/', (req, res) => {
  res.status(200).send('OK')
})

app.post('/execute', async (req, res) => {
  try {
    if (req.headers['x-api-key'] !== process.env.API_KEY) {
      return res.sendStatus(403)
    }

    const executions = await redis.incr('executions')

    res.json({
      success: true,
      executions
    })
  } catch (err) {
    console.error('EXECUTE ERROR:', err)
    res.status(500).json({ success: false })
  }
})

app.listen(process.env.PORT, () => {
  console.log('🚀 API running on port', process.env.PORT)
})
