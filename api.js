require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// ================================
// Upstash Redis (REST) - DEBUG
// ================================
async function redis(command, ...args) {
  const response = await fetch(process.env.UPSTASH_REDIS_REST_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command, args })
  })

  const text = await response.text()
  console.log('🔎 REDIS RAW RESPONSE:', response.status, text)

  if (!response.ok) {
    throw new Error(`Redis HTTP ${response.status}: ${text}`)
  }

  let data
  try {
    data = JSON.parse(text)
  } catch (e) {
    throw new Error('Redis JSON parse failed: ' + text)
  }

  return data.result
}

// ================================
// Execute endpoint
// ================================
app.post('/execute', async (req, res) => {
  try {
    console.log('➡️ /execute hit')

    if (req.headers['x-api-key'] !== process.env.API_KEY) {
      console.log('❌ INVALID API KEY:', req.headers['x-api-key'])
      return res.sendStatus(403)
    }

    const count = await redis('INCR', 'executions')

    console.log('✅ EXECUTIONS =', count)

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
