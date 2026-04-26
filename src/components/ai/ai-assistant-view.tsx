'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Bot,
  Send,
  Sparkles,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  User,
  Loader2,
  Target,
  Mail,
  Building2,
  BarChart3,
  Zap,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Star,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

// ─── Types ───

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Lead {
  id: string
  name: string
  email?: string | null
  phone: string
  status: string
  priority: string
  source: string
  budget?: number | null
  interestedIn?: string | null
}

// ─── Constants ───

const suggestions = [
  { icon: TrendingUp, text: "What's the sales forecast for Q1 2025?", color: 'text-emerald-600 bg-emerald-50' },
  { icon: Lightbulb, text: 'Which leads should I prioritize today?', color: 'text-amber-600 bg-amber-50' },
  { icon: MessageSquare, text: 'Generate a follow-up email for a lead', color: 'text-sky-600 bg-sky-50' },
  { icon: Sparkles, text: 'Analyze booking trends across projects', color: 'text-violet-600 bg-violet-50' },
]

const quickActions = [
  { icon: BarChart3, text: 'Analyze my pipeline', color: 'text-orange-600 bg-orange-50' },
  { icon: Target, text: 'Suggest lead priorities', color: 'text-rose-600 bg-rose-50' },
  { icon: Zap, text: 'Generate weekly report summary', color: 'text-indigo-600 bg-indigo-50' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

const messageVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25 } },
}

// ─── Helper ───

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ─── Component ───

