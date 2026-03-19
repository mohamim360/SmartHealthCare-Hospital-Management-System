import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Trash2, Sparkles, Bot, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAiChat, type ChatMessage } from '@/hooks/useAiChat'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// ── Simple markdown-like rendering ──────────────────────────────
function renderMessageText(text: string) {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-2.5 max-w-[90%]', isUser ? 'ml-auto flex-row-reverse' : '')}>
      {/* Avatar */}
      <div
        className={cn(
          'h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary/10 text-primary',
        )}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-md'
            : 'bg-muted/80 text-foreground rounded-tl-md border border-border/50',
        )}
      >
        {message.content ? (
          <div className="whitespace-pre-wrap break-words">
            {message.content.split('\n').map((line, i) => (
              <div key={i} className={line.startsWith('- ') || line.startsWith('• ') ? 'pl-2' : ''}>
                {renderMessageText(line)}
              </div>
            ))}
          </div>
        ) : message.isStreaming ? (
          <div className="flex items-center gap-1.5 py-1">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ── Suggestion chips ────────────────────────────────────────────
const QUICK_PROMPTS = [
  '🤒 Check my symptoms',
  '💊 Medication info',
  '🏥 Find a specialist',
  '🍎 Wellness tips',
]

interface AiChatWidgetProps {
  context?: 'landing' | 'dashboard'
}

export function AiChatWidget({ context = 'landing' }: AiChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, isLoading, error, sendMessage, clearChat, remainingMessages } = useAiChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    sendMessage(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={() => setIsOpen(true)}
              className={cn(
                'group relative h-14 w-14 rounded-full shadow-xl flex items-center justify-center',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 hover:shadow-2xl hover:scale-105',
                'transition-all duration-300 ease-out',
              )}
              aria-label="Open AI Health Assistant"
            >
              <Sparkles className="h-6 w-6" />
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              {/* Tooltip */}
              <span className="absolute bottom-full mb-3 right-0 px-3 py-1.5 rounded-lg bg-card text-card-foreground text-xs font-medium shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                AI Health Assistant
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed z-50 flex flex-col bg-background border border-border shadow-2xl overflow-hidden',
              /* Desktop */
              'bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh] rounded-2xl',
              /* Mobile — full screen */
              'max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:max-h-full max-sm:rounded-none',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-background/15 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">HealthAI Assistant</h3>
                  <p className="text-xs text-primary-foreground/70">Powered by Z.AI</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-1.5 rounded-lg hover:bg-background/15 transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-background/15 transition-colors"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-5 py-8">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center ">
                    <Sparkles className="h-8 w-8 text-violet-500" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-semibold">Hello! I'm HealthAI 👋</h4>
                    <p className="text-sm text-muted-foreground max-w-[260px]">
                      Ask me about symptoms, health tips, or finding the right specialist.
                    </p>
                  </div>
                  {/* Quick prompts */}
                  <div className="grid grid-cols-2 gap-2 w-full max-w-[300px]">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className={cn(
                          'text-xs px-3 py-2.5 rounded-xl border bg-muted/50 text-left',
                          'hover:bg-muted hover:border-primary/30 transition-colors',
                          'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t px-3 py-3 bg-muted/30">
              {error && (
                <div className="mb-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs">
                  {error}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about symptoms, health tips..."
                  disabled={isLoading}
                  className={cn(
                    'flex-1 text-sm bg-background border rounded-xl px-3.5 py-2.5',
                    'focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40',
                    'placeholder:text-muted-foreground/60',
                    'disabled:opacity-60',
                  )}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    'h-10 w-10 rounded-xl shrink-0',
                    'bg-primary text-primary-foreground hover:bg-primary/90',
                    'disabled:opacity-40',
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/60 text-center mt-1.5">
                HealthAI may make mistakes. Always consult a doctor.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
