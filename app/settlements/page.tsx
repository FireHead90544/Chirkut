'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, HandCoins, Calendar, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

interface User {
  id: string;
  name: string;
  pin: string;
}

interface Settlement {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  date: string;
  from: User;
  to: User;
  description?: string;
}

export default function SettlementsPage() {
  const { currentUser } = useAuth()
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSettlements() {
      try {
        const response = await fetch("/api/settlements")
        const data = await response.json()
        setSettlements(data)
      } catch (error) {
        console.error("Failed to fetch settlements:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettlements()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/balances">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Balances
              </Link>
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Settlement History</h1>
              <p className="text-sm text-muted-foreground">Track all payments between flatmates</p>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 mt-4 sm:mt-0">
              <Link href="/settlements/add">
                <Plus className="h-4 w-4 mr-2" />
                Add Settlement
              </Link>
            </Button>
          </div>
        </div>

        {!settlements || settlements.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-12">
              <HandCoins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No settlements yet</h3>
              <p className="text-muted-foreground mb-4">Record payments between flatmates to track settlements</p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/settlements/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Settlement
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {settlements.map((settlement) => (
              <Card key={settlement.id} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <span className="text-sm font-semibold text-red-500">
                            {settlement.from?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="text-sm font-semibold text-green-500">
                            {settlement.to?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-card-foreground">
                          {settlement.from?.name} → {settlement.to?.name}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(settlement.date).toLocaleDateString()}
                          </div>
                          {settlement.description && <span>{settlement.description}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-2xl font-bold text-green-500">₹{settlement.amount.toFixed(2)}</div>
                      <Badge variant="outline" className="text-xs border-green-500/50 text-green-500">
                        Settlement
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {settlements && settlements.length > 0 && (
          <Card className="bg-card border-border mt-8">
            <CardHeader>
              <CardTitle className="text-card-foreground">Settlement Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">{settlements.length}</div>
                  <div className="text-sm text-muted-foreground">Total Settlements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    ₹{settlements.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground">
                    {settlements.filter((s) => s.fromId === currentUser?.id || s.toId === currentUser?.id).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Your Settlements</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}