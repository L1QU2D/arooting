import React from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  RichText as PayloadRichText,
  type JSXConvertersFunction,
} from '@payloadcms/richtext-lexical/react'

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
})

export function RichText({ data }: { data: SerializedEditorState | undefined | null }) {
  if (!data) return null
  return <PayloadRichText data={data} converters={converters} />
}
