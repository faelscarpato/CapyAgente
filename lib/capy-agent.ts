import { GeminiService } from "./gemini-service"

export interface AgentLog {
  id: string
  message: string
  type: "info" | "tool" | "success" | "processing" | "error"
  timestamp: Date
}

export interface AgentResult {
  content: string
  toolsUsed: string[]
  success: boolean
}

export class CapyAgent {
  private geminiService: GeminiService
  private onLog: (log: AgentLog) => void

  constructor(apiKey: string, onLog: (log: AgentLog) => void) {
    this.geminiService = new GeminiService(apiKey)
    this.onLog = onLog
  }

  private addLog(message: string, type: AgentLog["type"]) {
    this.onLog({
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date(),
    })
  }

  async processRequest(userRequest: string): Promise<AgentResult> {
    try {
      this.addLog("🔍 Analisando pedido...", "info")
      await this.delay(1000)

      this.addLog("🧠 CapyAgente iniciada - processando requisição", "processing")
      await this.delay(1500)

      // Analisa qual ferramenta usar
      const analysis = await this.geminiService.analyzeRequest(userRequest)
      this.addLog(`💭 Raciocínio: ${analysis.reasoning}`, "info")
      await this.delay(1000)

      const results: string[] = []
      const toolsUsed: string[] = []

      // Executa as ferramentas necessárias
      for (const tool of analysis.tools) {
        this.addLog(`🛠️ Usando ferramenta ${tool}...`, "tool")
        await this.delay(2000)

        let toolResult
        switch (tool) {
          case "CapyResumo":
            toolResult = await this.geminiService.executeCapyResumo(userRequest)
            break
          case "CapySlide":
            toolResult = await this.geminiService.executeCapySlide(userRequest)
            break
          case "CapyExplica":
            toolResult = await this.geminiService.executeCapyExplica(userRequest)
            break
          default:
            // Para CapyChat ou outras ferramentas, usa geração direta
            toolResult = {
              toolName: tool,
              result: await this.geminiService.generateContent(userRequest),
              success: true,
            }
        }

        if (toolResult.success) {
          results.push(`**${toolResult.toolName}:**\n${toolResult.result}`)
          toolsUsed.push(toolResult.toolName)
          this.addLog(`✅ ${toolResult.toolName} executada com sucesso`, "success")
        } else {
          this.addLog(`❌ Erro ao executar ${toolResult.toolName}`, "error")
        }

        await this.delay(1000)
      }

      this.addLog("⚡ Otimizando resultado final...", "processing")
      await this.delay(1000)

      this.addLog("✅ Entrega finalizada!", "success")

      return {
        content: results.join("\n\n---\n\n"),
        toolsUsed,
        success: true,
      }
    } catch (error) {
      this.addLog("❌ Erro durante o processamento", "error")
      return {
        content: "Erro ao processar solicitação. Verifique sua chave API.",
        toolsUsed: [],
        success: false,
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
