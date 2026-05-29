import type { CollectionConfig } from 'payload'

export const Devices: CollectionConfig = {
  slug: 'devices',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'status', 'rootMethod', 'difficulty'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      required: true,
      index: true,
    },
    {
      name: 'modelNumber',
      type: 'text',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'androidVersion',
      type: 'text',
    },
    {
      name: 'chipset',
      type: 'select',
      options: [
        { label: 'Snapdragon', value: 'snapdragon' },
        { label: 'Exynos', value: 'exynos' },
        { label: 'MediaTek', value: 'mediatek' },
        { label: 'Tensor', value: 'tensor' },
        { label: 'Kirin', value: 'kirin' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'releaseYear',
      type: 'number',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Rootable', value: 'rootable' },
        { label: 'Partial', value: 'partial' },
        { label: 'Not Rootable', value: 'not-rootable' },
        { label: 'Unknown', value: 'unknown' },
      ],
      defaultValue: 'unknown',
    },
    {
      name: 'bootloaderUnlockable',
      type: 'select',
      options: [
        { label: 'Yes', value: 'yes' },
        { label: 'No', value: 'no' },
        { label: 'Varies', value: 'varies' },
        { label: 'Unknown', value: 'unknown' },
      ],
      defaultValue: 'unknown',
    },
    {
      name: 'rootMethod',
      type: 'select',
      options: [
        { label: 'Magisk', value: 'magisk' },
        { label: 'KernelSU', value: 'kernelsu' },
        { label: 'Magisk + TWRP', value: 'magisk-twrp' },
        { label: 'KernelSU Custom', value: 'kernelsu-custom' },
        { label: 'One-Click', value: 'one-click' },
        { label: 'Multiple', value: 'multiple' },
        { label: 'None', value: 'none' },
      ],
    },
    {
      name: 'twrpAvailable',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'customRomSupport',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'difficulty',
      type: 'select',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
        { label: 'Expert', value: 'expert' },
      ],
    },
    {
      name: 'introOverride',
      type: 'richText',
      admin: {
        description: 'If empty, an introduction will be auto-generated from device data.',
      },
    },
    {
      name: 'prerequisites',
      type: 'array',
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'steps',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
        {
          name: 'warning',
          type: 'text',
        },
      ],
    },
    {
      name: 'warnings',
      type: 'array',
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
        {
          name: 'severity',
          type: 'select',
          options: [
            { label: 'Info', value: 'info' },
            { label: 'Warning', value: 'warning' },
            { label: 'Danger', value: 'danger' },
          ],
          defaultValue: 'warning',
        },
      ],
    },
    {
      name: 'faq',
      type: 'array',
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'richText',
          required: true,
        },
      ],
    },
    {
      name: 'relatedGuides',
      type: 'relationship',
      relationTo: 'guides',
      hasMany: true,
    },
    {
      name: 'relatedDevices',
      type: 'relationship',
      relationTo: 'devices',
      hasMany: true,
    },
    {
      name: 'metaTitle',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'targetKeywords',
      type: 'array',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'keyword',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
