/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from 'react'
import { WebviewOptions } from '@llm-canvas/sdk'

interface WebviewHookResult {
  // Content
  html: string
  setHtml: (html: string) => void

  // Communication
  postMessage: (message: any) => Promise<boolean>
  onMessage: (handler: (message: any) => void) => () => void

  // State
  ready: boolean
  loading: boolean
  error: string | null

  // Refs
  iframeRef: React.RefObject<HTMLIFrameElement | null>
}

export function useWebview(options: WebviewOptions = {}): WebviewHookResult {
  const [html, setHtmlState] = useState('')
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const messageHandlers = useRef<Set<(message: any) => void>>(new Set())

  const setHtml = useCallback(
    (newHtml: string) => {
      setHtmlState(newHtml)
      setLoading(true)
      setError(null)

      const iframe = iframeRef.current
      if (iframe && iframe.contentDocument) {
        try {
          // Create security-enhanced HTML
          const secureHtml = createSecureHtml(newHtml, options)

          iframe.contentDocument.open()
          iframe.contentDocument.write(secureHtml)
          iframe.contentDocument.close()

          setReady(true)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to set HTML')
        } finally {
          setLoading(false)
        }
      }
    },
    [options]
  )

  const postMessage = useCallback(
    async (message: any): Promise<boolean> => {
      const iframe = iframeRef.current
      if (iframe && iframe.contentWindow && ready) {
        try {
          iframe.contentWindow.postMessage(message, '*')
          return true
        } catch (err) {
          console.error('Failed to post message to webview:', err)
          return false
        }
      }
      return false
    },
    [ready]
  )

  const onMessage = useCallback((handler: (message: any) => void) => {
    messageHandlers.current.add(handler)

    return () => {
      messageHandlers.current.delete(handler)
    }
  }, [])

  // Set up message handling
  useEffect(() => {
    const handleMessage = (event: MessageEvent): void => {
      const iframe = iframeRef.current
      if (event.source === iframe?.contentWindow) {
        // Call all registered handlers
        messageHandlers.current.forEach((handler) => {
          try {
            handler(event.data)
          } catch (err) {
            console.error('Error in webview message handler:', err)
          }
        })
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Handle iframe load
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = (): void => {
      setReady(true)
      setLoading(false)
    }

    const handleError = (): void => {
      setError('Failed to load webview')
      setLoading(false)
      setReady(false)
    }

    iframe.addEventListener('load', handleLoad)
    iframe.addEventListener('error', handleError)

    return () => {
      iframe.removeEventListener('load', handleLoad)
      iframe.removeEventListener('error', handleError)
    }
  }, [])

  return {
    html,
    setHtml,
    postMessage,
    onMessage,
    ready,
    loading,
    error,
    iframeRef
  }
}

function createSecureHtml(html: string, options: WebviewOptions): string {
  const csp = createContentSecurityPolicy(options)

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="${csp}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            margin: 0; 
            padding: 8px; 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        ${html}
        ${
          options.enableScripts
            ? `
          <script>
            // Bridge for communicating with parent
            const vscode = {
              postMessage: function(message) {
                window.parent.postMessage(message, '*');
              }
            };
            
            // Listen for messages from parent
            window.addEventListener('message', function(event) {
              if (event.source === window.parent) {
                // Handle messages from extension host
                const customEvent = new CustomEvent('message', { detail: event.data });
                window.dispatchEvent(customEvent);
              }
            });
          </script>
        `
            : ''
        }
      </body>
    </html>
  `
}

function createContentSecurityPolicy(options: WebviewOptions): string {
  const policies = [
    "default-src 'none'",
    "img-src 'self' data: https:",
    "media-src 'self'",
    "style-src 'self' 'unsafe-inline'"
  ]

  if (options.enableScripts) {
    policies.push("script-src 'self' 'unsafe-inline'")
  }

  if (options.enableForms) {
    policies.push("form-action 'self'")
  }

  return policies.join('; ')
}
