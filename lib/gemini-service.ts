interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

interface ToolResult {
  toolName: string
  result: string
  success: boolean
}

export class GeminiService {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }

      console.log("[v0] Enviando requisição para Gemini:", JSON.stringify(requestBody, null, 2))

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] Status da resposta:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Erro da API:", errorText)
        throw new Error(`Erro na API: ${response.status} - ${errorText}`)
      }

      const data: GeminiResponse = await response.json()
      console.log("[v0] Resposta da API:", data)

      return data.candidates[0]?.content?.parts[0]?.text || "Erro ao gerar resposta"
    } catch (error) {
      console.error("[v0] Erro ao chamar Gemini API:", error)
      throw error
    }
  }

  async analyzeRequest(userRequest: string): Promise<{
    tools: string[]
    reasoning: string
  }> {
    const prompt = `
Analise a seguinte solicitação do usuário e determine quais ferramentas do CapyUniverse devem ser usadas:

Solicitação: "${userRequest}"

Ferramentas disponíveis:
- CapyResumo: Para resumir textos, artigos, documentos
- CapySlide: Para criar apresentações e slides
- CapyExplica: Para explicar conceitos complexos
- CapyChat: Para conversas gerais

Responda APENAS no formato JSON:
{
  "tools": ["ferramenta1", "ferramenta2"],
  "reasoning": "explicação breve do raciocínio"
}
`

    try {
      const response = await this.generateContent(prompt)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return {
        tools: ["CapyChat"],
        reasoning: "Não foi possível determinar ferramentas específicas",
      }
    } catch (error) {
      return {
        tools: ["CapyChat"],
        reasoning: "Erro na análise da solicitação",
      }
    }
  }

  async executeCapyResumo(content: string): Promise<ToolResult> {
    const prompt = `
Como CapyResumo, uma IA especializada em resumos, analise o seguinte conteúdo e crie um resumo conciso e informativo:

Conteúdo: "${content}"

Crie um resumo que:
- Capture os pontos principais
- Seja claro e objetivo
- Mantenha as informações essenciais
- Tenha no máximo 3 parágrafos

Resumo:
`

    try {
      const result = await this.generateContent(prompt)
      return {
        toolName: "CapyResumo",
        result,
        success: true,
      }
    } catch (error) {
      return {
        toolName: "CapyResumo",
        result: "Erro ao gerar resumo",
        success: false,
      }
    }
  }

  async executeCapySlide(topic: string): Promise<ToolResult> {
    const prompt = `
Como CapySlide, uma IA especializada em criar apresentações, desenvolva uma estrutura de slides para o tópico:

Tópico: "${topic}"

Crie uma estrutura de apresentação com:
- Título principal
- 5-7 slides principais com títulos e pontos-chave
- Slide de conclusão
- Sugestões visuais para cada slide

Formato da resposta:
SLIDE 1: [Título]
- Ponto principal 1
- Ponto principal 2
[Sugestão visual]

Continue para todos os slides...
`

    try {
      const result = await this.generateContent(prompt)
      return {
        toolName: "CapySlide",
        result,
        success: true,
      }
    } catch (error) {
      return {
        toolName: "CapySlide",
        result: "Erro ao gerar slides",
        success: false,
      }
    }
  }

  async executeCapyExplica(concept: string): Promise<ToolResult> {
    const prompt = `
Como CapyExplica, uma IA especializada em explicações didáticas, explique o seguinte conceito de forma clara e acessível:

Conceito: "${concept}"

Forneça uma explicação que:
- Seja fácil de entender
- Use exemplos práticos
- Seja estruturada e organizada
- Inclua analogias quando apropriado

Explicação:
`

    try {
      const result = await this.generateContent(prompt)
      return {
        toolName: "CapyExplica",
        result,
        success: true,
      }
    } catch (error) {
      return {
        toolName: "CapyExplica",
        result: "Erro ao gerar explicação",
        success: false,
      }
    }
  }
}
