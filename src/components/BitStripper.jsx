import { useEffect, useMemo, useState } from 'react'
import { Binary, RotateCcw } from 'lucide-react'

const STORAGE_KEY = 'bitstripper-labels-v1'
const DEFAULT_LABELS = Array.from({ length: 16 }, (_, i) => `Bit ${i}`)

function loadLabels() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_LABELS
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length === 16) return parsed
  } catch {
    /* corrupted or unavailable storage — fall back to defaults */
  }
  return DEFAULT_LABELS
}

function parseRawValue(input) {
  const trimmed = input.trim()
  if (trimmed === '') return null
  let n
  if (/^0x/i.test(trimmed)) {
    n = parseInt(trimmed, 16)
  } else if (/^0b/i.test(trimmed)) {
    n = parseInt(trimmed.slice(2), 2)
  } else {
    n = Number(trimmed)
  }
  if (!Number.isFinite(n) || n < 0 || n > 65535) return NaN // NaN signals "out of range/invalid"
  return Math.floor(n)
}

export default function BitStripper() {
  const [input, setInput] = useState('2054')
  const [labels, setLabels] = useState(loadLabels)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(labels))
  }, [labels])

  const value = parseRawValue(input)
  const invalid = Number.isNaN(value)

  const bits = useMemo(() => {
    if (value === null || invalid) return []
    return Array.from({ length: 16 }, (_, i) => {
      const bitIndex = 15 - i // render MSB (bit 15) first, LSB (bit 0) last
      return { index: bitIndex, active: ((value >> bitIndex) & 1) === 1 }
    })
  }, [value, invalid])

  const activeCount = bits.filter((b) => b.active).length

  const updateLabel = (index, text) => {
    setLabels((prev) => {
      const next = [...prev]
      next[index] = text
      return next
    })
  }

  const resetLabels = () => setLabels(DEFAULT_LABELS)

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg border border-panel-border bg-panel-raised p-4">
        <Binary className="mt-0.5 shrink-0 text-amber" size={20} />
        <div>
          <h2 className="font-semibold text-ink">16-bit bit-stripping tool</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Paste a raw integer word from a PLC (decimal, or prefix with 0x for hex /
            0b for binary) to see exactly which of its 16 bits are set — perfect for
            decoding packed alarm and status words.
          </p>
        </div>
      </div>

      <label className="block max-w-sm">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint">
          Raw word (0–65535)
        </span>
        <input
          type="text"
          inputMode="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 2054, 0x0806, 0b100000000110"
          className={`w-full rounded-md border bg-panel-inset px-3 py-2.5 font-mono text-sm text-ink shadow-inset outline-none ${
            invalid ? 'border-alarm/60 focus:border-alarm' : 'border-panel-border focus:border-trace/60'
          }`}
        />
      </label>

      {invalid && (
        <p className="text-sm text-alarm">
          That value doesn't fit in an unsigned 16-bit word (0–65535). Check the raw value.
        </p>
      )}

      {!invalid && value !== null && (
        <>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-panel-border bg-panel-inset p-4 font-mono text-sm shadow-inset">
            <div>
              <span className="text-ink-faint">DEC </span>
              <span className="tabular text-trace">{value}</span>
            </div>
            <div>
              <span className="text-ink-faint">HEX </span>
              <span className="tabular text-trace">0x{value.toString(16).toUpperCase().padStart(4, '0')}</span>
            </div>
            <div>
              <span className="text-ink-faint">BIN </span>
              <span className="tabular text-trace">{value.toString(2).padStart(16, '0')}</span>
            </div>
            <div className="ml-auto text-ink-faint">
              {activeCount} of 16 bits active
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">
              Bit 15 (MSB) → Bit 0 (LSB) · click a name to relabel it
            </span>
            <button
              onClick={resetLabels}
              className="inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-amber"
            >
              <RotateCcw size={12} /> Reset labels
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {bits.map(({ index, active }) => (
              <div
                key={index}
                className={`rounded-md border p-3 transition-colors ${
                  active
                    ? 'border-ok/50 bg-ok/10'
                    : 'border-panel-border bg-panel-raised'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-faint">Bit {index}</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      active ? 'bg-ok animate-blink' : 'bg-panel-border'
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  value={labels[index]}
                  onChange={(e) => updateLabel(index, e.target.value)}
                  className={`mt-1.5 w-full truncate bg-transparent text-sm font-medium outline-none ${
                    active ? 'text-ok' : 'text-ink-muted'
                  }`}
                />
                <div
                  className={`mt-1 font-mono text-[11px] ${active ? 'text-ok/80' : 'text-ink-faint'}`}
                >
                  {active ? 'SET (1)' : 'clear (0)'}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-faint">
            Bit labels are saved to this browser only — nothing is uploaded anywhere.
          </p>
        </>
      )}
    </div>
  )
}
