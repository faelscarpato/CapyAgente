"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ApiKeyModal } from "@/components/api-key-modal"
import { CapyAgent, type AgentLog, type AgentResult } from "@/lib/capy-agent"
import {
  Brain,
  Zap,
  Search,
  Wrench,
  Puzzle,
  CheckCircle,
  Plus,
  Menu,
  X,
  FileText,
  Presentation,
  Bot,
  Settings,
  MessageSquare,
  BookOpen,
  AlertCircle,
} from "lucide-react"

interface Tool {
  name: string
  icon: React.ReactNode
  description: string
  status: "idle" | "active" | "completed"
}

export default function CapyPlanner() {
  const [request, setRequest] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [result, setResult] = useState<AgentResult | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [agent, setAgent] = useState<CapyAgent | null>(null)

  const [tools] = useState<Tool[]>([
    {
      name: "CapyResumo",
      icon: <FileText className="w-5 h-5" />,
      description: "Gera resumos inteligentes de conteúdo",
      status: "idle",
    },
    {
      name: "CapySlide",
      icon: <Presentation className="w-5 h-5" />,
      description: "Cria apresentações automaticamente",
      status: "idle",
    },
    {
      name: "CapyExplica",
      icon: <BookOpen className="w-5 h-5" />,
      description: "Explica conceitos complexos de forma didática",
      status: "idle",
    },
    {
      name: "CapyChat",
      icon: <MessageSquare className="w-5 h-5" />,
      description: "Conversação inteligente e assistência geral",
      status: "idle",
    },
  ])

  useEffect(() => {
    const savedKey = localStorage.getItem("gemini_api_key")
    if (savedKey) {
      setApiKey(savedKey)
      initializeAgent(savedKey)
    }
  }, [])

  const initializeAgent = (key: string) => {
    const newAgent = new CapyAgent(key, (log: AgentLog) => {
      setLogs((prev) => [...prev, log])
    })
    setAgent(newAgent)
  }

  const handleApiKeySet = (key: string) => {
    setApiKey(key)
    initializeAgent(key)
  }

  const executeCapyAgent = async () => {
    if (!request.trim()) return

    if (!apiKey) {
      setApiKeyModalOpen(true)
      return
    }

    if (!agent) {
      initializeAgent(apiKey)
      return
    }

    setIsProcessing(true)
    setLogs([])
    setResult(null)

    try {
      const agentResult = await agent.processRequest(request)
      setResult(agentResult)
    } catch (error) {
      console.error("Erro ao executar agente:", error)
      setLogs((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          message: "❌ Erro ao executar CapyAgente. Verifique sua conexão e API key.",
          type: "error",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const getLogIcon = (type: AgentLog["type"]) => {
    switch (type) {
      case "info":
        return <Search className="w-4 h-4 text-blue-400" />
      case "tool":
        return <Wrench className="w-4 h-4 text-amber-400" />
      case "processing":
        return <Puzzle className="w-4 h-4 text-cyan-400" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center pulse-glow">
                <Brain className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-space-grotesk">CapyPlanner</h1>
                <p className="text-sm text-muted-foreground">IA Autônoma</p>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setApiKeyModalOpen(true)}
              className={apiKey ? "text-green-600" : "text-amber-600"}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button className="gap-2 rounded-xl">
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || (typeof window !== "undefined" && window.innerWidth >= 768)) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed md:relative z-40 w-80 h-screen bg-sidebar border-r border-sidebar-border p-6"
            >
              <div className="flex items-center justify-between mb-6 md:hidden">
                <h2 className="text-lg font-semibold font-space-grotesk">Ferramentas</h2>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="hidden md:block mb-6">
                <h2 className="text-lg font-semibold font-space-grotesk mb-2">Ferramentas IA</h2>
                <p className="text-sm text-muted-foreground">Agentes disponíveis para execução</p>
              </div>

              <div className="space-y-3">
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-4 hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
                          {tool.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium font-space-grotesk">{tool.name}</h3>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {result?.toolsUsed.includes(tool.name) ? "Usado" : "Pronto"}
                        </Badge>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Request Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="p-6">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="flex items-center gap-2 font-space-grotesk">
                    <Bot className="w-5 h-5 text-primary" />
                    Envie seu pedido para a CapyAgente
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-4">
                  <Textarea
                    placeholder="Descreva o que você precisa que a IA faça... Ex: 'Crie uma apresentação sobre sustentabilidade' ou 'Faça um resumo do relatório de vendas'"
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    className="min-h-32 resize-none rounded-xl border-2 focus:border-primary transition-colors"
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={executeCapyAgent}
                    disabled={isProcessing || !request.trim()}
                    className="w-full gap-2 rounded-xl h-12 text-base font-medium"
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Zap className="w-5 h-5" />
                        </motion.div>
                        Executando CapyAgente...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Executar CapyAgente
                      </>
                    )}
                  </Button>
                  {!apiKey && (
                    <p className="text-sm text-amber-600 text-center">
                      Configure sua API key do Gemini para usar a IA real
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Logs Terminal */}
            {logs.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="font-space-grotesk">Raciocínio da IA em Tempo Real</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <div className="bg-muted/20 rounded-xl p-4 max-h-64 overflow-y-auto font-mono text-sm space-y-2">
                      <AnimatePresence>
                        {logs.map((log, index) => (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center gap-2 p-2 rounded-lg bg-card/50"
                          >
                            {getLogIcon(log.type)}
                            <span className="typing-animation cursor-blink">{log.message}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {log.timestamp.toLocaleTimeString()}
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Result */}
            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card
                  className={`p-6 border-2 ${result.success ? "border-primary/20 bg-primary/5" : "border-red-500/20 bg-red-500/5"}`}
                >
                  <CardHeader className="px-0 pt-0">
                    <CardTitle
                      className={`flex items-center gap-2 font-space-grotesk ${result.success ? "text-primary" : "text-red-500"}`}
                    >
                      {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      {result.success ? "Resultado Final" : "Erro no Processamento"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    <div className="bg-card rounded-xl p-4">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">{result.content}</pre>
                      {result.toolsUsed.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground mb-2">Ferramentas utilizadas:</p>
                          <div className="flex gap-2 flex-wrap">
                            {result.toolsUsed.map((tool) => (
                              <Badge key={tool} variant="secondary">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <ApiKeyModal open={apiKeyModalOpen} onOpenChange={setApiKeyModalOpen} onApiKeySet={handleApiKeySet} />
    </div>
  )
}
