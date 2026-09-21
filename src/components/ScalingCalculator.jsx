import { useMemo, useState } from 'react'
import { Gauge, ArrowRightLeft } from 'lucide-react'

const PRESETS = [
  { label: '4-20mA', rawMin: 4, rawMax: 20 },
  { label: '0-20mA', rawMin: 0, rawMax: 20 },
  { label: '1-5V', rawMin: 1, rawMax: 5 },
  { label: '0-10V', rawMin: 0, rawMax: 10 },
  { label: '0-32767 (15-bit ADC)', rawMin: 0, rawMax: 32767 },
  { label: '0-65535 (16-bit unsigned)', rawMin: 0, rawMax: 65535 },
]

function toNumber(v) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : null
}

function Field({ label, value, onChange, suffix, step = 'any' }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint">
        {label}
      </span>
      <div className="flex items-center rounded-md border border-panel-border bg-panel-inset shadow-inset focus-within:border-trace/60">
        <input
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-3 py-2.5 font-mono text-sm text-ink outline-none tabular"
        />
        {suffix && <span className="pr-3 font-mono text-xs text-ink-faint">{suffix}</span>}
      </div>
    </label>
  )
}

export default function ScalingCalculator() {
  const [rawMin, setRawMin] = useState('4')
  const [rawMax, setRawMax] = useState('20')
  const [scaledMin, setScaledMin] = useState('0')
  const [scaledMax, setScaledMax] = useState('100')
  const [unit, setUnit] = useState('%')
  const [rawInput, setRawInput] = useState('12')
  const [scaledInput, setScaledInput] = useState('')
  const [lastEdited, setLastEdited] = useState('raw') // 'raw' | 'scaled'

  const nums = useMemo(
    () => ({
      rawMin: toNumber(rawMin),
      rawMax: toNumber(rawMax),
      scaledMin: toNumber(scaledMin),
      scaledMax: toNumber(scaledMax),
      raw: toNumber(rawInput),
      scaled: toNumber(scaledInput),
    }),
    [rawMin, rawMax, scaledMin, scaledMax, rawInput, scaledInput]
  )

  const span = nums.rawMax !== null && nums.rawMin !== null ? nums.rawMax - nums.rawMin : null
  const validRange = span !== null && span !== 0

  const scaledResult = useMemo(() => {
    if (!validRange || lastEdited !== 'raw' || nums.raw === null) return null
    return (
      nums.scaledMin +
      ((nums.raw - nums.rawMin) * (nums.scaledMax - nums.scaledMin)) / span
    )
  }, [nums, span, validRange, lastEdited])

  const rawResult = useMemo(() => {
    const scaledSpan =
      nums.scaledMax !== null && nums.scaledMin !== null ? nums.scaledMax - nums.scaledMin : null
    if (!validRange || !scaledSpan || lastEdited !== 'scaled' || nums.scaled === null) return null
    return nums.rawMin + ((nums.scaled - nums.scaledMin) * span) / scaledSpan
  }, [nums, span, validRange, lastEdited])

  const percentOfRange =
    scaledResult !== null && nums.scaledMax !== nums.scaledMin
      ? ((nums.raw - nums.rawMin) / span) * 100
      : rawResult !== null
      ? ((nums.scaled - nums.scaledMin) / (nums.scaledMax - nums.scaledMin)) * 100
      : null

  const outOfRange =
    (lastEdited === 'raw' && nums.raw !== null && span !== null && (nums.raw < Math.min(nums.rawMin, nums.rawMax) || nums.raw > Math.max(nums.rawMin, nums.rawMax))) ||
    (lastEdited === 'scaled' && nums.scaled !== null && nums.scaledMin !== null && nums.scaledMax !== null && (nums.scaled < Math.min(nums.scaledMin, nums.scaledMax) || nums.scaled > Math.max(nums.scaledMin, nums.scaledMax)))

  const applyPreset = (p) => {
    setRawMin(String(p.rawMin))
    setRawMax(String(p.rawMax))
  }

  const displayValue = lastEdited === 'raw' ? scaledResult : rawResult

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg border border-panel-border bg-panel-raised p-4">
        <Gauge className="mt-0.5 shrink-0 text-amber" size={20} />
        <div>
          <h2 className="font-semibold text-ink">Linear scaling calculator</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Convert a raw analog reading (current, voltage, or raw ADC counts) to a
            scaled engineering-unit value, or work backward from a known process
            value to find the expected raw signal.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="rounded-full border border-panel-border bg-panel-raised px-3 py-1 font-mono text-xs text-ink-muted transition-colors hover:border-amber/50 hover:text-amber"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Raw min" value={rawMin} onChange={setRawMin} />
        <Field label="Raw max" value={rawMax} onChange={setRawMax} />
        <Field label="Scaled min" value={scaledMin} onChange={setScaledMin} />
        <Field label="Scaled max" value={scaledMax} onChange={setScaledMax} />
      </div>

      <label className="block max-w-xs">
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint">
          Engineering unit label
        </span>
        <input
          type="text"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="e.g. PSI, °C, GPM, %"
          className="w-full rounded-md border border-panel-border bg-panel-inset px-3 py-2 text-sm text-ink shadow-inset outline-none focus:border-trace/60"
        />
      </label>

      {!validRange && (
        <p className="text-sm text-alarm">Raw min and raw max can't be equal — set a real span.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <Field
          label={`Raw input (${nums.rawMin ?? '?'}–${nums.rawMax ?? '?'})`}
          value={rawInput}
          onChange={(v) => {
            setRawInput(v)
            setLastEdited('raw')
          }}
        />
        <div className="hidden justify-center pb-2.5 sm:flex">
          <ArrowRightLeft size={18} className="text-ink-faint" />
        </div>
        <Field
          label={`Scaled input (${unit || 'units'})`}
          value={scaledInput}
          onChange={(v) => {
            setScaledInput(v)
            setLastEdited('scaled')
          }}
        />
      </div>

      <div className="rounded-lg border border-panel-border bg-panel-inset p-5 shadow-inset">
        <div className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          {lastEdited === 'raw' ? 'Scaled result' : 'Raw signal required'}
        </div>
        {validRange && displayValue !== null && !Number.isNaN(displayValue) ? (
          <>
            <div className="mt-1 font-mono text-4xl font-semibold tabular text-trace">
              {displayValue.toFixed(4).replace(/\.?0+$/, '') || '0'}
              <span className="ml-2 text-lg text-ink-muted">
                {lastEdited === 'raw' ? unit || 'units' : ''}
              </span>
            </div>
            {percentOfRange !== null && (
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-ink-faint">
                  <span>% of span</span>
                  <span className="font-mono tabular">{percentOfRange.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-panel-border">
                  <div
                    className={`h-full rounded-full ${outOfRange ? 'bg-alarm' : 'bg-amber'}`}
                    style={{ width: `${Math.min(100, Math.max(0, percentOfRange))}%` }}
                  />
                </div>
                {outOfRange && (
                  <p className="mt-2 text-xs text-alarm">
                    Input is outside the configured span — check wiring, sensor fault, or range setup.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="mt-1 font-mono text-2xl text-ink-faint">—</div>
        )}
      </div>
    </div>
  )
}
