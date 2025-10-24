"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Eye, EyeOff, Shield, LogOut, X, Upload, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { DataTable } from "./data-table"
import { createColumns, ProtectedEmail } from "./columns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [password, setPassword] = useState("")
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [sessionExpiry, setSessionExpiry] = useState<string | null>(null)
  const [protectedEmails, setProtectedEmails] = useState<ProtectedEmail[]>([])
  const [stats, setStats] = useState({ total: 0, locked: 0, unlocked: 0 })
  const [newEmail, setNewEmail] = useState("")
  const [customKey, setCustomKey] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [showBatchImport, setShowBatchImport] = useState(false)
  const [batchData, setBatchData] = useState("")
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [batchResult, setBatchResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null)
  const [viewKeyDialog, setViewKeyDialog] = useState<{ open: boolean; email: ProtectedEmail | null }>({ open: false, email: null })

  useEffect(() => {
    verifySession()
  }, [])

  useEffect(() => {
    if (isAuthenticated && authToken) {
      loadProtectedEmails()
      const interval = setInterval(() => {
        verifySession()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, authToken])

  const verifySession = async () => {
    const token = localStorage.getItem('adminToken')
    const expiry = localStorage.getItem('tokenExpires')
    
    if (!token) {
      setIsLoading(false)
      return
    }
    
    if (expiry && new Date(expiry) < new Date()) {
      handleLogout()
      return
    }
    
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.valid) {
          setAuthToken(token)
          setSessionExpiry(expiry)
          setIsAuthenticated(true)
        } else {
          handleLogout()
        }
      } else {
        handleLogout()
      }
    } catch {
      handleLogout()
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('tokenExpires', data.expiresAt)
        setAuthToken(data.token)
        setSessionExpiry(data.expiresAt)
        setIsAuthenticated(true)
        setPassword('')
      } else {
        setLoginError(data.error || 'Login failed')
      }
    } catch {
      setLoginError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })
      } catch {
      }
    }
    
    localStorage.removeItem('adminToken')
    localStorage.removeItem('tokenExpires')
    setAuthToken(null)
    setSessionExpiry(null)
    setIsAuthenticated(false)
    setProtectedEmails([])
  }

  const loadProtectedEmails = async () => {
    if (!authToken) return
    
    try {
      const response = await fetch("/api/protected-emails", {
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setProtectedEmails(data.emails || [])
        setStats(data.stats || { total: 0, locked: 0, unlocked: 0 })
      }
    } catch (error) {
      console.error("Failed to load protected emails:", error)
    }
  }

  const handleAddEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      alert("Please enter a valid email address")
      return
    }

    const finalKey = customKey.trim() || `WRG-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`

    try {
      const response = await fetch("/api/protected-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ 
          email: newEmail,
          accessKey: finalKey 
        }),
      })

      if (response.ok) {
        await loadProtectedEmails()
        setShowAddForm(false)
        setNewEmail("")
        setCustomKey("")
      }
    } catch {
      alert("Error adding email")
    }
  }

  const handleToggleLock = async (id: string) => {
    const email = protectedEmails.find(e => e._id === id)
    if (!email) return

    try {
      const response = await fetch("/api/protected-emails", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ 
          id, 
          updates: { isLocked: !email.isLocked } 
        }),
      })

      if (response.ok) {
        await loadProtectedEmails()
      }
    } catch {
      alert("Error toggling lock")
    }
  }

  const handleDeleteEmail = async (id: string) => {
    if (confirm("Are you sure you want to delete this protected email?")) {
      try {
        const response = await fetch(`/api/protected-emails?id=${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        })

        if (response.ok) {
          await loadProtectedEmails()
        }
      } catch {
        alert("Error deleting email")
      }
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleViewKey = (id: string) => {
    const email = protectedEmails.find(e => e._id === id)
    if (email) {
      setViewKeyDialog({ open: true, email })
    }
  }

  const handleBatchImport = async () => {
    if (!batchData.trim()) {
      alert("Please enter batch data")
      return
    }

    setBatchProcessing(true)
    setBatchResult(null)

    const lines = batchData.trim().split('\n')
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      const parts = trimmedLine.split('|').map(p => p.trim())
      if (parts.length !== 2) {
        errors.push(`Invalid format: ${trimmedLine}`)
        failed++
        continue
      }

      const [email, key] = parts
      if (!email.includes('@')) {
        errors.push(`Invalid email: ${email}`)
        failed++
        continue
      }

      try {
        const response = await fetch("/api/protected-emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
          body: JSON.stringify({ email, accessKey: key }),
        })

        if (response.ok) {
          success++
        } else {
          const data = await response.json()
          errors.push(`${email}: ${data.error || 'Failed'}`)
          failed++
        }
      } catch {
        errors.push(`${email}: Network error`)
        failed++
      }
    }

    setBatchResult({ success, failed, errors })
    setBatchProcessing(false)
    await loadProtectedEmails()
  }

  const handleExportCSV = () => {
    const csv = [
      ['Email', 'Access Key', 'Status', 'Created At'],
      ...protectedEmails.map(e => [
        e.email,
        e.accessKey,
        e.isLocked ? 'Locked' : 'Unlocked',
        new Date(e.createdAt).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `protected-emails-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns = createColumns(
    handleToggleLock,
    handleDeleteEmail,
    handleViewKey,
    handleCopyKey,
    copiedKey
  )

  if (isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-2">
            <CardContent className="pt-6 space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="size-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Admin Login</h1>
                <p className="text-sm text-muted-foreground">Enter password to access dashboard</p>
              </div>
              
              {loginError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
                  {loginError}
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10 cursor-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage protected email access</p>
            {sessionExpiry && (
              <p className="text-xs text-muted-foreground/70 mt-1">
                Session expires: {new Date(sessionExpiry).toLocaleString()}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={handleLogout} className="cursor-pointer">
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{stats.locked}</p>
                <p className="text-xs text-muted-foreground mt-1">Locked</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{stats.unlocked}</p>
                <p className="text-xs text-muted-foreground mt-1">Unlocked</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3"
        >
          {!showAddForm && !showBatchImport && (
            <>
              <Button onClick={() => setShowAddForm(true)} className="cursor-pointer">
                <Plus className="size-4 mr-2" />
                Add Email
              </Button>
              <Button onClick={() => setShowBatchImport(true)} variant="outline" className="cursor-pointer">
                <Upload className="size-4 mr-2" />
                Batch Import
              </Button>
              <Button onClick={handleExportCSV} variant="outline" className="cursor-pointer" disabled={protectedEmails.length === 0}>
                <FileText className="size-4 mr-2" />
                Export CSV
              </Button>
            </>
          )}
          
          {showAddForm && (
            <Card className="border-2 border-primary/50 w-full">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Add New Protected Email</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewEmail("")
                      setCustomKey("")
                    }}
                    className="cursor-pointer"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="cursor-text"
                  />
                  <Input
                    type="text"
                    placeholder="Custom key (optional)"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    className="cursor-text"
                  />
                  <Button onClick={handleAddEmail} className="w-full cursor-pointer">
                    <Plus className="size-4 mr-2" />
                    Add Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {showBatchImport && (
            <Card className="border-2 border-primary/50 w-full">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Batch Import Licenses</h3>
                    <p className="text-xs text-muted-foreground mt-1">Format: email | key (one per line)</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowBatchImport(false)
                      setBatchData("")
                      setBatchResult(null)
                    }}
                    className="cursor-pointer"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <textarea
                    placeholder="user1@example.com | KEY123&#10;user2@example.com | KEY456"
                    value={batchData}
                    onChange={(e) => setBatchData(e.target.value)}
                    rows={8}
                    className="w-full p-3 text-sm border rounded-md bg-background resize-none font-mono"
                  />
                  
                  {batchResult && (
                    <div className="space-y-2">
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600 font-medium">✓ Success: {batchResult.success}</span>
                        <span className="text-red-600 font-medium">✗ Failed: {batchResult.failed}</span>
                      </div>
                      
                      {batchResult.errors.length > 0 && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 max-h-32 overflow-y-auto">
                          <p className="text-xs font-medium text-destructive mb-2">Errors:</p>
                          {batchResult.errors.map((error, i) => (
                            <p key={i} className="text-xs text-destructive/80">• {error}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleBatchImport} 
                    className="w-full cursor-pointer" 
                    disabled={batchProcessing || !batchData.trim()}
                  >
                    {batchProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="size-4 mr-2" />
                        Import Licenses
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <DataTable columns={columns} data={protectedEmails} />
        </motion.div>
      </div>

      <Dialog open={viewKeyDialog.open} onOpenChange={(open) => setViewKeyDialog({ open, email: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Full Access Key</DialogTitle>
            <DialogDescription>
              {viewKeyDialog.email?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <code className="block bg-muted p-4 rounded text-sm break-all font-mono">
              {viewKeyDialog.email?.accessKey}
            </code>
            <Button 
              onClick={() => viewKeyDialog.email && handleCopyKey(viewKeyDialog.email.accessKey)} 
              className="w-full"
            >
              Copy to Clipboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
