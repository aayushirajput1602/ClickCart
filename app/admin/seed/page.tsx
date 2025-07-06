"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw, Database, AlertTriangle } from "lucide-react"

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [forceLoading, setForceLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const seedDatabase = async (force = false) => {
    try {
      if (force) {
        setForceLoading(true)
      } else {
        setLoading(true)
      }

      setError(null)

      const response = await fetch(`/api/seed`, {
        method: force ? "POST" : "GET",
      })

      const data = await response.json()
      setResult(data)

      if (!response.ok) {
        setError(data.error || "Unknown error occurred")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to seed database")
    } finally {
      setLoading(false)
      setForceLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Database Seeding Tool</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Seeding
            </CardTitle>
            <CardDescription>
              Use this tool to seed your database with product data. This is useful if your database is empty or you
              want to reset it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500">
                  <strong>Regular Seed:</strong> Only adds products if the database is empty
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Force Seed:</strong> Deletes all existing products and adds fresh data
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Result:</h3>
                  <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={() => seedDatabase(false)} disabled={loading || forceLoading}>
              {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Seed Database
            </Button>
            <Button variant="destructive" onClick={() => seedDatabase(true)} disabled={loading || forceLoading}>
              {forceLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Force Seed Database
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
