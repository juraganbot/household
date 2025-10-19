"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock, Unlock, Key, Trash2, Plus, Eye, EyeOff, Copy, Check, Shield, LogOut, X, Edit2, Save } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ProtectedEmail {
  id: string
  email: string
  accessKey: string
  createdAt: string
  isLocked: boolean
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminKey, setAdminKey] = useState("")
  const [protectedEmails, setProtectedEmails] = useState<ProtectedEmail[]>([])
  const [newEmail, setNewEmail] = useState("")
  const [customKey, setCustomKey] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedEmailId, setExpandedEmailId] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showAdminKey, setShowAdminKey] = useState(false)
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null)
  const [newKeyValue, setNewKeyValue] = useState("")

  const ADMIN_MASTER_KEY = "WAROENGKU_ADMIN_2025"

  useEffect(() => {
    if (isAuthenticated) {
      loadProtectedEmails()
    }
  }, [isAuthenticated])

  const loadProtectedEmails = async () => {
    try {
      const response = await fetch("/api/protected-emails", {
        headers: {
          "x-admin-key": ADMIN_MASTER_KEY,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setProtectedEmails(data.emails || [])
      }
    } catch (error) {
      console.error("Failed to load protected emails:", error)
    }
  }

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (adminKey === ADMIN_MASTER_KEY) {
      setIsAuthenticated(true)
      setAdminKey("")
    } else {
      alert("Invalid admin key!")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAdminKey("")
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
          "x-admin-key": ADMIN_MASTER_KEY,
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
      } else {
        alert("Failed to add email")
      }
    } catch (error) {
      alert("Error adding email")
    }
  }

  const handleToggleLock = async (id: string) => {
    const email = protectedEmails.find(e => e.id === id)
    if (!email) return

    try {
      const response = await fetch("/api/protected-emails", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": ADMIN_MASTER_KEY,
        },
        body: JSON.stringify({ 
          id, 
          updates: { isLocked: !email.isLocked } 
        }),
      })

      if (response.ok) {
        await loadProtectedEmails()
      }
    } catch (error) {
      alert("Error toggling lock")
    }
  }

  const handleDeleteEmail = async (id: string) => {
    if (confirm("Are you sure you want to delete this protected email?")) {
      try {
        const response = await fetch(`/api/protected-emails?id=${id}`, {
          method: "DELETE",
          headers: {
            "x-admin-key": ADMIN_MASTER_KEY,
          },
        })

        if (response.ok) {
          await loadProtectedEmails()
        }
      } catch (error) {
        alert("Error deleting email")
      }
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handleUpdateKey = async (id: string) => {
    if (!newKeyValue.trim()) {
      alert("Please enter a valid key")
      return
    }

    try {
      const response = await fetch("/api/protected-emails", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": ADMIN_MASTER_KEY,
        },
        body: JSON.stringify({ 
          id, 
          updates: { accessKey: newKeyValue } 
        }),
      })

      if (response.ok) {
        await loadProtectedEmails()
        setEditingKeyId(null)
        setNewKeyValue("")
      }
    } catch (error) {
      alert("Error updating key")
    }
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
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Enter master key to access</p>
              </div>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="relative">
                  <Input
                    type={showAdminKey ? "text" : "password"}
                    placeholder="Enter admin master key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    required
                    className="pr-10 cursor-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminKey(!showAdminKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showAdminKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <Button type="submit" className="w-full cursor-pointer">
                  <Key className="size-4 mr-2" />
                  Access Dashboard
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage protected email access</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="cursor-pointer">
            <LogOut className="size-4 mr-2" />
            Logout
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{protectedEmails.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-red-600">{protectedEmails.filter(e => e.isLocked).length}</p>
                <p className="text-xs text-muted-foreground mt-1">Locked</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{protectedEmails.filter(e => !e.isLocked).length}</p>
                <p className="text-xs text-muted-foreground mt-1">Unlocked</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Email Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} className="cursor-pointer">
              <Plus className="size-4 mr-2" />
              Add Protected Email
            </Button>
          ) : (
            <Card className="border-2 border-primary/50">
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
                    placeholder="Custom key (optional, auto-generated if empty)"
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
        </motion.div>

        {/* Protected Emails List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {protectedEmails.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Shield className="size-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No protected emails yet</p>
                  <p className="text-sm text-muted-foreground/60">Add an email to get started</p>
                </CardContent>
              </Card>
            ) : (
              protectedEmails.map((email, index) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:border-primary/30 transition-colors">
                    <CardContent className="py-4">
                      <div className="space-y-3">
                        {/* Email Info */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-full ${email.isLocked ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                              {email.isLocked ? (
                                <Lock className="size-4 text-red-600 dark:text-red-500" />
                              ) : (
                                <Unlock className="size-4 text-green-600 dark:text-green-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{email.email}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(email.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={email.isLocked ? "destructive" : "default"} className="shrink-0">
                              {email.isLocked ? "Locked" : "Unlocked"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedEmailId(expandedEmailId === email.id ? null : email.id)}
                              className="cursor-pointer"
                            >
                              <Key className="size-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleLock(email.id)}
                              className="cursor-pointer"
                            >
                              {email.isLocked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEmail(email.id)}
                              className="cursor-pointer text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Expanded Key Section */}
                        <AnimatePresence>
                          {expandedEmailId === email.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 border-t space-y-3">
                                <p className="text-sm font-medium">Access Key:</p>
                                {editingKeyId === email.id ? (
                                  <div className="flex gap-2">
                                    <Input
                                      type="text"
                                      value={newKeyValue}
                                      onChange={(e) => setNewKeyValue(e.target.value)}
                                      placeholder="Enter new key"
                                      className="cursor-text"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleUpdateKey(email.id)}
                                      className="cursor-pointer"
                                    >
                                      <Save className="size-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingKeyId(null)
                                        setNewKeyValue("")
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <X className="size-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex gap-2">
                                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm break-all">
                                      {email.accessKey}
                                    </code>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCopyKey(email.accessKey)}
                                      className="cursor-pointer shrink-0"
                                    >
                                      {copiedKey === email.accessKey ? (
                                        <Check className="size-4" />
                                      ) : (
                                        <Copy className="size-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingKeyId(email.id)
                                        setNewKeyValue(email.accessKey)
                                      }}
                                      className="cursor-pointer shrink-0"
                                    >
                                      <Edit2 className="size-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
