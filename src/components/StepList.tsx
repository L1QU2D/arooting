import React from 'react'
import { RichText } from './RichText'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

interface Step {
  title: string
  content: SerializedEditorState
  warning?: string | null
}

export function StepList({ steps }: { steps: Step[] }) {
  if (!steps || steps.length === 0) return null

  return (
    <div className="step-list">
      <ol>
        {steps.map((step, i) => (
          <li key={i} className="step-item">
            <h3 className="step-title">
              <span className="step-number">Step {i + 1}</span>
              {step.title}
            </h3>
            <div className="step-content">
              <RichText data={step.content} />
            </div>
            {step.warning && (
              <div className="warning-box warning-box--warning">
                <strong>Warning:</strong> {step.warning}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}
