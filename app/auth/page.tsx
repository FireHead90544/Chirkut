"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { InputOTP } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function AuthPage() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { users, setCurrentUser, currentUser: user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    let loggedIn = false;
    for (const u of users) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: u.name, pin: code }),
        });

        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
          loggedIn = true;
          break;
        }
      } catch {
        // Ignore fetch errors and try the next user
      }
    }

    if (loggedIn) {
      setCode("")
      router.push("/")
    } else {
      setError("Invalid access code. Please check your personal code.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-card-foreground">Chirkut</CardTitle>
          <p className="text-muted-foreground">Finance Tracker</p>
          <p className="text-sm text-muted-foreground mt-2">Enter your personal access code</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <Label htmlFor="code" className="sr-only">
                Access Code
              </Label>
              <div className="flex justify-center">
                <InputOTP value={code} onChange={setCode} length={6} />
              </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading || code.length !== 6}
            >
              {loading ? "Verifying..." : "Access App"}
            </Button>
          </form>
          <div className="mt-8 text-center space-y-3">
            <p className="text-xs text-muted-foreground">Personal codes for:</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {users.map((u) => (
                <Badge key={u.id} variant='secondary'>{u.name}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
