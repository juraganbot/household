"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, X, AlertCircle, Inbox, CheckCircle2, Calendar, User, Mail, Check, Copy, HomeIcon, Sun, Moon, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dock, DockIcon } from "@/components/ui/dock";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { TextAnimate } from "@/components/ui/text-animate";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import confetti from "canvas-confetti";

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  snippet: string;
}

export default function Home() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [needsKey, setNeedsKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fireConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // If key is needed but not provided yet
    if (needsKey && !accessKey) {
      setError("Please enter access key");
      return;
    }
    
    // Check if email is protected
    try {
      const response = await fetch("/api/verify-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, accessKey: accessKey || undefined }),
      });

      const data = await response.json();

      if (data.protected && data.locked && !accessKey) {
        setNeedsKey(true);
        setError("This email is protected. Please enter access key.");
        return;
      }

      if (!data.success) {
        setError(data.message || "Invalid access key!");
        return;
      }

      // Access granted
      setNeedsKey(false);
      await performSearch();
    } catch {
      setError("Failed to verify email protection");
    }
  };

  const performSearch = async () => {
    setIsLoading(true);
    setError(null);
    setMessages([]);
    setSearchCompleted(false);
    
    try {
      const response = await fetch("/api/search-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetEmail: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to search emails");
      }

      setMessages(data.messages || []);
      setSearchCompleted(true);
      
      if (data.messages && data.messages.length > 0) {
        setTimeout(() => fireConfetti(), 300);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleMessageClick = (message: EmailMessage) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    setCopied(false);
  };

  const handleCopyEmail = async () => {
    if (selectedMessage?.body) {
      try {
        await navigator.clipboard.writeText(selectedMessage.body);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Search error:", error);
      }
    }
  };

  const SkeletonLoader = () => (
    <motion.div 
      className="w-full px-4 sm:px-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-10" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 pt-24 pb-20 bg-gradient-to-br from-background via-background to-muted/20 relative">
      {/* Container utama */}
      <motion.main 
        className="w-full max-w-md flex flex-col items-center gap-8 text-center"
        animate={{
          marginTop: isLoading || searchCompleted ? "2rem" : "auto",
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{
          marginTop: isLoading || searchCompleted ? "2rem" : "auto",
          marginBottom: "auto",
        }}
      >
        {/* Header Section */}
        <div className="space-y-5 py-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-none pb-3 pt-2">
            Waroengku;
          </h1>
          <p className="text-muted-foreground/60 text-sm max-w-xs mx-auto">
            Search emails in the last 24 hours
          </p>
        </div>

        {/* Email Search Form - Minimal */}
        <form 
          onSubmit={handleSubmit} 
          className="w-full space-y-3 px-4 sm:px-0"
        >
          <div className="flex gap-2">
            {/* Input Minimal */}
            <div className="relative flex-1">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 text-sm border focus:border-foreground transition-colors w-full cursor-text"
              />
            </div>

            {/* Button Minimal */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-11 px-5 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              size="default"
            >
              {isLoading ? (
                <svg
                  className="animate-spin size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <Search className="size-4" />
              )}
            </Button>
          </div>

          {/* Access Key Input - Inline */}
          <AnimatePresence>
            {needsKey && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 items-start">
                  <div className="relative flex-1">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary pointer-events-none z-10" />
                    <Input
                      type="text"
                      placeholder="Enter access key (WRG-XXX-XXX)"
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      className="h-11 text-sm border-2 border-primary/50 focus:border-primary transition-colors w-full cursor-text pl-10"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNeedsKey(false)
                      setAccessKey("")
                      setError(null)
                    }}
                    className="h-11 px-3 cursor-pointer"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimal Info */}
          <p className="text-center text-xs text-muted-foreground/40">
            {needsKey ? "🔒 Protected email - Key required" : "Secure IMAP connection"}
          </p>
        </form>

        {/* Skeleton Loading */}
        {isLoading && <SkeletonLoader />}

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="w-full px-4 sm:px-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-semibold text-destructive text-sm">Error</p>
                  <p className="text-xs text-destructive/80 mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message - No Results */}
        <AnimatePresence>
          {searchCompleted && messages.length === 0 && !error && (
            <motion.div 
              className="w-full px-4 sm:px-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
                <Inbox className="size-12 mx-auto text-muted-foreground mb-3" />
                <p className="font-semibold text-sm">No messages found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No emails sent to <span className="font-mono">{email}</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        {searchCompleted && messages.length > 0 && (
          <div className="w-full px-4 sm:px-0 space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Results Header */}
            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-600 dark:text-green-500" />
                <span className="font-semibold text-sm">
                  {messages.length} message{messages.length > 1 ? "s" : ""} found
                </span>
              </div>
              <Inbox className="size-4 text-muted-foreground" />
            </div>

            <div className="relative">
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 30, scale: 0.9, rotateX: -15 }}
                      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.15,
                        ease: [0.34, 1.56, 0.64, 1],
                        opacity: { duration: 0.3 },
                        scale: { 
                          type: "spring",
                          stiffness: 200,
                          damping: 15
                        }
                      }}
                      onClick={() => handleMessageClick(message)}
                      className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200 text-left group cursor-pointer hover:bg-accent/5"
                      style={{ transformPerspective: 1000 }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <TextAnimate
                              animation="blurInUp"
                              by="character"
                              once
                              duration={0.5}
                              delay={index * 0.1}
                              className="font-semibold text-sm truncate group-hover:text-primary transition-colors flex-1"
                              as="h3"
                            >
                              {message.subject}
                            </TextAnimate>
                            {index === 0 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={{ 
                                  delay: 0.4,
                                  duration: 0.5,
                                  type: "spring",
                                  stiffness: 200,
                                  damping: 10
                                }}
                              >
                                <Badge variant="secondary" className="shrink-0 text-xs px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-500 border-green-500/20">
                                  New
                                </Badge>
                              </motion.div>
                            )}
                          </div>
                          <motion.div 
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                              delay: index * 0.15 + 0.3,
                              duration: 0.3 
                            }}
                          >
                            <Calendar className="size-3.5 shrink-0" />
                            <span>{formatDate(message.date)}</span>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <ProgressiveBlur height="25%" position="bottom" />
            </div>
          </div>
        )}
      </motion.main>

      {/* Email Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold pr-8">
              {selectedMessage?.subject || "(No Subject)"}
            </DialogTitle>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="size-4 shrink-0" />
                <span className="truncate">{selectedMessage?.from}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4 shrink-0" />
                <span>{selectedMessage?.date && formatDate(selectedMessage.date)}</span>
              </div>
              <Badge variant="outline" className="mt-2">
                Message ID: #{selectedMessage?.id}
              </Badge>
            </div>
          </DialogHeader>

          {/* Email Body - Scrollable */}
          <div className="flex-1 mt-4 border rounded-lg overflow-hidden bg-muted/20">
            <div className="bg-background/80 backdrop-blur-sm border-b px-4 py-2 sticky top-0 z-10 flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Mail className="size-4" />
                Email Content
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyEmail}
                className="gap-2 h-7 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <ScrollArea className="h-[60vh] max-h-[500px]">
              <motion.div 
                className="p-4 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {selectedMessage?.body ? (
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.body }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Inbox className="size-12 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground italic">
                      No content available
                    </p>
                  </div>
                )}
              </motion.div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center gap-2 pt-4 border-t">
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="size-3.5 text-green-600 dark:text-green-500" />
              <span>Secure IMAP connection</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
            >
              <X className="size-4" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dock - Fixed at bottom */}
      <motion.div 
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
      >
        <Dock iconSize={48} iconMagnification={64} iconDistance={150}>
          <DockIcon>
            <button
              onClick={() => window.location.reload()}
              className="w-full h-full flex items-center justify-center hover:bg-primary/10 rounded-full transition-colors"
              title="Home"
            >
              <HomeIcon className="size-5" />
            </button>
          </DockIcon>
          
          <DockIcon>
            {mounted && (
              <AnimatedThemeToggler 
                className="w-full h-full flex items-center justify-center hover:bg-primary/10 rounded-full transition-colors"
                duration={500}
              >
                <span className="size-5 flex items-center justify-center">
                  {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
                </span>
              </AnimatedThemeToggler>
            )}
            {!mounted && <div className="size-5" />}
          </DockIcon>

          <DockIcon>
            <button
              onClick={() => {
                const input = document.querySelector('input[type="email"]') as HTMLInputElement;
                input?.focus();
              }}
              className="w-full h-full flex items-center justify-center hover:bg-primary/10 rounded-full transition-colors"
              title="Focus Search"
            >
              <Search className="size-5" />
            </button>
          </DockIcon>

          <DockIcon>
            <a
              href="/admin"
              className="w-full h-full flex items-center justify-center hover:bg-primary/10 rounded-full transition-colors"
              title="Admin Dashboard"
            >
              <Settings className="size-5" />
            </a>
          </DockIcon>

          <DockIcon>
            <a
              href="mailto:waroengkubusiness@gmail.com"
              className="w-full h-full flex items-center justify-center hover:bg-primary/10 rounded-full transition-colors"
              title="Contact"
            >
              <Mail className="size-5" />
            </a>
          </DockIcon>
        </Dock>
      </motion.div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </div>
  );
}
