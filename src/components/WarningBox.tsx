import React from 'react'

interface Warning {
  text: string
  severity: 'info' | 'warning' | 'danger'
}

export function WarningBox({ warnings }: { warnings: Warning[] }) {
  if (!warnings || warnings.length === 0) return null

  return (
    <div className="warnings-section">
      {warnings.map((w, i) => (
        <div key={i} className={`warning-box warning-box--${w.severity}`}>
          <strong>
            {w.severity === 'danger' ? 'Danger' : w.severity === 'warning' ? 'Warning' : 'Note'}:
          </strong>{' '}
          {w.text}
        </div>
      ))}
    </div>
  )
}
