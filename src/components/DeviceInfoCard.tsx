import React from 'react'

interface DeviceInfoCardProps {
  brandName: string
  deviceName: string
  androidVersion?: string | null
  chipset?: string | null
  status?: string | null
  bootloaderUnlockable?: string | null
  rootMethod?: string | null
  difficulty?: string | null
  twrpAvailable?: boolean | null
  customRomSupport?: boolean | null
  releaseYear?: number | null
}

const chipsetLabels: Record<string, string> = {
  snapdragon: 'Qualcomm Snapdragon',
  exynos: 'Samsung Exynos',
  mediatek: 'MediaTek',
  tensor: 'Google Tensor',
  kirin: 'HiSilicon Kirin',
  other: 'Other',
}

const statusLabels: Record<string, string> = {
  rootable: 'Rootable',
  partial: 'Partially Rootable',
  'not-rootable': 'Not Rootable',
  unknown: 'Unknown',
}

const rootMethodLabels: Record<string, string> = {
  magisk: 'Magisk',
  kernelsu: 'KernelSU',
  'magisk-twrp': 'Magisk via TWRP',
  'kernelsu-custom': 'KernelSU (Custom Kernel)',
  'one-click': 'One-Click Root',
  multiple: 'Multiple Methods',
  none: 'None Available',
}

export function DeviceInfoCard(props: DeviceInfoCardProps) {
  const rows: { label: string; value: string }[] = []

  if (props.androidVersion) rows.push({ label: 'Android Version', value: props.androidVersion })
  if (props.chipset) rows.push({ label: 'Chipset', value: chipsetLabels[props.chipset] || props.chipset })
  if (props.releaseYear) rows.push({ label: 'Release Year', value: String(props.releaseYear) })
  if (props.status) rows.push({ label: 'Root Status', value: statusLabels[props.status] || props.status })
  if (props.bootloaderUnlockable) rows.push({ label: 'Bootloader Unlock', value: props.bootloaderUnlockable === 'yes' ? 'Yes' : props.bootloaderUnlockable === 'no' ? 'No' : props.bootloaderUnlockable === 'varies' ? 'Varies by variant' : 'Unknown' })
  if (props.rootMethod) rows.push({ label: 'Root Method', value: rootMethodLabels[props.rootMethod] || props.rootMethod })
  if (props.difficulty) rows.push({ label: 'Difficulty', value: props.difficulty.charAt(0).toUpperCase() + props.difficulty.slice(1) })
  rows.push({ label: 'TWRP Available', value: props.twrpAvailable ? 'Yes' : 'No' })
  rows.push({ label: 'Custom ROM Support', value: props.customRomSupport ? 'Yes' : 'No' })

  return (
    <div className="device-info-card">
      <h2>{props.brandName} {props.deviceName} — Specs &amp; Root Info</h2>
      <table>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th>{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
