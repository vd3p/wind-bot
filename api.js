require("dotenv").config()
const express = require("express")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

app.post("/execute", async (req, res) => {
    try {
        // 🔐 API KEY
        if (req.headers["x-api-key"] !== process.env.API_KEY) {
            return res.status(403).json({ success: false, error: "forbidden" })
        }

        console.log("➡️ /execute hit")

        // ✅ Upstash REST incr
        const redisRes = await fetch(
            `${REDIS_URL}/incr/executions`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${REDIS_TOKEN}`
                }
            }
        )

        const redisData = await redisRes.json()
        console.log("🔎 REDIS RESPONSE:", redisData)

        return res.json({
            success: true,
            executions: redisData.result
        })

    } catch (err) {
        console.error("❌ EXECUTE ERROR:", err)
        return res.status(500).json({
            success: false,
            error: "internal_error"
        })
    }
})

app.listen(process.env.PORT || 3000, () => {
    console.log("🚀 API running on port", process.env.PORT || 3000)
})
