/**
 * Generates fallback rooting steps based on device rootMethod when no custom steps are provided.
 */

interface TemplateStep {
  title: string
  text: string
  warning?: string
}

export function getDefaultPrerequisites(rootMethod?: string): string[] {
  const base = [
    'Back up all important data on your device',
    'Ensure your device has at least 50% battery',
    'Enable USB Debugging in Developer Options',
    'Install ADB and Fastboot on your computer',
  ]

  if (rootMethod === 'magisk-twrp' || rootMethod === 'magisk') {
    base.push('Download the latest Magisk APK from the official GitHub repository')
  }

  if (rootMethod === 'kernelsu' || rootMethod === 'kernelsu-custom') {
    base.push('Download the latest KernelSU manager from the official GitHub repository')
  }

  if (rootMethod === 'magisk-twrp') {
    base.push('Download the TWRP recovery image for your specific device model')
  }

  return base
}

export function getDefaultSteps(rootMethod?: string | null): TemplateStep[] {
  switch (rootMethod) {
    case 'magisk':
      return getMagiskSteps()
    case 'kernelsu':
      return getKernelSUSteps()
    case 'magisk-twrp':
      return getMagiskTwrpSteps()
    case 'kernelsu-custom':
      return getKernelSUCustomSteps()
    case 'one-click':
      return getOneClickSteps()
    default:
      return getGenericSteps()
  }
}

function getMagiskSteps(): TemplateStep[] {
  return [
    {
      title: 'Unlock the Bootloader',
      text: 'Enable OEM Unlocking in Developer Options. Connect your device to your computer via USB. Boot into Fastboot mode (usually Power + Volume Down). Run "fastboot flashing unlock" and confirm on device.',
      warning: 'Unlocking the bootloader will factory reset your device.',
    },
    {
      title: 'Extract the Boot Image',
      text: 'Download the stock firmware for your exact device model and Android version. Extract the boot.img file from the firmware package.',
    },
    {
      title: 'Patch the Boot Image with Magisk',
      text: 'Transfer the boot.img to your device. Open the Magisk app and tap "Install" > "Select and Patch a File". Select the boot.img file. Magisk will create a patched file named magisk_patched-*.img.',
    },
    {
      title: 'Flash the Patched Boot Image',
      text: 'Transfer the patched boot image back to your computer. Boot into Fastboot mode. Run "fastboot flash boot magisk_patched-*.img". Reboot your device.',
    },
    {
      title: 'Verify Root Access',
      text: 'Open the Magisk app and verify it shows "Installed" with the current version. Install a root checker app to confirm Superuser access is working.',
    },
  ]
}

function getKernelSUSteps(): TemplateStep[] {
  return [
    {
      title: 'Unlock the Bootloader',
      text: 'Enable OEM Unlocking in Developer Options. Boot into Fastboot mode and run "fastboot flashing unlock". Confirm the unlock on your device.',
      warning: 'Unlocking the bootloader will factory reset your device.',
    },
    {
      title: 'Check Kernel Compatibility',
      text: 'Verify your device kernel version supports KernelSU. Check the KernelSU compatibility list for your specific device and Android version.',
    },
    {
      title: 'Download the KernelSU Boot Image',
      text: 'Download the pre-built KernelSU boot image for your device from the official KernelSU GitHub releases, or patch your stock boot image using the KernelSU manager app.',
    },
    {
      title: 'Flash the KernelSU Image',
      text: 'Boot into Fastboot mode. Run "fastboot flash boot kernelsu_boot.img". Reboot your device.',
    },
    {
      title: 'Verify Root Access',
      text: 'Open the KernelSU manager app and verify it shows root is active. Use a root checker app to confirm Superuser access.',
    },
  ]
}

