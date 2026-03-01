<div align="center">
  <img src="https://i.imgur.com/kZ8IEWl.gif" alt="AeroX Voucher Banner" width="200" />
  <h1>🚀 AeroX Voucher</h1>
  <p><strong>A Next-Generation, High-Performance Vouch and Reputation System for Discord.</strong></p>
  
  [![Discord](https://img.shields.io/discord/1327975540963020800?color=5865F2&logo=discord&logoColor=white)](https://discord.gg/aerox)
  [![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?logo=nodedotjs)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb)](https://mongodb.com)
</div>

---

## 🌟 Overview

**AeroX Voucher** is a powerful Discord bot tailored for secure trading communities and developer marketplaces. It provides an automated, seamlessly synced reputation system that tracks transactions, manages user profiles, handles disputes, and mitigates scam risks in real-time.

Built with performance in mind, the bot utilizes a hybrid **In-Memory Cache + MongoDB** architecture. This ensures commands execute instantly while all data is securely backed up to the cloud without latency.

---

## ✨ Core Features

### 🛡️ Reputation & Vouching
- **Vouch Submission & Review:** Staff can accept or deny newly submitted vouches efficiently via dedicated channels.
- **Dynamic Profile Badges:** Users earn custom badges (e.g., Top 10, 500+ Vouches, Booster, Member) based on their milestones.
- **Detailed Profiles:** Displays complete vouch history, imported vouches, forum interactions, and past comments in a clean UI.

### 🚨 Security & Moderation
- **Scammer / DWC / Blacklist Protections:** Rapid mitigation against malicious actors.
  - Automatically identifies and restricts known scammers.
  - **DWC (Deal With Caution)** tags for risky profiles.
- **Role-Based Authentication:** Ensure that only verified members interact within critical marketplaces via role checks.

### ⚡ Technical Highlights
- **Zero-Latency Database:** Custom caching engine (`dbManager.js`) that buffers `fs` methods directly to **MongoDB Atlas**, saving data in bulk seamlessly behind the scenes.
- **Global Slash Commands (Auto-Deploy):** Bot automatically negotiates with Discord’s REST API to keep slash commands synced worldwide instantly on boot.
- **Centralized Configuration:** All branding, emojis, tokens, channels, and rules can be modified via a single `config.js` file.

---

## 💻 Tech Stack

- **[Discord.js v14](https://discord.js.org/)** – Interaction & WebSocket Manager
- **[MongoDB & Mongoose](https://mongoosejs.com/)** – Cloud Database
- **[Node.js](https://nodejs.org/en)** – Runtime execution

---

## 📜 Credits

*Open Sourced by **AeroX Development***  
💬 **Support & Community:** [discord.gg/aerox](https://discord.gg/aerox)  
*Original Source Concept by FraudAlert*
