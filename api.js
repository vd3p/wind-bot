require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

async function redis(cmd, ...args) {
  const res = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command: cmd, args })
  })

  const data = await res.json()
  return data.result
}

app.post('/execute', async (req, res) => {
  if (req.headers['x-api-key'] !== process.env.API_KEY) {
    return res.sendStatus(403)
  }

  const count = await redis('INCR', 'executions')
  res.json({ success: true, executions: count })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log('API running on port', PORT))