function getMagiskTwrpSteps(): TemplateStep[] {
  return [
    {
      title: 'Unlock the Bootloader',
      text: 'Enable OEM Unlocking in Developer Options. Boot into Fastboot mode and run "fastboot flashing unlock".',
      warning: 'Unlocking the bootloader will factory reset your device.',
    },
    {
      title: 'Flash TWRP Recovery',
      text: 'Download the TWRP image for your exact device model. Boot into Fastboot mode. Run "fastboot flash recovery twrp.img". Boot into TWRP recovery (usually Power + Volume Up).',
    },
    {
      title: 'Flash Magisk via TWRP',
      text: 'Download the Magisk APK and rename it to Magisk.zip. Transfer it to your device storage. In TWRP, tap "Install" and select the Magisk.zip file. Swipe to confirm flash.',
    },
    {
      title: 'Reboot and Verify',
      text: 'Reboot to system from TWRP. Open the Magisk app to verify root status. Install a root checker app to confirm.',
    },
  ]
}

function getKernelSUCustomSteps(): TemplateStep[] {
  return [
    {
      title: 'Unlock the Bootloader',
      text: 'Enable OEM Unlocking in Developer Options. Boot into Fastboot mode and run "fastboot flashing unlock".',
      warning: 'Unlocking the bootloader will factory reset your device.',
    },
    {
      title: 'Find a Compatible Custom Kernel',
      text: 'Search for a custom kernel for your device that has KernelSU support built in. Check XDA Developers or your device community forums.',
    },
    {
      title: 'Flash the Custom Kernel',
      text: 'Download the custom kernel with KernelSU support. Flash it via Fastboot or a custom recovery, following the kernel developer instructions.',
    },
    {
      title: 'Install KernelSU Manager',
      text: 'Install the KernelSU manager app from the official GitHub releases. Open it to verify root status and manage root permissions.',
    },
  ]
}

function getOneClickSteps(): TemplateStep[] {
  return [
    {
      title: 'Download the Rooting Tool',
      text: 'Download the recommended one-click rooting tool for your device. Only download from the official website to avoid malware.',
      warning:
        'One-click root tools often use exploits and may not be as safe as bootloader-based methods. Use at your own risk.',
    },
    {
      title: 'Enable Unknown Sources',
      text: 'Go to Settings > Security and enable "Unknown Sources" or "Install Unknown Apps" to allow the rooting APK to install.',
    },
    {
      title: 'Run the Rooting Tool',
      text: 'Install and open the rooting tool on your device. Follow the on-screen instructions and tap the "Root" button. Wait for the process to complete.',
    },
    {
      title: 'Verify Root Access',
      text: 'The app should indicate success. Install a root checker app from the Play Store to verify Superuser access.',
    },
  ]
}

function getGenericSteps(): TemplateStep[] {
  return [
    {
      title: 'Research Your Device',
      text: 'Look up your specific device model on XDA Developers or other Android communities to find the recommended rooting method.',
    },
    {
      title: 'Unlock the Bootloader',
      text: 'Most rooting methods require an unlocked bootloader. Check your manufacturer instructions for bootloader unlocking.',
      warning: 'Unlocking the bootloader will factory reset your device and may void your warranty.',
    },
    {
      title: 'Follow Your Device-Specific Guide',
      text: 'Follow the rooting instructions specific to your device model and Android version. Methods vary significantly between devices.',
    },
    {
      title: 'Verify Root Access',
      text: 'Install a root checker app to verify that Superuser access is working correctly on your device.',
    },
  ]
}

export function getDefaultWarnings(rootMethod?: string): { text: string; severity: 'info' | 'warning' | 'danger' }[] {
  const warnings: { text: string; severity: 'info' | 'warning' | 'danger' }[] = [
    {
      text: 'Rooting your device will void the manufacturer warranty in most cases.',
      severity: 'warning',
    },
    {
      text: 'Unlocking the bootloader performs a factory reset. Back up all data before proceeding.',
      severity: 'danger',
    },
    {
      text: 'Some banking and payment apps may not work on rooted devices due to SafetyNet/Play Integrity checks.',
      severity: 'info',
    },
  ]

  if (rootMethod === 'one-click') {
    warnings.push({
      text: 'One-click root tools use security exploits and may pose additional security risks. Consider bootloader-based methods instead.',
      severity: 'warning',
    })
  }

  return warnings
}
