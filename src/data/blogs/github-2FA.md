---
title: "Enable GitHub 2FA with KeePass: A Privacy-Focused Alternative"
description: "Ditch cloud-synced authenticators like Authy, Microsoft, or Bitwarden. Learn how to use KeePass for GitHub 2FA to keep your TOTP codes completely offline, free, and entirely under your control."
date: "2026-09-20"
readTime: "2 min read"
tags: ["GitHub", "KeePass", "Cybersecurity", "2FA", "Privacy", "TOTP", "Open Source"]
---

GitHub pushes you toward Authy, Microsoft Authenticator, and Bitwarden when setting up two-factor authentication (2FA). But these "convenient" options come with hidden privacy trade-offs.

## The Problem with Default Authenticators

Why should you avoid the mainstream suggestions? 

- **Authy:** Cloud-synced codes mean Twilio collects and processes your data.
- **Microsoft Authenticator:** Tied to Microsoft’s ecosystem and tracks your activity.
- **Bitwarden:** Requires a premium subscription just to access TOTP code generation.

## Why KeePass ?

KeePass offers a strictly privacy-focused approach to 2FA:

- **Open-source and auditable:** Anyone can inspect the code.
- **Completely offline:** No cloud required (though you can self-host syncing via Syncthing to your local laptop, phone, or server).
- **Free forever:** No premium tiers, no surprise paywalls.
- **Local storage:** Your data never leaves your computer unless you want it to.
- **Works offline:** Generates codes without an internet connection.
- **No third-party dependency:** You own your security architecture.

If you already use KeePass for password management, using it for 2FA is the logical next step. It’s that simple.

## Step 1: Retrieve GitHub’s Secret Key

1. Navigate to GitHub’s 2FA setup page where the QR code is displayed.
2. Look for a link that says "Can't scan?" or "enter setup key manually".
3. Click it to reveal your plain-text secret key.
4. Copy this long text string (e.g., \`JBSWY3DPEBLW64TMMQ...\`).

## Step 2: Add the Secret Key to KeePass

1. Open your KeePass database.
2. Find or create an entry for GitHub (edit the existing one if you already have it).
3. Right-click the entry and select **Edit Entry**.
4. Look for the **TOTP** field or button in the dialog window.
5. Paste your secret key into this field.
6. Click **OK** and save your database.

## Step 3: Get Your Verification Code

1. Switch back to GitHub’s 2FA setup page.
2. Open your GitHub entry in KeePass.
3. Look at the TOTP field — you will see a 6-digit code that refreshes every 30 seconds.
4. Copy this code.
5. Paste it into GitHub’s verification field (where it says "XXXXXX").
6. Click **Continue**.

## Step 4: Securely Store Backup Codes

GitHub will provide recovery codes. These are critical for regaining access if you lose your KeePass database or your computer breaks.

1. Copy all the provided recovery codes.
2. Create a new KeePass entry titled "GitHub Backup Codes".
3. Paste the codes into the notes field.
4. Save the entry.

Don't lose these. They are your failsafe.

## Verify It Works

To ensure everything is set up correctly:

1. Log out of your GitHub account.
2. Log back in using your username and password.
3. When GitHub prompts for a 2FA code, open KeePass and view your GitHub entry’s TOTP field.
4. Copy the 6-digit code and enter it.
5. You’re in. 

Your GitHub account is now protected with 2FA using only KeePass.

## Why This Matters

By utilizing KeePass over cloud-based authenticators, you are taking back control:

- **You own your security:** No corporate entity controls your 2FA codes.
- **No data harvesting:** Your authentication attempts aren't logged or analyzed.
- **True offline access:** Codes work even without the internet.
- **One tool, one password:** Everything stays in one place you control.
- **Free forever:** No premium tiers or hidden costs.

GitHub doesn't heavily advertise manual TOTP setup because they prefer you use services that generate network traffic or integrate with their tracking ecosystems. But it works perfectly, and it's far more private.

## Conclusion

1. **Privacy is an active choice.** Default options often prioritize data collection over user security.
2. **Offline is secure.** Storing TOTP secrets locally eliminates an entire attack vector (cloud breaches).
3. **Consolidation reduces friction.** Managing passwords and 2FA in one open-source tool is simpler and safer.
4. **Backup codes are mandatory.** Always store recovery codes securely offline to prevent catastrophic lockouts.

GitHub’s default suggestions prioritize convenience and data collection over privacy. KeePass is the privacy-focused, ownership-focused alternative. It’s free, it’s simple, and it keeps your security entirely in your hands.