export function AIAssistantView() {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: generateId(),
      role: 'assistant',
      content: "Hello! I'm your AI real estate assistant for Agentic Fox Labs. I can help you with lead insights, sales forecasting, property recommendations, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // AI Tools state
  const [leads, setLeads] = useState<Lead[]>([])
  const [leadsLoading, setLeadsLoading] = useState(true)
  const [selectedLeadId, setSelectedLeadId] = useState<string>('')
  const [selectedFollowUpLeadId, setSelectedFollowUpLeadId] = useState<string>('')

  // Lead scoring state
  const [scoreResult, setScoreResult] = useState<{ score: number; insights: string } | null>(null)
  const [scoreLoading, setScoreLoading] = useState(false)

  // Follow-up state
  const [followUpResult, setFollowUpResult] = useState<{ message: string; subject: string } | null>(null)
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedMessage, setCopiedMessage] = useState(false)

  // Property recommendations state
  const [prefInput, setPrefInput] = useState('')
  const [prefResult, setPrefResult] = useState<string | null>(null)
  const [prefLoading, setPrefLoading] = useState(false)

  // Sales forecast state
  const [forecastResult, setForecastResult] = useState<string | null>(null)
  const [forecastLoading, setForecastLoading] = useState(false)

  // Fetch leads on mount
  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/leads')
        if (res.ok) {
          const data = await res.json()
          setLeads(data)
        }
      } catch {
        toast.error('Failed to load leads')
      } finally {
        setLeadsLoading(false)
      }
    }
    fetchLeads()
  }, [])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isChatLoading])

  // ─── Chat Handlers ───

  const sendMessage = useCallback(async (messageText?: string) => {
    const text = messageText || inputMessage.trim()
    if (!text || isChatLoading) return

    setInputMessage('')
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsChatLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) throw new Error('Failed to get AI response')

      const data = await res.json()
      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.response || 'I apologize, but I was unable to generate a response.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      toast.error('Failed to get AI response. Please try again.')
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'I encountered an error processing your request. Please try again in a moment.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsChatLoading(false)
    }
  }, [inputMessage, isChatLoading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ─── Lead Score Handler ───

  const handleLeadScore = async () => {
    if (!selectedLeadId) {
      toast.error('Please select a lead first')
      return
    }
    setScoreLoading(true)
    setScoreResult(null)
    try {
      const res = await fetch('/api/ai/lead-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedLeadId }),
      })
      if (!res.ok) throw new Error('Failed to score lead')
      const data = await res.json()
      setScoreResult({ score: data.score, insights: data.insights })
      toast.success('Lead scored successfully!')
    } catch {
      toast.error('Failed to score lead. Please try again.')
    } finally {
      setScoreLoading(false)
    }
  }

  // ─── Follow-up Handler ───

  const handleFollowUp = async () => {
    if (!selectedFollowUpLeadId) {
      toast.error('Please select a lead first')
      return
    }
    setFollowUpLoading(true)
    setFollowUpResult(null)
    try {
      const res = await fetch('/api/ai/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selectedFollowUpLeadId }),
      })
      if (!res.ok) throw new Error('Failed to generate follow-up')
      const data = await res.json()
      setFollowUpResult({ message: data.message, subject: data.subject })
      toast.success('Follow-up message generated!')
    } catch {
      toast.error('Failed to generate follow-up. Please try again.')
    } finally {
      setFollowUpLoading(false)
    }
  }

  // ─── Property Recommendations Handler ───

  const handlePropertyRecommendations = async () => {
    if (!prefInput.trim()) {
      toast.error('Please describe the customer preferences')
      return
    }
    setPrefLoading(true)
    setPrefResult(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Based on these customer preferences, recommend the best matching properties from our portfolio: "${prefInput}". Our projects are: Skyline Towers (Mumbai - premium high-rise residential), Green Valley Villas (Pune - luxury villas), Metro Business Hub (Gurgaon - commercial offices), Sunset Park Residences (Bangalore - modern apartments). Provide specific unit type recommendations with reasoning.`,
        }),
      })
      if (!res.ok) throw new Error('Failed to get recommendations')
      const data = await res.json()
      setPrefResult(data.response)
      toast.success('Recommendations generated!')
    } catch {
      toast.error('Failed to generate recommendations. Please try again.')
    } finally {
      setPrefLoading(false)
    }
  }

  // ─── Sales Forecast Handler ───

  const handleSalesForecast = async () => {
    setForecastLoading(true)
    setForecastResult(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Generate a detailed sales forecast for the next quarter based on: 4 projects (Skyline Towers Mumbai, Green Valley Villas Pune, Metro Business Hub Gurgaon, Sunset Park Residences Bangalore), 460 total units, 200 units sold (43.5% sold), 10 active leads, 4 confirmed bookings this month. Include conversion rate predictions, revenue estimates, and recommendations for improving sales velocity.',
        }),
      })
      if (!res.ok) throw new Error('Failed to get forecast')
      const data = await res.json()
      setForecastResult(data.response)
      toast.success('Sales forecast generated!')
    } catch {
      toast.error('Failed to generate forecast. Please try again.')
    } finally {
      setForecastLoading(false)
    }
  }

  // ─── Copy to Clipboard ───

  const copyToClipboard = async (text: string, type: 'subject' | 'message') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'subject') {
        setCopiedSubject(true)
        setTimeout(() => setCopiedSubject(false), 2000)
      } else {
        setCopiedMessage(true)
        setTimeout(() => setCopiedMessage(false), 2000)
      }
      toast.success('Copied to clipboard!')
    } catch {
      toast.error('Failed to copy')
    }
  }

  // ─── Score Color ───

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200'
    if (score >= 60) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 p-4 md:p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900">AI Assistant</h1>
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">
            <Sparkles className="size-3 mr-1" />
            Powered by AI
          </Badge>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Your intelligent real estate business companion
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="chat" className="gap-1.5">
              <MessageSquare className="size-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-1.5">
              <Sparkles className="size-4" />
              AI Tools
            </TabsTrigger>
          </TabsList>

          {/* ─── Chat Tab ─── */}
          <TabsContent value="chat" className="mt-4 space-y-4">
            {/* Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suggestions.map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setInputMessage(s.text)}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${s.color}`}>
                          <Icon className="size-4" />
                        </div>
                        <p className="text-sm text-slate-700 mt-1">{s.text}</p>
                        <ArrowRight className="size-4 text-slate-400 mt-1 ml-auto shrink-0" />
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, i) => {
                  const Icon = action.icon
                  return (
                    <motion.div key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs h-8 border-slate-200"
                        onClick={() => sendMessage(action.text)}
                        disabled={isChatLoading}
                      >
                        <div className={`p-0.5 rounded ${action.color}`}>
                          <Icon className="size-3" />
                        </div>
                        {action.text}
                      </Button>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Chat Area */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="size-5 text-orange-500" />
                  Chat with AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[300px] max-h-[500px] overflow-y-auto space-y-4 mb-4 p-2 rounded-lg bg-slate-50/50">
                  <AnimatePresence mode="popLayout">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        variants={messageVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        {/* Avatar */}
                        <div className={`p-1.5 rounded-full h-fit shrink-0 ${
                          msg.role === 'user'
                            ? 'bg-orange-100'
                            : 'bg-slate-100'
                        }`}>
                          {msg.role === 'user' ? (
                            <User className="size-4 text-orange-600" />
                          ) : (
                            <Bot className="size-4 text-slate-600" />
                          )}
                        </div>
                        {/* Message Bubble */}
                        <div
                          className={`rounded-lg p-3 max-w-[80%] ${
                            msg.role === 'user'
                              ? 'bg-orange-500 text-white'
                              : 'bg-white border border-slate-200 text-slate-700'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${
                            msg.role === 'user' ? 'text-orange-200' : 'text-slate-400'
                          }`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  {isChatLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="p-1.5 rounded-full bg-slate-100 h-fit">
                        <Bot className="size-4 text-slate-600" />
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-3">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                          <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about your business..."
                    className="flex-1 h-10"
                    disabled={isChatLoading}
                  />
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white h-10 px-4"
                    onClick={() => sendMessage()}
                    disabled={isChatLoading || !inputMessage.trim()}
                  >
                    {isChatLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── AI Tools Tab ─── */}
          <TabsContent value="tools" className="mt-4 space-y-6">
            {/* Lead Scoring */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="size-5 text-orange-500" />
                  AI Lead Scoring
                  <Badge variant="secondary" className="text-[10px]">Smart</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                    <SelectTrigger className="w-full sm:w-[280px]">
                      <SelectValue placeholder="Select a lead to score..." />
                    </SelectTrigger>
                    <SelectContent>
                      {leadsLoading ? (
                        <div className="p-2 flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          <span className="text-sm text-slate-500">Loading leads...</span>
                        </div>
                      ) : leads.length === 0 ? (
                        <div className="p-2 text-sm text-slate-500">No leads found</div>
                      ) : (
                        leads.map(lead => (
                          <SelectItem key={lead.id} value={lead.id}>
                            <span className="flex items-center gap-2">
                              {lead.name}
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {lead.status}
                              </Badge>
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5"
                    onClick={handleLeadScore}
                    disabled={scoreLoading || !selectedLeadId}
                  >
                    {scoreLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Star className="size-4" />
                    )}
                    Score Lead
                  </Button>
                </div>

                {/* Score Result */}
                {scoreLoading && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                )}
                {scoreResult && !scoreLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className={`p-4 rounded-lg border ${getScoreBg(scoreResult.score)}`}>
                      <div className="flex items-center gap-3">
                        <div className={`text-4xl font-bold ${getScoreColor(scoreResult.score)}`}>
                          {scoreResult.score}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Lead Score</p>
                          <p className="text-xs text-slate-500">
                            {scoreResult.score >= 80 ? 'High probability of conversion' :
                             scoreResult.score >= 60 ? 'Moderate conversion potential' :
                             'Low conversion probability - needs nurturing'}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <ProgressRing score={scoreResult.score} />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <h4 className="font-semibold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
                        <Lightbulb className="size-4 text-amber-500" />
                        AI Insights
                      </h4>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {scoreResult.insights}
                      </p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Smart Follow-up */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="size-5 text-orange-500" />
                  Smart Follow-up Generator
                  <Badge variant="secondary" className="text-[10px]">Email</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={selectedFollowUpLeadId} onValueChange={setSelectedFollowUpLeadId}>
                    <SelectTrigger className="w-full sm:w-[280px]">
                      <SelectValue placeholder="Select a lead for follow-up..." />
                    </SelectTrigger>
                    <SelectContent>
                      {leadsLoading ? (
                        <div className="p-2 flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          <span className="text-sm text-slate-500">Loading leads...</span>
                        </div>
                      ) : leads.length === 0 ? (
                        <div className="p-2 text-sm text-slate-500">No leads found</div>
                      ) : (
                        leads.map(lead => (
                          <SelectItem key={lead.id} value={lead.id}>
                            <span className="flex items-center gap-2">
                              {lead.name}
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                {lead.priority}
                              </Badge>
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5"
                    onClick={handleFollowUp}
                    disabled={followUpLoading || !selectedFollowUpLeadId}
                  >
                    {followUpLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Mail className="size-4" />
                    )}
                    Generate Follow-up
                  </Button>
                </div>

                {/* Follow-up Result */}
                {followUpLoading && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                )}
                {followUpResult && !followUpLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {/* Subject */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Subject</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1"
                          onClick={() => copyToClipboard(followUpResult.subject, 'subject')}
                        >
                          {copiedSubject ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                          {copiedSubject ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{followUpResult.subject}</p>
                    </div>
                    {/* Message */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Message</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1"
                          onClick={() => copyToClipboard(followUpResult.message, 'message')}
                        >
                          {copiedMessage ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                          {copiedMessage ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{followUpResult.message}</p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Property Recommendations */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="size-5 text-orange-500" />
                  Property Recommendations
                  <Badge variant="secondary" className="text-[10px]">Smart</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">
                  Describe your customer&apos;s preferences and get AI-powered property matches.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={prefInput}
                    onChange={(e) => setPrefInput(e.target.value)}
                    placeholder="e.g., 3BHK in Mumbai, budget 1.5-2 Cr, looking for sea view..."
                    className="flex-1 h-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handlePropertyRecommendations()
                    }}
                  />
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5"
                    onClick={handlePropertyRecommendations}
                    disabled={prefLoading || !prefInput.trim()}
                  >
                    {prefLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Building2 className="size-4" />
                    )}
                    Get Recommendations
                  </Button>
                </div>

                {prefLoading && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                )}
                {prefResult && !prefLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{prefResult}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Sales Forecast */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="size-5 text-orange-500" />
                  Sales Forecast
                  <Badge variant="secondary" className="text-[10px]">Predictive</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Get AI-generated sales predictions based on your current pipeline and market data.
                  </p>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5 shrink-0"
                    onClick={handleSalesForecast}
                    disabled={forecastLoading}
                  >
                    {forecastLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <RefreshCw className="size-4" />
                    )}
                    Generate Forecast
                  </Button>
                </div>

                {forecastLoading && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                )}
                {forecastResult && !forecastLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{forecastResult}</p>
                  </motion.div>
                )}

                {!forecastResult && !forecastLoading && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BarChart3 className="size-10 text-slate-300 mb-3" />
                    <p className="text-sm text-slate-400">Click &quot;Generate Forecast&quot; to get AI predictions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}

// ─── Progress Ring Component ───

function ProgressRing({ score }: { score: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <svg width="68" height="68" viewBox="0 0 68 68">
      <circle
        cx="34"
        cy="34"
        r={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="5"
      />
      <circle
        cx="34"
        cy="34"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 34 34)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text
        x="34"
        y="38"
        textAnchor="middle"
        fill={color}
        fontSize="14"
        fontWeight="bold"
      >
        {score}
      </text>
    </svg>
  )
}
