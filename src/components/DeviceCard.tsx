import React from 'react'
import Link from 'next/link'

interface DeviceCardProps {
  name: string
  brandSlug: string
  deviceSlug: string
  status?: string | null
  rootMethod?: string | null
  difficulty?: string | null
}

const statusLabels: Record<string, string> = {
  rootable: 'Rootable',
  partial: 'Partial',
  'not-rootable': 'Not Rootable',
  unknown: 'Unknown',
}

const difficultyLabels: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  expert: 'Expert',
}

export function DeviceCard({ name, brandSlug, deviceSlug, status, rootMethod, difficulty }: DeviceCardProps) {
  return (
    <Link href={`/root/${brandSlug}/${deviceSlug}`} className="device-card">
      <h3 className="device-card-name">{name}</h3>
      <div className="device-card-meta">
        {status && (
          <span className={`device-status device-status--${status}`}>
            {statusLabels[status] || status}
          </span>
        )}
        {difficulty && (
          <span className="device-difficulty">{difficultyLabels[difficulty] || difficulty}</span>
        )}
        {rootMethod && rootMethod !== 'none' && (
          <span className="device-method">{rootMethod}</span>
        )}
      </div>
    </Link>
  )
}
