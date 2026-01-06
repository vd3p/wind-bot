require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// ================================
// Upstash Redis (REST)
// ================================
async function redis(command, ...args) {
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      command,
      args
    })
  })

  if (!response.ok) {
    throw new Error(`Redis HTTP Error: ${response.status}`)
  }

  const data = await response.json()
  return data.result
}

// ================================
// Execute endpoint
// ================================
app.post('/execute', async (req, res) => {
  try {
    // 🔐 API Key check
    if (req.headers['x-api-key'] !== process.env.API_KEY) {
      return res.sendStatus(403)
    }

    // 🔢 Increment executions counter
    const count = await redis('INCR', 'executions')

    return res.json({
      success: true,
      executions: count
    })
  } catch (err) {
    console.error('❌ EXECUTE ERROR:', err.message)

    return res.status(500).json({
      success: false,
      error: 'internal_error'
    })
  }
})

// ================================
// Start server
// ================================
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('API running on port', PORT)
})
