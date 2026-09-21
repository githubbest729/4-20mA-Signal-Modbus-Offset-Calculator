import { useState } from 'react'
import { Share2, Check, Link2 } from 'lucide-react'

/**
 * Native social sharing via navigator.share(). Falls back to copying the
 * URL to the clipboard on browsers without Web Share support (most desktop
 * browsers) so the button is never a dead end.
 */
export default function ShareButton() {
  const [state, setState] = useState('idle') // idle | shared | copied | error

  const shareData = {
    title: '4-20mA & Modbus Offset Calculator',
    text: 'A free offline tool for SCADA/PLC engineers: 4-20mA scaling, 16-bit bit-stripping, and Modbus offset conversion. Works with no signal.',
    url: typeof window !== 'undefined' ? window.location.href : '',
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setState('shared')
      } catch (err) {
        // AbortError fires when the user just closes the share sheet — not a real error
        if (err?.name !== 'AbortError') setState('error')
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareData.url)
        setState('copied')
      } catch {
        setState('error')
      }
    }
    setTimeout(() => setState('idle'), 2200)
  }

  const label =
    state === 'copied' ? 'Link copied' : state === 'shared' ? 'Shared' : 'Share app'

  const Icon = state === 'copied' || state === 'shared' ? Check : navigator?.share ? Share2 : Link2

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-md border border-panel-border bg-panel-raised px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-trace/50 hover:text-trace active:scale-[0.98]"
      aria-label="Share this app with your team"
    >
      <Icon size={16} className={state === 'copied' || state === 'shared' ? 'text-ok' : ''} />
      <span>{label}</span>
    </button>
  )
}
