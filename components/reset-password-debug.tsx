"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ResetPasswordDebug() {
  const [testData, setTestData] = useState({
    email: "test@example.com",
    newPassword: "testpassword123",
  })
  const [result, setResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const testEndpoint = async () => {
    setIsLoading(true)
    setResult("")

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      })

      console.log("Response status:", response.status)
      console.log("Response ok:", response.ok)

      const text = await response.text()
      console.log("Raw response:", text)

      let data
      try {
        data = JSON.parse(text)
      } catch {
        data = { rawResponse: text }
      }

      setResult(
        JSON.stringify(
          {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            data: data,
          },
          null,
          2,
        ),
      )
    } catch (error) {
      console.error("Test error:", error)
      setResult(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Reset Password API Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="testEmail">Test Email</Label>
            <Input
              id="testEmail"
              type="email"
              value={testData.email}
              onChange={(e) => setTestData((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="testPassword">Test Password</Label>
            <Input
              id="testPassword"
              type="password"
              value={testData.newPassword}
              onChange={(e) => setTestData((prev) => ({ ...prev, newPassword: e.target.value }))}
            />
          </div>
        </div>

        <Button onClick={testEndpoint} disabled={isLoading} className="w-full">
          {isLoading ? "Testing..." : "Test Reset Password API"}
        </Button>

        {result && (
          <Alert>
            <AlertDescription>
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
