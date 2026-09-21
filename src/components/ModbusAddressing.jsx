import { useMemo, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'

const REGISTER_TYPES = [
  { key: 'coil', label: 'Coil', base: 1, prefix: 0, code: '0x / 1, 5, 15' },
  { key: 'discrete', label: 'Discrete Input', base: 10001, prefix: 1, code: '2x / 2' },
  { key: 'input', label: 'Input Register', base: 30001, prefix: 3, code: '4x / 4' },
  { key: 'holding', label: 'Holding Register', base: 40001, prefix: 4, code: '3x / 3, 6, 16' },
]

function offsetToAddress(offset, type) {
  if (offset === null || Number.isNaN(offset)) return null
  return type.base + offset
}

function addressToOffset(address, type) {
  if (address === null || Number.isNaN(address)) return null
  return address - type.base
}

export default function ModbusAddressing() {
  const [typeKey, setTypeKey] = useState('holding')
  const [offsetInput, setOffsetInput] = useState('0')
  const [addressInput, setAddressInput] = useState('')
  const [lastEdited, setLastEdited] = useState('offset') // 'offset' | 'address'

  const type = REGISTER_TYPES.find((t) => t.key === typeKey)

  const offsetNum = offsetInput.trim() === '' ? null : Number(offsetInput)
  const addressNum = addressInput.trim() === '' ? null : Number(addressInput)

  const computedAddress = useMemo(() => {
    if (lastEdited !== 'offset' || offsetNum === null) return null
    return offsetToAddress(offsetNum, type)
  }, [lastEdited, offsetNum, type])

  const computedOffset = useMemo(() => {
    if (lastEdited !== 'address' || addressNum === null) return null
    return addressToOffset(addressNum, type)
  }, [lastEdited, addressNum, type])

  const negativeOffsetWarning = computedOffset !== null && computedOffset < 0

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-lg border border-panel-border bg-panel-raised p-4">
        <ArrowLeftRight className="mt-0.5 shrink-0 text-amber" size={20} />
        <div>
          <h2 className="font-semibold text-ink">Modbus addressing converter</h2>
          <p className="mt-0.5 text-sm text-ink-muted">
            Modbus function-code offsets are zero-based on the wire, but most HMIs,
            historians, and driver configs display base-1 addressing like 40001.
            Convert cleanly between the two so your PLC program and SCADA tags agree.
          </p>
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint">
          Register type
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {REGISTER_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setTypeKey(t.key)}
              className={`rounded-md border px-3 py-2.5 text-left transition-colors ${
                t.key === typeKey
                  ? 'border-amber/60 bg-amber/10 text-ink'
                  : 'border-panel-border bg-panel-raised text-ink-muted hover:border-amber/30'
              }`}
            >
              <div className="text-sm font-medium">{t.label}</div>
              <div className="mt-0.5 font-mono text-xs text-ink-faint">
                {t.base.toString().padStart(5, '0')} · fn {t.code}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint">
            Zero-based offset (wire / protocol)
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={offsetInput}
            onChange={(e) => {
              setOffsetInput(e.target.value)
              setLastEdited('offset')
            }}
            className="w-full rounded-md border border-panel-border bg-panel-inset px-3 py-2.5 font-mono text-sm text-ink shadow-inset outline-none focus:border-trace/60"
          />
        </label>

        <div className="hidden justify-center pb-2.5 sm:flex">
          <ArrowLeftRight size={18} className="text-ink-faint" />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint">
            Base-1 address (HMI / documentation)
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={addressInput}
            onChange={(e) => {
              setAddressInput(e.target.value)
              setLastEdited('address')
            }}
            placeholder={`e.g. ${type.base}`}
            className="w-full rounded-md border border-panel-border bg-panel-inset px-3 py-2.5 font-mono text-sm text-ink shadow-inset outline-none focus:border-trace/60"
          />
        </label>
      </div>

      <div className="rounded-lg border border-panel-border bg-panel-inset p-5 shadow-inset">
        <div className="text-xs font-medium uppercase tracking-wide text-ink-faint">
          {lastEdited === 'offset' ? 'Base-1 address' : 'Zero-based offset'}
        </div>
        {lastEdited === 'offset' && computedAddress !== null && (
          <div className="mt-1 font-mono text-4xl font-semibold tabular text-trace">
            {computedAddress}
          </div>
        )}
        {lastEdited === 'address' && computedOffset !== null && (
          <div
            className={`mt-1 font-mono text-4xl font-semibold tabular ${
              negativeOffsetWarning ? 'text-alarm' : 'text-trace'
            }`}
          >
            {computedOffset}
          </div>
        )}
        {computedAddress === null && computedOffset === null && (
          <div className="mt-1 font-mono text-2xl text-ink-faint">—</div>
        )}
        {negativeOffsetWarning && (
          <p className="mt-2 text-xs text-alarm">
            That address is below the {type.label.toLowerCase()} base ({type.base}) —
            double check the register type or the address.
          </p>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-panel-border">
        <table className="w-full min-w-[480px] text-left font-mono text-xs">
          <thead className="bg-panel-raised text-ink-faint">
            <tr>
              <th className="px-3 py-2 font-medium">Register type</th>
              <th className="px-3 py-2 font-medium">Base address</th>
              <th className="px-3 py-2 font-medium">Offset 0 →</th>
              <th className="px-3 py-2 font-medium">Offset 99 →</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-border">
            {REGISTER_TYPES.map((t) => (
              <tr key={t.key} className={t.key === typeKey ? 'bg-amber/5 text-ink' : 'text-ink-muted'}>
                <td className="px-3 py-2">{t.label}</td>
                <td className="px-3 py-2 tabular">{t.base}</td>
                <td className="px-3 py-2 tabular">{t.base}</td>
                <td className="px-3 py-2 tabular">{t.base + 99}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
