import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

async function seed() {
  const payload = await getPayload({ config: await config })

  console.log('Seeding brands...')
  const brands = await seedBrands(payload)

  console.log('Seeding guides...')
  await seedGuides(payload)

  console.log('Seeding devices...')
  await seedDevices(payload, brands)

  console.log('Seeding learn articles...')
  await seedLearn(payload)

  console.log('Seeding complete!')
  process.exit(0)
}

function richText(text: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, version: 1 }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

async function seedBrands(payload: any) {
  const brandData = [
    {
      name: 'Samsung',
      slug: 'samsung',
      description: 'Samsung Galaxy devices including S series, A series, Note, and Fold lineup.',
      bootloaderUnlockDifficulty: 'moderate' as const,
      bootloaderUnlockNotes: 'Samsung allows bootloader unlocking on most Exynos models via OEM Unlock in Developer Options. Snapdragon US carrier-locked models often cannot be unlocked.',
      metaTitle: 'Root Samsung Devices — Galaxy S, A, Note Rooting Guides',
      metaDescription: 'Rooting guides for Samsung Galaxy devices. Bootloader unlock instructions, Magisk and TWRP guides for Galaxy S24, S23, A series, and more.',
    },
    {
      name: 'Google Pixel',
      slug: 'google',
      description: 'Google Pixel phones with stock Android and easy bootloader unlocking.',
      bootloaderUnlockDifficulty: 'easy' as const,
      bootloaderUnlockNotes: 'Google Pixel devices have the easiest bootloader unlock process. Simply enable OEM Unlocking and run fastboot flashing unlock. Carrier-locked Pixels are the exception.',
      metaTitle: 'Root Google Pixel — Pixel 9, 8, 7 Rooting Guides',
      metaDescription: 'Step-by-step rooting guides for Google Pixel devices. Easy bootloader unlock and Magisk/KernelSU root for Pixel 9, 8, 7, 6 and older models.',
    },
    {
      name: 'OnePlus',
      slug: 'oneplus',
      description: 'OnePlus devices known for developer-friendly unlocking policies.',
      bootloaderUnlockDifficulty: 'easy' as const,
      bootloaderUnlockNotes: 'OnePlus devices are very developer-friendly. Bootloader can be unlocked via fastboot with minimal restrictions. No waiting period required.',
      metaTitle: 'Root OnePlus Devices — OnePlus 12, 11, Nord Rooting Guides',
      metaDescription: 'Rooting guides for OnePlus phones. Easy bootloader unlock process with Magisk and KernelSU support for OnePlus 12, 11, Nord, and older devices.',
    },
    {
      name: 'Xiaomi',
      slug: 'xiaomi',
      description: 'Xiaomi, Redmi, and POCO devices running MIUI/HyperOS.',
      bootloaderUnlockDifficulty: 'moderate' as const,
      bootloaderUnlockNotes: 'Xiaomi requires using the Mi Unlock Tool and a mandatory waiting period (typically 7 days, sometimes longer) before the bootloader can be unlocked.',
      metaTitle: 'Root Xiaomi Devices — Redmi, POCO Rooting Guides',
      metaDescription: 'How to root Xiaomi, Redmi, and POCO devices. Bootloader unlock guide with Mi Unlock Tool, Magisk root, and TWRP recovery installation.',
    },
    {
      name: 'Motorola',
      slug: 'motorola',
      description: 'Motorola and Moto devices with near-stock Android experience.',
      bootloaderUnlockDifficulty: 'moderate' as const,
      bootloaderUnlockNotes: 'Motorola provides an official bootloader unlock portal. You need to request an unlock code from their website. Not all carrier variants are eligible.',
      metaTitle: 'Root Motorola Devices — Moto G, Edge Rooting Guides',
      metaDescription: 'Rooting guides for Motorola phones. Official bootloader unlock process, Magisk root guides for Moto G, Edge, and Razr series.',
    },
    {
      name: 'Huawei',
      slug: 'huawei',
      description: 'Huawei and Honor devices. Bootloader unlocking discontinued since 2018.',
      bootloaderUnlockDifficulty: 'impossible' as const,
      bootloaderUnlockNotes: 'Huawei officially stopped providing bootloader unlock codes in 2018. Third-party paid services exist but are unreliable. Newer devices are essentially impossible to unlock.',
      metaTitle: 'Root Huawei Devices — Rooting Status & Guides',
      metaDescription: 'Huawei rooting status and guides. Bootloader unlock challenges, available methods for older Huawei and Honor devices.',
    },
    {
      name: 'Sony',
      slug: 'sony',
      description: 'Sony Xperia devices with an official bootloader unlock process.',
      bootloaderUnlockDifficulty: 'easy' as const,
      bootloaderUnlockNotes: 'Sony provides official bootloader unlock codes through their developer website. Most Xperia models are supported. Unlocking may disable some camera features.',
      metaTitle: 'Root Sony Xperia — Bootloader Unlock & Rooting Guides',
      metaDescription: 'How to root Sony Xperia phones. Official bootloader unlock process and Magisk root guides for Xperia 1, 5, 10 series.',
    },
    {
      name: 'Nokia',
      slug: 'nokia',
      description: 'Nokia (HMD Global) Android devices.',
      bootloaderUnlockDifficulty: 'difficult' as const,
      bootloaderUnlockNotes: 'Nokia/HMD Global does not officially support bootloader unlocking. Some models have community-found exploits, but most remain locked.',
      metaTitle: 'Root Nokia Devices — Rooting Status & Guides',
      metaDescription: 'Nokia rooting status and guides. Bootloader unlock challenges and available methods for HMD Global Nokia Android devices.',
    },
    {
      name: 'Realme',
      slug: 'realme',
      description: 'Realme devices with ColorOS/Realme UI.',
      bootloaderUnlockDifficulty: 'moderate' as const,
      bootloaderUnlockNotes: 'Realme provides a deep testing app for bootloader unlocking on some models. The process has become more restricted on newer devices.',
      metaTitle: 'Root Realme Devices — Rooting Guides & Status',
      metaDescription: 'How to root Realme phones. Deep testing bootloader unlock, Magisk root guides for Realme GT, Number series, and C series devices.',
    },
    {
      name: 'OPPO',
      slug: 'oppo',
      description: 'OPPO devices running ColorOS.',
      bootloaderUnlockDifficulty: 'difficult' as const,
      bootloaderUnlockNotes: 'OPPO has restricted bootloader unlocking on most newer devices. Some older models and Chinese variants may be unlockable.',
      metaTitle: 'Root OPPO Devices — Rooting Status & Guides',
      metaDescription: 'OPPO rooting status and guides. Bootloader unlock options and rooting methods for OPPO Find and Reno series.',
    },
    {
      name: 'Vivo',
      slug: 'vivo',
      description: 'Vivo and iQOO devices.',
      bootloaderUnlockDifficulty: 'difficult' as const,
      bootloaderUnlockNotes: 'Vivo does not officially support bootloader unlocking. Community-found methods may exist for specific models.',
    },
    {
      name: 'ASUS',
      slug: 'asus',
      description: 'ASUS ROG Phone and Zenfone devices.',
      bootloaderUnlockDifficulty: 'easy' as const,
      bootloaderUnlockNotes: 'ASUS provides an official unlock tool for ROG Phone and Zenfone devices. The process is straightforward through their developer page.',
    },
    {
      name: 'LG',
      slug: 'lg',
      description: 'LG smartphones (discontinued since 2021).',
      bootloaderUnlockDifficulty: 'difficult' as const,
      bootloaderUnlockNotes: 'LG shut down their bootloader unlock service. Existing devices with previously obtained codes can still be unlocked.',
    },
    {
      name: 'Nothing',
      slug: 'nothing',
      description: 'Nothing Phone devices with developer-friendly policies.',
      bootloaderUnlockDifficulty: 'easy' as const,
      bootloaderUnlockNotes: 'Nothing Phone devices support standard fastboot bootloader unlocking similar to Google Pixel devices.',
    },
    {
      name: 'Poco',
      slug: 'poco',
      description: 'POCO devices (Xiaomi sub-brand) with performance-focused hardware.',
      bootloaderUnlockDifficulty: 'moderate' as const,
      bootloaderUnlockNotes: 'POCO follows the same Xiaomi unlock process using Mi Unlock Tool with a mandatory waiting period.',
    },
    {
      name: 'Redmi',
      slug: 'redmi',
      description: 'Redmi devices (Xiaomi sub-brand) offering budget-friendly smartphones.',
      bootloaderUnlockDifficulty: 'moderate' as const,
      bootloaderUnlockNotes: 'Redmi uses the same Xiaomi Mi Unlock Tool process with a waiting period.',
    },
    {
      name: 'ZTE',
      slug: 'zte',
      description: 'ZTE and Nubia smartphones.',
      bootloaderUnlockDifficulty: 'moderate' as const,
      bootloaderUnlockNotes: 'ZTE has an official bootloader unlock process for some models. Nubia devices are generally more developer-friendly.',
    },
  ]

  const brandMap: Record<string, number> = {}

  for (const data of brandData) {
    try {
      const existing = await payload.find({
        collection: 'brands',
        where: { slug: { equals: data.slug } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        brandMap[data.slug] = existing.docs[0].id
        console.log(`  Brand "${data.name}" already exists, skipping`)
        continue
      }
      const brand = await payload.create({ collection: 'brands', data })
      brandMap[data.slug] = brand.id
      console.log(`  Created brand: ${data.name}`)
    } catch (e: any) {
      console.error(`  Error creating brand ${data.name}:`, e.message)
    }
  }

  return brandMap
}

async function seedGuides(payload: any) {
  const guidesData = [
    {
      title: 'Custom ROMs: GrapheneOS, LineageOS, CalyxOS & More',
      slug: 'custom-roms',
      category: 'custom-rom' as const,
      excerpt: 'Comprehensive guide to installing custom ROMs on Android. Compare GrapheneOS, LineageOS, CalyxOS, and other popular ROMs with installation instructions.',
      content: richText('Custom ROMs replace your phone\'s stock operating system with a community-built alternative. They offer enhanced privacy, better performance, longer software support, and deep customization options that stock Android doesn\'t provide. This guide covers the most popular custom ROMs and how to install them on your device.'),
      steps: [
        { title: 'Choose Your Custom ROM', content: richText('Research which custom ROM supports your device. Check the ROM\'s official device list. GrapheneOS supports Pixel devices only, LineageOS has the widest device support, and CalyxOS supports Pixels and some Xiaomi/Motorola devices.'), warning: null },
        { title: 'Unlock the Bootloader', content: richText('Enable OEM Unlocking in Developer Options. Connect to your PC and boot into Fastboot mode. Run "fastboot flashing unlock" to unlock the bootloader.'), warning: 'This will factory reset your device.' },
        { title: 'Install a Custom Recovery (if needed)', content: richText('Some ROMs require TWRP or a custom recovery. Download the recovery image for your device and flash it via "fastboot flash recovery recovery.img". GrapheneOS and CalyxOS use their own web installers and don\'t need a separate recovery.'), warning: null },
        { title: 'Flash the Custom ROM', content: richText('Download the ROM zip file from the official source. If using TWRP, copy the zip to your device and install from recovery. If using a web installer (GrapheneOS/CalyxOS), follow the on-screen instructions.'), warning: null },
        { title: 'Install Google Apps (Optional)', content: richText('If your custom ROM doesn\'t include Google apps, you can flash a GApps package through recovery after installing the ROM. MindTheGapps and NikGApps are popular choices. GrapheneOS offers sandboxed Google Play as an alternative.'), warning: null },
      ],
      faq: [
        { question: 'Will installing a custom ROM void my warranty?', answer: richText('Yes, in most cases installing a custom ROM voids the manufacturer warranty. However, you can usually restore stock firmware to reinstate the warranty.') },
        { question: 'Can I go back to stock Android after installing a custom ROM?', answer: richText('Yes, you can always flash the stock firmware back using fastboot or the manufacturer\'s flash tool. This will restore your device to its original state.') },
        { question: 'Do custom ROMs get security updates?', answer: richText('It depends on the ROM. GrapheneOS and CalyxOS provide timely security patches. LineageOS also provides regular updates for supported devices. Smaller ROMs may have delayed or infrequent updates.') },
      ],
      downloadLinks: [
        { label: 'GrapheneOS', url: 'https://grapheneos.org/install/web' },
        { label: 'LineageOS', url: 'https://download.lineageos.org/' },
        { label: 'CalyxOS', url: 'https://calyxos.org/install/' },
      ],
      metaTitle: 'Custom ROMs Guide — GrapheneOS, LineageOS, CalyxOS Installation',
      metaDescription: 'How to install custom ROMs on Android. Compare and install GrapheneOS, LineageOS, CalyxOS with step-by-step instructions, compatibility info, and FAQ.',
      targetKeywords: [{ keyword: 'custom roms' }, { keyword: 'grapheneos' }, { keyword: 'lineageos' }, { keyword: 'calyxos' }, { keyword: 'install custom rom' }],
    },
    {
      title: 'TWRP Recovery: Install & Use Guide',
      slug: 'twrp',
      category: 'recovery' as const,
      excerpt: 'Learn how to install and use TWRP custom recovery on any Android device. Flash ROMs, create backups, and install Magisk through TWRP.',
      content: richText('TWRP (Team Win Recovery Project) is a custom recovery that replaces your device\'s stock recovery partition. It provides a touch-based interface for flashing custom ROMs, creating full device backups (NANDroid), installing Magisk for root, and wiping partitions. TWRP is an essential tool for any Android power user.'),
      steps: [
        { title: 'Download TWRP for Your Device', content: richText('Visit the official TWRP website (twrp.me) and search for your exact device model. Download the .img file for your device. Make sure to match the exact model number.'), warning: null },
        { title: 'Boot into Fastboot Mode', content: richText('Power off your device. Hold Power + Volume Down to enter Fastboot/Bootloader mode. Connect your device to your computer via USB cable.'), warning: null },
        { title: 'Flash TWRP via Fastboot', content: richText('Open a terminal on your computer and run: "fastboot flash recovery twrp.img" (replace twrp.img with the actual filename). Wait for the flash to complete.'), warning: null },
        { title: 'Boot into TWRP', content: richText('Use the key combination (usually Power + Volume Up) to boot into recovery. On first boot, TWRP may ask to allow modifications — swipe to allow. You can now use TWRP to flash ROMs, create backups, or install Magisk.'), warning: null },
      ],
      faq: [
        { question: 'Is TWRP available for my device?', answer: richText('TWRP supports hundreds of devices. Check twrp.me for your specific model. If there\'s no official build, check XDA Developers for unofficial TWRP ports.') },
        { question: 'Can TWRP brick my device?', answer: richText('TWRP itself won\'t brick your device, but flashing incompatible files through TWRP can cause issues. Always verify compatibility and create a backup before flashing anything.') },
      ],
      downloadLinks: [
        { label: 'TWRP Official', url: 'https://twrp.me/Devices/' },
      ],
      metaTitle: 'TWRP Recovery — How to Install & Use TWRP on Android',
      metaDescription: 'Complete guide to installing TWRP custom recovery on Android. Download TWRP, flash via fastboot, create NANDroid backups, and install Magisk.',
      targetKeywords: [{ keyword: 'twrp' }, { keyword: 'twrp recovery' }, { keyword: 'install twrp' }, { keyword: 'twrp download' }],
    },
    {
      title: 'Magisk: The Complete Root Guide',
      slug: 'magisk',
      category: 'root-tool' as const,
      excerpt: 'Everything you need to know about Magisk — the most popular Android root solution. Install Magisk, use modules, hide root from apps, and manage Superuser access.',
      content: richText('Magisk is the most widely used root solution for Android. It provides systemless root access, which means it modifies the boot image rather than the system partition. This allows you to pass SafetyNet checks, use banking apps, and receive OTA updates. Magisk also supports modules that can modify the system without actually changing system files.'),
      steps: [
        { title: 'Download Magisk', content: richText('Download the latest Magisk APK from the official GitHub repository (github.com/topjohnwu/Magisk). Install the APK on your device.'), warning: null },
        { title: 'Extract Stock Boot Image', content: richText('Download the stock firmware for your exact device model and Android version. Extract the boot.img file from the firmware package.'), warning: null },
        { title: 'Patch Boot Image', content: richText('Open the Magisk app, tap "Install" next to Magisk, select "Select and Patch a File", and choose your boot.img. Magisk will create a patched file in your Downloads folder.'), warning: null },
        { title: 'Flash Patched Image', content: richText('Transfer the patched boot image to your computer. Boot into Fastboot mode and run: "fastboot flash boot magisk_patched-xxxxx_xxxxx.img". Reboot your device.'), warning: null },
        { title: 'Verify Installation', content: richText('Open the Magisk app. It should show "Installed" with the version number. You now have root access managed through Magisk.'), warning: null },
      ],
      faq: [
        { question: 'Is Magisk safe?', answer: richText('Magisk is open-source and widely trusted by the Android community. The main risk comes from granting root access to untrustworthy apps. Always review which apps you grant Superuser access to.') },
        { question: 'Can I use banking apps with Magisk?', answer: richText('Yes, Magisk supports hiding root from specific apps using the DenyList feature. You may also need the Play Integrity Fix module for apps that check device integrity.') },
        { question: 'How do I update Magisk?', answer: richText('Open the Magisk app and tap "Install" next to Magisk when an update is available. Select "Direct Install" if you already have root access. The app will update Magisk automatically.') },
      ],
      downloadLinks: [
        { label: 'Magisk GitHub', url: 'https://github.com/topjohnwu/Magisk/releases' },
      ],
      metaTitle: 'Magisk Root Guide — Install, Modules & Hide Root',
      metaDescription: 'Complete Magisk guide: install Magisk on any Android device, use Magisk modules, hide root from banking apps, and manage Superuser access.',
      targetKeywords: [{ keyword: 'magisk' }, { keyword: 'install magisk' }, { keyword: 'magisk module' }, { keyword: 'magisk root' }],
    },
    {
      title: 'How to Root Android: Complete Beginner Guide',
      slug: 'root-android',
      category: 'root-method' as const,
      excerpt: 'The definitive beginner guide to rooting Android. Learn what rooting is, which method to use, and follow step-by-step instructions to root your device safely.',
      content: richText('Rooting is the process of gaining superuser (administrator) access on your Android device. This lets you customize everything, remove bloatware, install powerful apps that need root access, and take full control of your phone. This guide walks you through the entire process from start to finish.'),
      steps: [
        { title: 'Check Your Device Compatibility', content: richText('First, determine if your device can be rooted. Check if your bootloader can be unlocked (Settings > About Phone > look for OEM Unlock option in Developer Options).'), warning: null },
        { title: 'Back Up Your Data', content: richText('Create a complete backup of your data. Unlocking the bootloader will factory reset your device. Use Google Backup, Samsung Smart Switch, or a manual file copy.'), warning: 'Rooting requires unlocking the bootloader which erases all data.' },
        { title: 'Install ADB and Fastboot', content: richText('Download Android SDK Platform Tools from the official Android developer website. Extract and add to your system PATH. Verify by running "adb version" in terminal.'), warning: null },
        { title: 'Unlock the Bootloader', content: richText('Enable OEM Unlocking in Developer Options. Boot into Fastboot mode and run "fastboot flashing unlock". Confirm on your device.'), warning: null },
        { title: 'Choose and Apply Root Method', content: richText('For most devices, Magisk is recommended. Download the Magisk app, patch your stock boot image, and flash it via fastboot. For devices with GKI kernels, KernelSU is an alternative.'), warning: null },
      ],
      faq: [
        { question: 'Is rooting legal?', answer: richText('Yes, rooting your own device is legal in most countries. In the US, it\'s protected under the DMCA exemption for mobile devices.') },
        { question: 'Will rooting void my warranty?', answer: richText('In most cases, yes. However, you can usually unroot and restore stock firmware to reinstate warranty coverage.') },
        { question: 'Can rooting brick my phone?', answer: richText('It\'s unlikely if you follow instructions carefully. Most "bricks" are actually soft bricks that can be fixed by reflashing stock firmware. Always follow guides specific to your device.') },
      ],
      metaTitle: 'How to Root Android — Complete Beginner Guide (2025)',
      metaDescription: 'Learn how to root any Android phone step by step. Beginner-friendly guide covering bootloader unlock, Magisk, KernelSU, and safety precautions.',
      targetKeywords: [{ keyword: 'root android' }, { keyword: 'how to root android' }, { keyword: 'root phone' }, { keyword: 'android root' }],
    },
    {
      title: 'How to Unlock Bootloader on Android',
      slug: 'unlock-bootloader',
      category: 'bootloader' as const,
      excerpt: 'Step-by-step guide to unlocking the bootloader on any Android device. Required for installing custom recovery, ROMs, and root access.',
      content: richText('The bootloader is the first program that runs when you turn on your Android device. It\'s responsible for loading the operating system. By default, bootloaders are locked to prevent unauthorized modifications. Unlocking it is the first step to rooting, installing custom recoveries like TWRP, and flashing custom ROMs.'),
      steps: [
        { title: 'Enable Developer Options', content: richText('Go to Settings > About Phone and tap "Build Number" 7 times. You\'ll see a toast message saying "Developer Options enabled."'), warning: null },
        { title: 'Enable OEM Unlocking', content: richText('Go to Settings > Developer Options and toggle "OEM Unlocking" on. This allows the bootloader to be unlocked via fastboot. If this option is greyed out, your carrier may have locked it.'), warning: null },
        { title: 'Boot into Fastboot Mode', content: richText('Power off your device completely. Hold Power + Volume Down buttons together until the Fastboot screen appears. Connect your device to your computer with a USB cable.'), warning: null },
        { title: 'Run the Unlock Command', content: richText('Open a terminal on your computer and run: "fastboot flashing unlock" (or "fastboot oem unlock" on older devices). A confirmation screen will appear on your device — use volume keys to select "Unlock" and press Power to confirm.'), warning: 'This will factory reset your device and erase all data.' },
      ],
      faq: [
        { question: 'Will unlocking the bootloader delete my data?', answer: richText('Yes, unlocking the bootloader performs a mandatory factory reset. Back up all important data before proceeding.') },
        { question: 'Can I lock the bootloader again?', answer: richText('Yes, you can relock by running "fastboot flashing lock" in Fastboot mode. Make sure to restore stock firmware first to avoid bootloops.') },
      ],
      metaTitle: 'Unlock Bootloader Android — Complete Step-by-Step Guide',
      metaDescription: 'How to unlock the bootloader on any Android device. Step-by-step instructions for Samsung, Pixel, OnePlus, Xiaomi, and more. OEM unlock guide.',
      targetKeywords: [{ keyword: 'unlock bootloader' }, { keyword: 'oem unlock' }, { keyword: 'unlock bootloader android' }],
    },
    {
      title: 'One-Click Root Tools: KingRoot, KingoRoot & Alternatives',
      slug: 'one-click-root',
      category: 'root-tool' as const,
      excerpt: 'Guide to one-click root tools for Android. Understand the risks, alternatives, and which devices they work on.',
      content: richText('One-click root tools like KingRoot and KingoRoot promise easy rooting without a PC or bootloader unlock. They work by exploiting Android security vulnerabilities to gain root access. While convenient, they come with significant security risks and only work on older Android versions (typically Android 7 and below).'),
      steps: [
        { title: 'Understand the Risks', content: richText('One-click root apps use security exploits and often include adware or unwanted software. They may send device data to remote servers. Consider using Magisk instead for a safer, more reliable root.'), warning: 'One-click root tools pose security risks. Use Magisk for a safer alternative.' },
        { title: 'Check Compatibility', content: richText('One-click root tools generally only work on devices running Android 4.0 to Android 7.0. Newer devices with updated security patches are typically not compatible.'), warning: null },
        { title: 'Download from Official Sources Only', content: richText('If you choose to use a one-click tool, only download from the developer\'s official website. Many fake versions contain malware.'), warning: null },
        { title: 'Run the Tool', content: richText('Install the APK, open the app, and tap the root button. Wait for the process to complete. If it fails, the exploit may not work on your device or Android version.'), warning: null },
      ],
      faq: [
        { question: 'Are one-click root tools safe?', answer: richText('They carry more risk than bootloader-based methods like Magisk. They use exploits that could be leveraged by malware, and many tools include adware. Magisk is a safer alternative for most users.') },
        { question: 'Do one-click root tools work on new phones?', answer: richText('Generally no. Modern Android versions (8+) have patched the vulnerabilities these tools exploit. For newer devices, use Magisk or KernelSU instead.') },
      ],
      metaTitle: 'One-Click Root Tools — KingRoot, KingoRoot Guide & Safety',
      metaDescription: 'Guide to one-click Android root tools including KingRoot and KingoRoot. Understand risks, compatibility, and safer alternatives like Magisk.',
      targetKeywords: [{ keyword: 'one click root' }, { keyword: 'kingroot' }, { keyword: 'kingoroot' }, { keyword: 'root without pc' }],
    },
    {
      title: 'Root Detection Bypass: Play Integrity Fix & Hide Root',
      slug: 'root-detection-bypass',
      category: 'detection' as const,
      excerpt: 'How to hide root from banking apps and pass Play Integrity checks. Configure Magisk DenyList, Play Integrity Fix module, and bypass SafetyNet.',
      content: richText('Many apps detect root access and refuse to work on rooted devices. Banking apps, payment apps, and some games use Google\'s Play Integrity API (formerly SafetyNet) to verify device integrity. This guide shows you how to hide root from these apps while keeping root access for everything else.'),
      steps: [
        { title: 'Enable Zygisk in Magisk', content: richText('Open the Magisk app, go to Settings, and enable "Zygisk". Reboot your device. Zygisk is required for the DenyList and Play Integrity Fix module.'), warning: null },
        { title: 'Configure DenyList', content: richText('In Magisk Settings, enable "Enforce DenyList". Tap "Configure DenyList" and select the apps you want to hide root from (banking apps, Google Wallet, etc.).'), warning: null },
        { title: 'Install Play Integrity Fix', content: richText('Download the Play Integrity Fix (PIF) module from GitHub. Install it through Magisk > Modules > Install from storage. Reboot your device.'), warning: null },
        { title: 'Verify with Root Checker', content: richText('Use a root checker app to verify you still have root. Then open a banking app to verify it works. Use YASNAC or Play Integrity API Checker to verify integrity checks pass.'), warning: null },
      ],
      faq: [
        { question: 'Why do banking apps not work on rooted phones?', answer: richText('Banking apps use Google\'s Play Integrity API to verify that the device hasn\'t been tampered with. Root access triggers a failed integrity check, which the app interprets as a security risk.') },
        { question: 'Is Play Integrity Fix reliable?', answer: richText('It works for most apps but requires periodic updates as Google updates their detection methods. The community actively maintains the module.') },
      ],
      metaTitle: 'Hide Root from Apps — Play Integrity Fix & DenyList Guide',
      metaDescription: 'How to hide root and pass Play Integrity checks. Set up Magisk DenyList, Play Integrity Fix module, and use banking apps on rooted Android.',
      targetKeywords: [{ keyword: 'play integrity fix' }, { keyword: 'hide root' }, { keyword: 'root detection bypass' }, { keyword: 'root checker' }],
    },
    {
      title: 'Xposed & LSPosed Framework Guide',
      slug: 'xposed-lsposed',
      category: 'framework' as const,
      excerpt: 'Install and use LSPosed (successor to Xposed) on rooted Android. Customize your device with powerful system-level modules.',
      content: richText('LSPosed is the modern successor to the Xposed Framework, allowing you to install modules that modify Android system behavior without changing any APK files. It runs on top of Magisk\'s Zygisk and supports a wide range of modules for customization, privacy, and functionality enhancements.'),
      steps: [
        { title: 'Ensure Magisk with Zygisk is Active', content: richText('LSPosed requires Magisk with Zygisk enabled. Open Magisk Settings and verify Zygisk is turned on.'), warning: null },
        { title: 'Download LSPosed', content: richText('Download the latest LSPosed-zygisk release from the official GitHub repository.'), warning: null },
        { title: 'Install via Magisk', content: richText('Open Magisk > Modules > Install from storage. Select the LSPosed zip file. Reboot your device after installation.'), warning: null },
        { title: 'Open LSPosed Manager', content: richText('After rebooting, find the LSPosed notification or search for "LSPosed" in your app drawer. Use the manager to install and configure Xposed modules.'), warning: null },
      ],
      faq: [
        { question: 'What is the difference between Xposed and LSPosed?', answer: richText('LSPosed is the modern continuation of Xposed, designed to work with Magisk Zygisk on modern Android versions. Original Xposed only supports up to Android 8.') },
        { question: 'Can LSPosed cause bootloops?', answer: richText('Incompatible modules can cause bootloops. LSPosed has a safe mode — if your device bootloops, it will automatically disable modules after 3 failed boot attempts.') },
      ],
      downloadLinks: [
        { label: 'LSPosed GitHub', url: 'https://github.com/LSPosed/LSPosed/releases' },
      ],
      metaTitle: 'LSPosed & Xposed Framework — Installation & Module Guide',
      metaDescription: 'How to install LSPosed (Xposed) framework on rooted Android. Setup guide, module installation, and troubleshooting for Magisk Zygisk.',
      targetKeywords: [{ keyword: 'lsposed' }, { keyword: 'xposed framework' }, { keyword: 'xposed' }, { keyword: 'lsposed modules' }],
    },
    {
      title: 'KernelSU: Root with Kernel-Level Access',
      slug: 'kernelsu',
      category: 'root-tool' as const,
      excerpt: 'Guide to KernelSU — a kernel-based root solution for Android. Compare KernelSU vs Magisk and learn how to install it on compatible devices.',
      content: richText('KernelSU is a kernel-based root solution that provides root access at the kernel level rather than modifying the boot image like Magisk. It offers better hiding from root detection, supports GKI (Generic Kernel Image) devices, and provides a different approach to managing root permissions.'),
      steps: [
        { title: 'Check Compatibility', content: richText('KernelSU works with GKI 2.0 kernels (Android 12+). Check if your device uses a GKI kernel by looking at the kernel version in Settings > About Phone. Devices with custom vendor kernels may need a modified KernelSU build.'), warning: null },
        { title: 'Download KernelSU', content: richText('Visit the KernelSU GitHub releases page and download the appropriate boot image or AnyKernel3 zip for your kernel version.'), warning: null },
        { title: 'Flash KernelSU', content: richText('Flash the KernelSU boot image via fastboot: "fastboot flash boot kernelsu-boot.img". Alternatively, flash the AnyKernel3 zip through a custom recovery.'), warning: null },
        { title: 'Install KSU Manager', content: richText('Download and install the KernelSU Manager app. Open it to manage root permissions for apps.'), warning: null },
      ],
      faq: [
        { question: 'Is KernelSU better than Magisk?', answer: richText('They have different strengths. KernelSU integrates at the kernel level for better hiding and GKI support. Magisk has a larger module ecosystem and wider device support. Many advanced users run both.') },
        { question: 'Can I use KernelSU and Magisk together?', answer: richText('It is possible on some setups but not recommended for beginners. KernelSU and Magisk serve the same purpose, and running both adds complexity without much benefit for most users.') },
      ],
      downloadLinks: [
        { label: 'KernelSU GitHub', url: 'https://github.com/tiann/KernelSU/releases' },
      ],
      metaTitle: 'KernelSU Guide — Kernel Root for Android (vs Magisk)',
      metaDescription: 'How to install KernelSU on Android. Kernel-based root solution guide, GKI compatibility, KernelSU vs Magisk comparison, and setup instructions.',
      targetKeywords: [{ keyword: 'kernelsu' }, { keyword: 'kernelsu vs magisk' }, { keyword: 'kernel root' }],
    },
    {
      title: 'ADB & Fastboot: Setup and Essential Commands',
      slug: 'adb-fastboot',
      category: 'root-method' as const,
      excerpt: 'How to install and use ADB (Android Debug Bridge) and Fastboot. Essential commands for rooting, flashing, and debugging Android devices.',
      content: richText('ADB (Android Debug Bridge) and Fastboot are command-line tools that let you communicate with your Android device from a computer. They\'re essential for rooting, flashing custom recoveries, installing updates via sideload, and debugging. Every Android enthusiast needs to know these tools.'),
      steps: [
        { title: 'Download Platform Tools', content: richText('Download the latest Android SDK Platform Tools from the official Android developer website (developer.android.com/tools/releases/platform-tools). Extract the zip to a convenient location.'), warning: null },
        { title: 'Add to System PATH', content: richText('Add the platform-tools folder to your system PATH variable so you can run adb and fastboot from any terminal window. On macOS/Linux, add to ~/.bashrc or ~/.zshrc. On Windows, add via System Properties > Environment Variables.'), warning: null },
        { title: 'Enable USB Debugging', content: richText('On your Android device, go to Settings > Developer Options > USB Debugging and enable it. Connect your device via USB and authorize the computer when prompted.'), warning: null },
        { title: 'Verify Connection', content: richText('Run "adb devices" in your terminal. Your device should appear in the list. For fastboot, run "fastboot devices" while your device is in bootloader mode.'), warning: null },
      ],
      faq: [
        { question: 'What is the difference between ADB and Fastboot?', answer: richText('ADB works when Android is running and communicates over USB. Fastboot works at the bootloader level (before Android loads) and is used for flashing images and unlocking the bootloader.') },
        { question: 'What is ADB sideload?', answer: richText('ADB sideload lets you install OTA updates or zip files through ADB while in recovery mode. It\'s useful for manually installing system updates or flashing files without copying them to the device.') },
      ],
      downloadLinks: [
        { label: 'Android Platform Tools', url: 'https://developer.android.com/tools/releases/platform-tools' },
      ],
      metaTitle: 'ADB & Fastboot Guide — Install, Setup & Commands',
      metaDescription: 'How to install and use ADB and Fastboot on Windows, Mac, and Linux. Essential commands for rooting, flashing, sideloading, and Android debugging.',
      targetKeywords: [{ keyword: 'adb' }, { keyword: 'fastboot' }, { keyword: 'install adb' }, { keyword: 'adb sideload' }],
    },
    {
      title: 'Root Android Without PC',
      slug: 'root-without-pc',
      category: 'root-method' as const,
      excerpt: 'Methods to root Android without a computer. Understand what works, what doesn\'t, and the limitations of PC-less rooting.',
      content: richText('Rooting without a PC is possible on some devices but comes with significant limitations. Modern Android security makes PC-less rooting difficult on newer devices. This guide covers the available options and helps you decide if PC-less rooting is right for you.'),
      steps: [
        { title: 'Check If Your Device Supports PC-Less Rooting', content: richText('PC-less rooting generally only works on older devices (Android 7 and below) or devices with specific exploit availability. Newer devices almost always require a PC for bootloader unlocking and flashing.'), warning: null },
        { title: 'Try Magisk via Custom Recovery (If Already Installed)', content: richText('If your device already has a custom recovery (TWRP), you can download the Magisk APK, rename it to .zip, and flash it through recovery without a PC.'), warning: null },
        { title: 'Consider One-Click Root Apps (Older Devices Only)', content: richText('For older devices, one-click root apps may work. These use security exploits and carry additional risks. See our one-click root guide for details.'), warning: 'One-click root apps carry security risks and only work on older devices.' },
      ],
      faq: [
        { question: 'Can I root my phone without a PC in 2025?', answer: richText('For most modern devices, no. Bootloader unlocking requires fastboot which needs a PC. If you already have TWRP installed, you can flash Magisk without a PC. For older devices, some one-click methods may work.') },
        { question: 'Why is rooting without a PC so limited?', answer: richText('Modern Android security requires bootloader unlocking via fastboot, which can only be done through a PC. The security exploits used by PC-less methods have been patched in newer Android versions.') },
      ],
      metaTitle: 'Root Android Without PC — Methods & Limitations Guide',
      metaDescription: 'Can you root Android without a computer? Guide to PC-less rooting methods, limitations, and which devices support rootless rooting.',
      targetKeywords: [{ keyword: 'root without pc' }, { keyword: 'root android without pc' }, { keyword: 'root without computer' }],
    },
  ]

  for (const data of guidesData) {
    try {
      const existing = await payload.find({
        collection: 'guides',
        where: { slug: { equals: data.slug } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        console.log(`  Guide "${data.title}" already exists, skipping`)
        continue
      }
      await payload.create({ collection: 'guides', data })
      console.log(`  Created guide: ${data.title}`)
    } catch (e: any) {
      console.error(`  Error creating guide ${data.title}:`, e.message)
    }
  }
}

async function seedDevices(payload: any, brandMap: Record<string, number>) {
  const devicesData = [
    // Samsung devices
    { name: 'Galaxy S24 Ultra', slug: 'galaxy-s24-ultra', brand: 'samsung', modelNumber: 'SM-S928B', androidVersion: '14', chipset: 'snapdragon' as const, releaseYear: 2024, status: 'rootable' as const, bootloaderUnlockable: 'varies' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Galaxy S24', slug: 'galaxy-s24', brand: 'samsung', modelNumber: 'SM-S921B', androidVersion: '14', chipset: 'snapdragon' as const, releaseYear: 2024, status: 'rootable' as const, bootloaderUnlockable: 'varies' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Galaxy S23 Ultra', slug: 'galaxy-s23-ultra', brand: 'samsung', modelNumber: 'SM-S918B', androidVersion: '13', chipset: 'snapdragon' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'varies' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Galaxy S23', slug: 'galaxy-s23', brand: 'samsung', modelNumber: 'SM-S911B', androidVersion: '13', chipset: 'snapdragon' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'varies' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Galaxy S22 Ultra', slug: 'galaxy-s22-ultra', brand: 'samsung', modelNumber: 'SM-S908B', androidVersion: '12', chipset: 'snapdragon' as const, releaseYear: 2022, status: 'rootable' as const, bootloaderUnlockable: 'varies' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Galaxy S21 Ultra', slug: 'galaxy-s21-ultra', brand: 'samsung', modelNumber: 'SM-G998B', androidVersion: '11', chipset: 'snapdragon' as const, releaseYear: 2021, status: 'rootable' as const, bootloaderUnlockable: 'varies' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Galaxy S21', slug: 'galaxy-s21', brand: 'samsung', modelNumber: 'SM-G991B', androidVersion: '11', chipset: 'snapdragon' as const, releaseYear: 2021, status: 'rootable' as const, bootloaderUnlockable: 'varies' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Galaxy A54', slug: 'galaxy-a54', brand: 'samsung', modelNumber: 'SM-A546B', androidVersion: '13', chipset: 'exynos' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Galaxy A34', slug: 'galaxy-a34', brand: 'samsung', modelNumber: 'SM-A346B', androidVersion: '13', chipset: 'mediatek' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Galaxy A14', slug: 'galaxy-a14', brand: 'samsung', modelNumber: 'SM-A145F', androidVersion: '13', chipset: 'mediatek' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: false, difficulty: 'intermediate' as const },
    { name: 'Galaxy Note 20 Ultra', slug: 'galaxy-note-20-ultra', brand: 'samsung', modelNumber: 'SM-N986B', androidVersion: '10', chipset: 'exynos' as const, releaseYear: 2020, status: 'rootable' as const, bootloaderUnlockable: 'varies' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Galaxy Z Fold 5', slug: 'galaxy-z-fold-5', brand: 'samsung', modelNumber: 'SM-F946B', androidVersion: '13', chipset: 'snapdragon' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'varies' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: false, difficulty: 'advanced' as const },

    // Google Pixel devices
    { name: 'Pixel 9 Pro', slug: 'pixel-9-pro', brand: 'google', modelNumber: 'GP4BC', androidVersion: '15', chipset: 'tensor' as const, releaseYear: 2024, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'Pixel 9', slug: 'pixel-9', brand: 'google', modelNumber: 'GP4BC', androidVersion: '15', chipset: 'tensor' as const, releaseYear: 2024, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'Pixel 8 Pro', slug: 'pixel-8-pro', brand: 'google', modelNumber: 'G1MNW', androidVersion: '14', chipset: 'tensor' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'Pixel 8', slug: 'pixel-8', brand: 'google', modelNumber: 'G9BQD', androidVersion: '14', chipset: 'tensor' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'Pixel 7 Pro', slug: 'pixel-7-pro', brand: 'google', modelNumber: 'GP4BC', androidVersion: '13', chipset: 'tensor' as const, releaseYear: 2022, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'Pixel 7', slug: 'pixel-7', brand: 'google', modelNumber: 'GP4BC', androidVersion: '13', chipset: 'tensor' as const, releaseYear: 2022, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'Pixel 7a', slug: 'pixel-7a', brand: 'google', modelNumber: 'GWKK3', androidVersion: '13', chipset: 'tensor' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'Pixel 6 Pro', slug: 'pixel-6-pro', brand: 'google', modelNumber: 'GLU0G', androidVersion: '12', chipset: 'tensor' as const, releaseYear: 2021, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'Pixel 6a', slug: 'pixel-6a', brand: 'google', modelNumber: 'GX7AS', androidVersion: '12', chipset: 'tensor' as const, releaseYear: 2022, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'beginner' as const },

    // OnePlus devices
    { name: 'OnePlus 12', slug: 'oneplus-12', brand: 'oneplus', modelNumber: 'CPH2583', androidVersion: '14', chipset: 'snapdragon' as const, releaseYear: 2024, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'OnePlus 11', slug: 'oneplus-11', brand: 'oneplus', modelNumber: 'CPH2449', androidVersion: '13', chipset: 'snapdragon' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'OnePlus Nord 3', slug: 'oneplus-nord-3', brand: 'oneplus', modelNumber: 'CPH2493', androidVersion: '13', chipset: 'mediatek' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'OnePlus 10 Pro', slug: 'oneplus-10-pro', brand: 'oneplus', modelNumber: 'NE2211', androidVersion: '12', chipset: 'snapdragon' as const, releaseYear: 2022, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'OnePlus 9 Pro', slug: 'oneplus-9-pro', brand: 'oneplus', modelNumber: 'LE2121', androidVersion: '11', chipset: 'snapdragon' as const, releaseYear: 2021, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'OnePlus 8T', slug: 'oneplus-8t', brand: 'oneplus', modelNumber: 'KB2001', androidVersion: '11', chipset: 'snapdragon' as const, releaseYear: 2020, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'beginner' as const },

    // Xiaomi devices
    { name: 'Xiaomi 14', slug: 'xiaomi-14', brand: 'xiaomi', modelNumber: '2311DRK48C', androidVersion: '14', chipset: 'snapdragon' as const, releaseYear: 2024, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Xiaomi 13', slug: 'xiaomi-13', brand: 'xiaomi', modelNumber: '2211133C', androidVersion: '13', chipset: 'snapdragon' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Redmi Note 13 Pro', slug: 'redmi-note-13-pro', brand: 'xiaomi', modelNumber: '2312DRA50G', androidVersion: '13', chipset: 'mediatek' as const, releaseYear: 2024, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Redmi Note 12 Pro', slug: 'redmi-note-12-pro', brand: 'xiaomi', modelNumber: '22101316G', androidVersion: '12', chipset: 'mediatek' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'POCO F5', slug: 'poco-f5', brand: 'xiaomi', modelNumber: '23049PCD8G', androidVersion: '13', chipset: 'snapdragon' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'POCO X5 Pro', slug: 'poco-x5-pro', brand: 'xiaomi', modelNumber: '22101320G', androidVersion: '12', chipset: 'snapdragon' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'intermediate' as const },

    // Motorola devices
    { name: 'Moto G Power (2024)', slug: 'moto-g-power-2024', brand: 'motorola', modelNumber: 'XT2339', androidVersion: '14', chipset: 'mediatek' as const, releaseYear: 2024, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: false, difficulty: 'intermediate' as const },
    { name: 'Moto G Stylus (2024)', slug: 'moto-g-stylus-2024', brand: 'motorola', modelNumber: 'XT2317', androidVersion: '14', chipset: 'mediatek' as const, releaseYear: 2024, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: false, difficulty: 'intermediate' as const },
    { name: 'Motorola Edge 40 Pro', slug: 'motorola-edge-40-pro', brand: 'motorola', modelNumber: 'XT2301', androidVersion: '13', chipset: 'snapdragon' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: true, difficulty: 'intermediate' as const },

    // Sony devices
    { name: 'Xperia 1 V', slug: 'xperia-1-v', brand: 'sony', modelNumber: 'XQ-DQ72', androidVersion: '13', chipset: 'snapdragon' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: true, difficulty: 'intermediate' as const },
    { name: 'Xperia 5 V', slug: 'xperia-5-v', brand: 'sony', modelNumber: 'XQ-DE72', androidVersion: '13', chipset: 'snapdragon' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: true, difficulty: 'intermediate' as const },

    // Nothing devices
    { name: 'Nothing Phone (2)', slug: 'nothing-phone-2', brand: 'nothing', modelNumber: 'A065', androidVersion: '13', chipset: 'snapdragon' as const, releaseYear: 2023, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: false, customRomSupport: true, difficulty: 'beginner' as const },
    { name: 'Nothing Phone (1)', slug: 'nothing-phone-1', brand: 'nothing', modelNumber: 'A063', androidVersion: '12', chipset: 'snapdragon' as const, releaseYear: 2022, status: 'rootable' as const, bootloaderUnlockable: 'yes' as const, rootMethod: 'magisk' as const, twrpAvailable: true, customRomSupport: true, difficulty: 'beginner' as const },

    // Huawei devices (mostly not rootable)
    { name: 'Huawei P30 Pro', slug: 'huawei-p30-pro', brand: 'huawei', modelNumber: 'VOG-L29', androidVersion: '10', chipset: 'kirin' as const, releaseYear: 2019, status: 'partial' as const, bootloaderUnlockable: 'no' as const, rootMethod: 'none' as const, twrpAvailable: true, customRomSupport: false, difficulty: 'expert' as const },
    { name: 'Huawei Mate 20 Pro', slug: 'huawei-mate-20-pro', brand: 'huawei', modelNumber: 'LYA-L29', androidVersion: '10', chipset: 'kirin' as const, releaseYear: 2018, status: 'partial' as const, bootloaderUnlockable: 'no' as const, rootMethod: 'none' as const, twrpAvailable: true, customRomSupport: false, difficulty: 'expert' as const },
  ]

  for (const data of devicesData) {
    const brandId = brandMap[data.brand]
    if (!brandId) {
      console.error(`  Brand "${data.brand}" not found, skipping device ${data.name}`)
      continue
    }

    try {
      const existing = await payload.find({
        collection: 'devices',
        where: {
          and: [
            { slug: { equals: data.slug } },
            { brand: { equals: brandId } },
          ],
        },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        console.log(`  Device "${data.name}" already exists, skipping`)
        continue
      }

      const { brand: _brandSlug, ...deviceData } = data
      await payload.create({
        collection: 'devices',
        data: { ...deviceData, brand: brandId },
      })
      console.log(`  Created device: ${data.name}`)
    } catch (e: any) {
      console.error(`  Error creating device ${data.name}:`, e.message)
    }
  }
}

async function seedLearn(payload: any) {
  const learnData = [
    {
      title: 'What Is Rooting? A Complete Explanation',
      slug: 'what-is-rooting',
      excerpt: 'Everything you need to know about Android rooting — what it means, how it works, and why people do it.',
      content: richText('Rooting is the process of gaining privileged access (known as "root access" or "superuser access") on the Android operating system. The term comes from Linux, where "root" is the administrator account with full system control. When you root your Android device, you gain the ability to modify system files, install specialized apps, remove pre-installed bloatware, and customize your phone far beyond what the manufacturer allows. Think of it as the Android equivalent of "jailbreaking" on iOS. By default, Android restricts what users and apps can do to protect the system from accidental damage or malicious software. Rooting removes these restrictions, giving you full control over every aspect of your device.'),
      faq: [
        { question: 'What does rooting actually do to my phone?', answer: richText('Rooting adds a superuser binary and management app (like Magisk) that can grant root access to other apps. It doesn\'t change how your phone looks or works by default — it simply enables the possibility of deeper customization.') },
        { question: 'Is rooting the same as jailbreaking?', answer: richText('They\'re similar concepts. Jailbreaking is the iOS term for removing Apple\'s restrictions. Rooting is the Android equivalent. Both give you administrative access to the device\'s operating system.') },
        { question: 'Do I need to root my phone?', answer: richText('Most casual users don\'t need root. It\'s useful if you want to remove bloatware, use root-only apps (like Titanium Backup), install custom ROMs, use ad blockers system-wide, or deeply customize your device.') },
      ],
      metaTitle: 'What Is Rooting? Complete Guide to Android Root Access',
      metaDescription: 'Learn what rooting means for Android devices. Understand how root access works, why people root their phones, and what you can do with a rooted device.',
      targetKeywords: [{ keyword: 'what is rooting' }, { keyword: 'what does rooting mean' }, { keyword: 'root access android' }],
    },
    {
      title: 'Is Rooting Safe? Risks, Safety, and Precautions',
      slug: 'is-rooting-safe',
      excerpt: 'An honest look at the risks and safety of rooting Android. SafetyNet, security implications, warranty concerns, and how to root safely.',
      content: richText('Rooting your Android device is generally safe when done correctly, but it does carry risks that you should understand before proceeding. The act of rooting itself won\'t damage your device, but it changes your phone\'s security posture and can lead to issues if not managed properly. This article gives you an honest assessment of the risks and how to minimize them.'),
      faq: [
        { question: 'Can rooting brick my phone permanently?', answer: richText('Permanent bricks are extremely rare. Most issues from rooting result in "soft bricks" that can be fixed by reflashing stock firmware. As long as you don\'t flash incompatible files, the risk of a permanent brick is minimal.') },
        { question: 'Will rooting void my warranty?', answer: richText('In most cases, yes. Manufacturers can detect that the bootloader was unlocked. However, many users restore stock firmware before warranty service, and in practice this often works.') },
        { question: 'Does rooting make my phone less secure?', answer: richText('Potentially, yes. Root access means apps can make system-level changes. However, tools like Magisk let you control which apps get root access. If you only grant root to trusted apps, the security risk is manageable.') },
      ],
      metaTitle: 'Is Rooting Safe? Honest Assessment of Android Root Risks',
      metaDescription: 'Is rooting your Android phone safe? Understand the real risks, SafetyNet/Play Integrity implications, warranty concerns, and safety precautions.',
      targetKeywords: [{ keyword: 'is rooting safe' }, { keyword: 'rooting risks' }, { keyword: 'safetynet' }],
    },
    {
      title: 'Benefits of Rooting: Why Root Your Android?',
      slug: 'benefits-of-rooting',
      excerpt: 'Discover the real benefits of rooting Android — from removing bloatware to system-wide ad blocking, custom ROMs, and powerful root-only apps.',
      content: richText('Rooting unlocks a range of capabilities that simply aren\'t available on stock Android. While the average user may not need root, power users find it invaluable for customization, privacy, performance tuning, and extending the life of older devices. Here are the most compelling reasons to root your Android device.'),
      faq: [
        { question: 'What can I do with a rooted phone?', answer: richText('Remove bloatware, block ads system-wide, install custom ROMs for longer software support, use powerful backup tools like Titanium Backup, overclock or underclock the CPU, automate tasks with Tasker root features, and more.') },
        { question: 'Is it worth rooting in 2025?', answer: richText('It depends on your needs. If you want deep customization, privacy ROMs like GrapheneOS, or system-wide ad blocking, yes. If you\'re happy with stock Android features, rooting may not be necessary.') },
      ],
      metaTitle: 'Benefits of Rooting Android — Why Root Your Phone?',
      metaDescription: 'Top reasons to root your Android phone: remove bloatware, system-wide ad blocking, custom ROMs, root-only apps, and complete device control.',
      targetKeywords: [{ keyword: 'benefits of rooting' }, { keyword: 'why root android' }],
    },
    {
      title: 'How to Unroot Android: Remove Root Completely',
      slug: 'unrooting',
      excerpt: 'Step-by-step guide to completely unroot your Android device and restore it to stock. Remove Magisk, relock bootloader, and restore warranty.',
      content: richText('Whether you want to restore warranty, fix issues with banking apps, or simply go back to stock, unrooting is straightforward. This guide covers how to completely remove root access from your Android device using different methods depending on how you rooted.'),
      faq: [
        { question: 'Will unrooting fix my banking apps?', answer: richText('In most cases, yes. Completely unrooting and relocking the bootloader should restore Play Integrity checks to passing status, allowing banking apps to work normally.') },
        { question: 'Can I root again after unrooting?', answer: richText('Yes, the rooting process is fully reversible. You can root and unroot as many times as you need.') },
      ],
      metaTitle: 'How to Unroot Android — Remove Root & Restore Stock',
      metaDescription: 'Complete guide to unrooting Android. Remove Magisk, restore stock boot image, relock bootloader, and get your phone back to factory state.',
      targetKeywords: [{ keyword: 'unroot android' }, { keyword: 'remove root' }, { keyword: 'unroot' }],
    },
    {
      title: 'Rooting by Android Version: 11, 12, 13, 14, 15',
      slug: 'rooting-by-android-version',
      excerpt: 'How rooting differs across Android versions. Version-specific guides and compatibility info for Android 11 through Android 15.',
      content: richText('The rooting process has evolved significantly across Android versions. Each major release brings security changes that affect how rooting works. This guide covers the key differences and recommended approaches for each recent Android version.'),
      faq: [
        { question: 'Which Android version is easiest to root?', answer: richText('Older versions (Android 10 and below) are generally easier to root with more available tools and exploits. For modern devices, Android 12-15 with GKI kernels work well with both Magisk and KernelSU.') },
        { question: 'Can I root Android 15?', answer: richText('Yes, Android 15 can be rooted using Magisk or KernelSU. The process is the same as recent versions: unlock bootloader, patch boot image, and flash it via fastboot.') },
      ],
      metaTitle: 'Root Android by Version — Android 11, 12, 13, 14, 15 Guide',
      metaDescription: 'How to root each Android version from 11 to 15. Version-specific rooting guides, compatibility info, and recommended tools for each release.',
      targetKeywords: [{ keyword: 'root android 14' }, { keyword: 'root android 15' }, { keyword: 'root android 13' }],
    },
  ]

  for (const data of learnData) {
    try {
      const existing = await payload.find({
        collection: 'learn',
        where: { slug: { equals: data.slug } },
        limit: 1,
      })
      if (existing.docs.length > 0) {
        console.log(`  Learn "${data.title}" already exists, skipping`)
        continue
      }
      await payload.create({ collection: 'learn', data })
      console.log(`  Created learn article: ${data.title}`)
    } catch (e: any) {
      console.error(`  Error creating learn article ${data.title}:`, e.message)
    }
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
