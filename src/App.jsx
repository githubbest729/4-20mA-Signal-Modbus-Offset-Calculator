import { useState } from 'react'
import { Gauge, Binary, ArrowLeftRight, Radio, WifiOff } from 'lucide-react'
import ScalingCalculator from './components/ScalingCalculator.jsx'
import BitStripper from './components/BitStripper.jsx'
import ModbusAddressing from './components/ModbusAddressing.jsx'
import ShareButton from './components/ShareButton.jsx'

const TABS = [
  { key: 'scaling', label: 'Signal Scaling', icon: Gauge, Component: ScalingCalculator },
  { key: 'bits', label: 'Bit Stripper', icon: Binary, Component: BitStripper },
  { key: 'modbus', label: 'Modbus Offsets', icon: ArrowLeftRight, Component: ModbusAddressing },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('scaling')
  const Active = TABS.find((t) => t.key === activeTab)?.Component ?? ScalingCalculator

  return (
    <div className="min-h-screen bg-panel pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)]">
      <header className="border-b border-panel-border bg-panel-raised/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-panel-border bg-panel-inset">
              <Radio className="text-amber" size={20} />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight text-ink sm:text-lg">
                4-20mA &amp; Modbus Calculator
              </h1>
              <p className="flex items-center gap-1.5 text-xs text-ink-faint">
                <WifiOff size={11} /> Runs fully offline · nothing leaves this browser
              </p>
            </div>
          </div>
          <ShareButton />
        </div>
      </header>

      <nav className="sticky top-0 z-10 border-b border-panel-border bg-panel/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = key === activeTab
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? 'text-amber' : 'text-ink-faint hover:text-ink-muted'
                }`}
              >
                <Icon size={16} />
                {label}
                {isActive && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-amber" />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <Active />
      </main>

      <footer className="mx-auto max-w-3xl px-4 pb-8 pt-4 text-center text-xs text-ink-faint">
        <p>
          Built for field techs, panel builders, and controls engineers. No account,
          no tracking, no server round-trip — install it once and it works in the
          cabinet with zero bars of signal.
        </p>
      </footer>
    </div>
  )
}
