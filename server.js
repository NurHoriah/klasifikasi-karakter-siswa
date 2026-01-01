import express from "express"
import path from "path"
import { fileURLToPath } from "url"

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3000
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

app.use(express.json())
app.use(express.static(path.join(__dirname)))

app.post("/api/login", async (req, res) => {
  try {
    const resp = await fetch(`${BACKEND_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    })
    const data = await resp.json()
    res.status(resp.status).json(data)
  } catch (err) {
    console.error("[Proxy error]:", err)
    res.status(500).json({ error: "Gagal menghubungi backend" })
  }
})

app.post("/api/register", async (req, res) => {
  try {
    const resp = await fetch(`${BACKEND_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    })
    const data = await resp.json()
    res.status(resp.status).json(data)
  } catch (err) {
    console.error("[Proxy error]:", err)
    res.status(500).json({ error: "Gagal menghubungi backend" })
  }
})

// Perbaikan: Ubah dari "/api/predict" ke "/predict" agar sesuai dengan endpoint backend
app.post("/predict", async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const resp = await fetch(`${BACKEND_URL}/predict`, {  // Ubah ke /predict
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(req.body),
    })
    const data = await resp.json()
    res.status(resp.status).json(data)
  } catch (err) {
    console.error("[Proxy error]:", err)
    res.status(500).json({ error: "Gagal menghubungi backend" })
  }
})

app.get("/api/download-all", async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const resp = await fetch(`${BACKEND_URL}/api/download-all`, {
      method: "GET",
      headers: {
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    if (!resp.ok) {
      const data = await resp.json()
      return res.status(resp.status).json(data)
    }

    const blob = await resp.blob()
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=results.csv")
    res.send(Buffer.from(await blob.arrayBuffer()))
  } catch (err) {
    console.error("[Proxy error]:", err)
    res.status(500).json({ error: "Gagal menghubungi backend" })
  }
})

app.listen(PORT, () => {
  console.log(`[Frontend] Server berjalan di http://localhost:${PORT}`)
  console.log(`[Frontend] Proxy BACKEND_URL = ${BACKEND_URL}`)
})