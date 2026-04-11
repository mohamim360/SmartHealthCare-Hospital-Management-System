import { useState, useRef, useCallback } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

const MAX_MESSAGES_PER_SESSION = 20
const COOLDOWN_MS = 3000 // 3 seconds between messages

export function useAiChat(role?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastSentRef = useRef(0)
  const messageCountRef = useRef(0)

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return

    // Client-side cooldown
    const now = Date.now()
    if (now - lastSentRef.current < COOLDOWN_MS) {
      setError('Please wait a moment before sending another message.')
      setTimeout(() => setError(null), 2000)
      return
    }

    // Session message limit
    if (messageCountRef.current >= MAX_MESSAGES_PER_SESSION) {
      setError('Session limit reached. Clear chat to continue.')
      return
    }

    setError(null)
    lastSentRef.current = now
    messageCountRef.current++

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage.trim(),
    }

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      isStreaming: true,
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setIsLoading(true)

    // Build messages for API (only last 6 to match server-side limit)
    const apiMessages = [...messages, userMsg].slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }))

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, role }),
      })

      if (response.status === 429) {
        const data = await response.json()
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: `⏳ ${data.error || 'Rate limited. Please wait a moment and try again.'}`, isStreaming: false }
              : m,
          ),
        )
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: data.text || 'Sorry, I could not generate a response.', isStreaming: false }
            : m,
        ),
      )

      /* ── STREAMING HANDLER (commented out — for paid tier) ──
      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')
      const decoder = new TextDecoder()
      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const d = line.slice(6).trim()
            if (d === '[DONE]') continue
            try {
              const parsed = JSON.parse(d)
              if (parsed.text) {
                fullText += parsed.text
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: fullText, isStreaming: true }
                      : m,
                  ),
                )
              }
            } catch {}
          }
        }
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: fullText || 'Sorry, I could not generate a response.', isStreaming: false }
            : m,
        ),
      )
      ── END STREAMING HANDLER ── */

    } catch (err: any) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: 'Sorry, something went wrong. Please try again in a moment.', isStreaming: false }
            : m,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading])

  const clearChat = useCallback(() => {
    setMessages([])
    setIsLoading(false)
    setError(null)
    messageCountRef.current = 0
  }, [])

  return { messages, isLoading, error, sendMessage, clearChat, remainingMessages: MAX_MESSAGES_PER_SESSION - messageCountRef.current }
}
