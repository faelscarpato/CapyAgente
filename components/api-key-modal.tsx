"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, ExternalLink, Info } from "lucide-react"

interface ApiKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApiKeySet: (apiKey: string) => void
}

export function ApiKeyModal({ open, onOpenChange, onApiKeySet }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("")
  const [savedKey, setSavedKey] = useState("")

  useEffect(() => {
    const stored = localStorage.getItem("gemini_api_key")
    if (stored) {
      setSavedKey(stored)
      setApiKey(stored)
    }
  }, [])

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim())
      setSavedKey(apiKey.trim())
      onApiKeySet(apiKey.trim())
      onOpenChange(false)
    }
  }

  const handleUseExisting = () => {
    if (savedKey) {
      onApiKeySet(savedKey)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Configurar API Key do Google Gemini
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {savedKey && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Você já tem uma chave API salva. Pode usar a existente ou configurar uma nova.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="apikey">Sua Chave API Google Gemini</Label>
              <Input
                id="apikey"
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Sua chave é salva localmente no navegador e não é enviada para nossos servidores.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!apiKey.trim()} className="flex-1">
                Salvar e Usar
              </Button>
              {savedKey && (
                <Button variant="outline" onClick={handleUseExisting}>
                  Usar Chave Existente
                </Button>
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Como obter sua chave API:</h3>
            <ol className="text-sm space-y-2 text-muted-foreground">
              <li>1. Acesse o Google AI Studio</li>
              <li>2. Crie ou selecione um projeto</li>
              <li>3. Gere sua chave API</li>
              <li>4. Copie e cole aqui</li>
            </ol>
            <Button variant="outline" size="sm" className="mt-3 bg-transparent" asChild>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ir para Google AI Studio
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
