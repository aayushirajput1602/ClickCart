export async function downloadInvoice(orderId: string) {
  try {
    // Get the auth token from localStorage
    const token = localStorage.getItem("auth-token")

    if (!token) {
      throw new Error("Please login to download invoice")
    }

    console.log("📄 Downloading invoice for order:", orderId)

    // Create a form to submit with the token
    const form = document.createElement("form")
    form.method = "POST"
    form.action = `/api/orders/${orderId}/invoice`
    form.target = "_blank"

    // Add token as hidden input
    const tokenInput = document.createElement("input")
    tokenInput.type = "hidden"
    tokenInput.name = "token"
    tokenInput.value = token

    form.appendChild(tokenInput)
    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  } catch (error) {
    console.error("❌ Invoice download error:", error)
    throw error
  }
}

// Alternative method using window.open with token in URL
export async function downloadInvoiceWithToken(orderId: string) {
  try {
    const token = localStorage.getItem("auth-token")

    if (!token) {
      throw new Error("Please login to download invoice")
    }

    console.log("📄 Opening invoice in new tab for order:", orderId)

    // Open invoice in new tab with token as query parameter
    const invoiceUrl = `/api/orders/${orderId}/invoice?token=${encodeURIComponent(token)}`
    window.open(invoiceUrl, "_blank")
  } catch (error) {
    console.error("❌ Invoice download error:", error)
    throw error
  }
}
