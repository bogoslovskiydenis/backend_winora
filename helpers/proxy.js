const proxy = async (url) => {
  const res = {
    status: "ok",
    body: ""
  }
  try {
    const response = await fetch("https://parser-b5x5.onrender.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8"
      },
      body: JSON.stringify({ url })
    })

    if (!response.ok) {
      console.log(`Network error: ${response.status} ${response.statusText}`)
      res.status = "error"
      return res
    }
    const data = await response.json()
    res.body = data.body
    return res
  } catch (error) {
    console.error("Error fetching data:", error)
    res.status = "error"
    return res
  }
}
module.exports = proxy
