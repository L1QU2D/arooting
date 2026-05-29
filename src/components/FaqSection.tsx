import React from 'react'
import { RichText } from './RichText'
import { JsonLd } from './JsonLd'
import { faqJsonLd } from '@/lib/seo'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

interface FaqItem {
  question: string
  answer: SerializedEditorState
}

function richTextToPlainText(data: SerializedEditorState): string {
  if (!data?.root?.children) return ''
  const extractText = (nodes: any[]): string =>
    nodes
      .map((node) => {
        if (node.text) return node.text
        if (node.children) return extractText(node.children)
        return ''
      })
      .join(' ')
  return extractText(data.root.children)
}

export function FaqSection({ faq }: { faq: FaqItem[] }) {
  if (!faq || faq.length === 0) return null

  const faqPlaintext = faq.map((item) => ({
    question: item.question,
    answer: richTextToPlainText(item.answer),
  }))

  return (
    <section className="faq-section">
      <JsonLd data={faqJsonLd(faqPlaintext)} />
      <h2>Frequently Asked Questions</h2>
      <div className="faq-list">
        {faq.map((item, i) => (
          <details key={i} className="faq-item">
            <summary>{item.question}</summary>
            <div className="faq-answer">
              <RichText data={item.answer} />
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
