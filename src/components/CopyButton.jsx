import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

/**
 * Small icon button that copies `value` to the clipboard and shows a brief
 * confirmation. Used next to every calculated value engineers are likely to
 * paste into an HMI tag, driver config, or PI system.
 */
export default function CopyButton({ value, label = 'Copy value', className = '' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e) => {
    e.stopPropagation()
    const text = String(value ?? '')
    if (!text) return
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older/insecure contexts without Clipboard API
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard denied — silently no-op, button just won't confirm */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded p-1 text-ink-faint transition-colors hover:bg-panel-border hover:text-trace ${className}`}
    >
      {copied ? <Check size={14} className="text-ok" /> : <Copy size={14} />}
    </button>
  )
}
