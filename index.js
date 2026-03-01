/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */

const { Client, GatewayIntentBits, Collection, EmbedBuilder, Events, ButtonBuilder, ActionRowBuilder, ButtonStyle, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.js');
const process = require('process');
const dbManager = require('./dbManager.js');

// --- MongoDB Monkey Patch (Transition JSON to Mongo seamlessly) ---
const originalReadFileSync = fs.readFileSync;
const originalWriteFileSync = fs.writeFileSync;
const originalExistsSync = fs.existsSync;

fs.existsSync = function (filePath) {
    if (typeof filePath === 'string' && (filePath.includes('database\\database') || filePath.includes('database/database')) && filePath.endsWith('.json')) {
        return true;
    }
    return originalExistsSync.apply(this, arguments);
};

fs.readFileSync = function (filePath, encoding) {
    if (typeof filePath === 'string' && (filePath.includes('database\\database') || filePath.includes('database/database')) && filePath.endsWith('.json')) {
        const basename = path.basename(filePath, '.json');
        return JSON.stringify(dbManager.get(basename));
    }
    return originalReadFileSync.apply(this, arguments);
};

fs.writeFileSync = function (filePath, data, options) {
    if (typeof filePath === 'string' && (filePath.includes('database\\database') || filePath.includes('database/database')) && filePath.endsWith('.json')) {
        const basename = path.basename(filePath, '.json');
        try {
            dbManager.set(basename, typeof data === 'string' ? JSON.parse(data) : data);
        } catch (e) {
            console.error(`Failed parsing DB patch data:`, e.message);
        }
        return; // act exactly like fs write success
    }
    return originalWriteFileSync.apply(this, arguments);
};
// -------------------------------------------------------------------


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});


// Colors for console
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    magenta: "\x1b[35m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    gray: "\x1b[90m"
};

const banner = `
${colors.cyan}${colors.bright}      ___                      _  __
     /   |  ___  __________  _  \\ \\/ /
    / /| | / _ \\/ ___/ __ \\| |/_/   / 
   / ___ |/  __/ /  / /_/ />  < /   |  
  /_/  |_|\\___/_/   \\____/_/|_/_/|__|
${colors.reset}${colors.blue}${colors.bright}      A e r o X   V o u c h e r s${colors.reset}
${colors.gray}   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
`;

console.clear();
console.log(banner);

client.commands = new Collection();
client.slashCommands = new Collection();
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));

// --- Initialize MongoDB First ---
dbManager.init(config.mongoURI).then(() => {
    console.log(`${colors.magenta}[ SYSTEM ]${colors.reset} Loading ${colors.bright}${commandFiles.length}${colors.reset} commands...`);
    for (const file of commandFiles) {
        try {
            const command = require(`./commands/${file}`);
            client.commands.set(command.name, command);
        } catch (error) {
            console.error(`${colors.red}[ ERROR ]${colors.reset} Command ${file}:`, error.message);
        }
    }

    console.log(`${colors.magenta}[ SYSTEM ]${colors.reset} Loading ${colors.bright}${eventFiles.length}${colors.reset} events...`);
    const loadEvents = require('./handlers/events');
    loadEvents(client);

    client.config = config;

    client.login(config.token).catch(err => {
        console.error(`${colors.red}[ FATAL ]${colors.reset} Auth failed:`, err.message);
        process.exit(1);
    });
});




client.once('ready', async () => {
    console.log(`${colors.green}[ SUCCESS ]${colors.reset} Logged in as ${colors.bright}${client.user.tag}${colors.reset}`);
    client.user.setActivity(config.branding.supportInvite.split('/').pop(), { type: 2 });

    console.log(`${colors.magenta}[ SYSTEM ]${colors.reset} Initializing slash commands and member cache...`);

    // --- Auto-Deploy Global Slash Commands ---
    try {
        const rest = new REST({ version: '10' }).setToken(config.token);
        const commandsData = client.slashCommands.map(cmd => cmd.data.toJSON ? cmd.data.toJSON() : cmd.data);

        await rest.put(
            Routes.applicationCommands(config.CLIENT_ID),
            { body: commandsData }
        );
        console.log(`${colors.green}[ SUCCESS ]${colors.reset} Global slash commands dynamically synced!`);
    } catch (error) {
        console.error(`${colors.red}[ ERROR ]${colors.reset} Global slash commands sync failed:`, error.message);
    }

    // --- Cache all guild members ---
    let totalCached = 0;
    for (const guild of client.guilds.cache.values()) {
        try {
            await guild.members.fetch();
            totalCached += guild.memberCount;
        } catch (error) {
            console.error(`${colors.yellow}[ WARNING ]${colors.reset} Could not fetch members for ${guild.name}`);
        }
    }
    console.log(`${colors.green}[ SUCCESS ]${colors.reset} Cached ${totalCached} members across ${client.guilds.cache.size} guilds.`);
    console.log(`${colors.blue}--------------------------------------------------${colors.reset}`);
    console.log(`${colors.cyan}${colors.bright}${config.branding.name} Voucher Booted Successfully!${colors.reset}`);
    console.log(`${colors.blue}--------------------------------------------------${colors.reset}`);
});



const cooldowns = new Map();


client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const premiumPath = path.join(__dirname, '../database/premium.json');

    function loadPremiumData() {
        if (fs.existsSync(premiumPath)) {
            try {
                return JSON.parse(fs.readFileSync(premiumPath, 'utf8'));
            } catch (error) {
                console.error('Error loading premium database:', error);
                return {};
            }
        }
        return {};
    }

    const premiumDB = loadPremiumData();
    const isPremium = premiumDB[message.author.id] && premiumDB[message.author.id].expiresAt > Date.now();

    // Define prefixes
    const prefixes = ['+', '-'];

    let prefix = null;
    let args;
    let commandName;

    if (isPremium) {
        // Premium users: Allow commands with +, -, or no prefix
        if (prefixes.some(p => message.content.startsWith(p))) {
            prefix = prefixes.find(p => message.content.startsWith(p));
            args = message.content.slice(prefix.length).trim().split(/ +/);
        } else {
            args = message.content.trim().split(/ +/);
        }
    } else {
        // Non-premium users: Only allow + or - prefix
        prefix = prefixes.find(p => message.content.startsWith(p));
        if (!prefix) return;
        args = message.content.slice(prefix.length).trim().split(/ +/);
    }

    commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    // Scam detection for -vouch and -rep
    if ((commandName === 'rep' || commandName === 'vouch') && prefix === '-') {
        const scamEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('⚠️ Scam Detected')
            .setDescription('Our system has detected that you got scammed by someone.')
            .addFields({ name: 'Need Assistance?', value: `Join [Support](${config.branding.supportInvite}) to get them marked!` })
            .setFooter({ text: config.branding.footer, iconURL: message.client.user.displayAvatarURL() });

        return message.channel.send({ embeds: [scamEmbed] });
    }

    const restrictedChannels = config.restrictedChannels;

    if (restrictedChannels.includes(message.channel.id)) {
        return message.reply({ content: `Dumbo? Use <#${config.redirectChannel}>!` })
            .then(msg => setTimeout(() => msg.delete().catch(() => { }), 10000));
    }

    let command =
        client.commands.get(commandName) ||
        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    const cooldownKey = `${message.author.id}-${commandName}`;
    const now = Date.now();

    if (
        !config.owners.includes(message.author.id) &&
        !message.member.roles.cache.some(role => config.staffRoles.includes(role.id)) &&
        cooldowns.has(cooldownKey)
    ) {
        const expirationTime = cooldowns.get(cooldownKey);
        if (now < expirationTime) {
            const blockKey = `blocked-${message.author.id}`;
            if (!cooldowns.has(blockKey)) {
                cooldowns.set(blockKey, true);

                let remainingTime = Math.ceil((expirationTime - now) / 1000);
                const cooldownEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setDescription(`⚠️ Please wait **${remainingTime}s** before using this command again.`);

                const cooldownMessage = await message.reply({ embeds: [cooldownEmbed] });

                const countdownInterval = setInterval(() => {
                    remainingTime -= 1;
                    if (remainingTime <= 0) {
                        clearInterval(countdownInterval);
                        cooldownMessage.delete().catch(console.error);
                        cooldowns.delete(blockKey);
                    } else {
                        cooldownEmbed.setDescription(`⚠️ Please wait **${remainingTime}s** before using this command again.`);
                        cooldownMessage.edit({ embeds: [cooldownEmbed] }).catch(console.error);
                    }
                }, 1000);
            }
            return;
        }
    }

    cooldowns.set(cooldownKey, now + 10000);
    setTimeout(() => cooldowns.delete(cooldownKey), 10000);

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error('Error executing command:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setDescription('⚠️ There was an error while executing this command.');
        await message.reply({ embeds: [errorEmbed] });
    }
});



// Events and other handlers already initialized above
// const loadEvents = require('./handlers/events');
// loadEvents(client);

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'verify') {
            const roleId = config.verification.roleId;
            const member = interaction.member;

            if (!member) {
                return interaction.reply({
                    content: '⚠️ An unexpected error occurred while verifying your role. Contact staff to get verified.',
                    ephemeral: true,
                });
            }

            try {
                if (member.roles.cache.has(roleId)) {
                    return interaction.reply({
                        content: '⚠️ You are already verified.',
                        ephemeral: true,
                    });
                }

                await member.roles.add(roleId);
                return interaction.reply({
                    content: `You have been successfully verified in ${config.branding.name}.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error('Error verifying user:', error);
                return interaction.reply({
                    content: '⚠️ An error occurred while processing your verification. Contact staff to get verified.',
                    ephemeral: true,
                });
            }
        }
        if (interaction.customId === 'rpolicy') {
            const reportPolicyEmbed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('Report Policy')
                .setDescription('Click the button below to view the **Report Policy**.');

            const reportButton = new ButtonBuilder()
                .setLabel('View Report Policy')
                .setStyle(ButtonStyle.Link)
                .setURL(config.links.reportPolicy);

            const row = new ActionRowBuilder().addComponents(reportButton);

            return interaction.reply({
                embeds: [reportPolicyEmbed],
                components: [row],
                ephemeral: true,
            });
        }

        if (interaction.customId === 'vpolicy') {
            const vouchPolicyEmbed = new EmbedBuilder()
                .setColor('Blurple')
                .setTitle('Vouch Policy')
                .setDescription('Click the button below to view the **Vouch Policy**.');

            const vouchButton = new ButtonBuilder()
                .setLabel('View Vouch Policy')
                .setStyle(ButtonStyle.Link)
                .setURL(config.links.vouchPolicy);

            const row = new ActionRowBuilder().addComponents(vouchButton);

            return interaction.reply({
                embeds: [vouchPolicyEmbed],
                components: [row],
                ephemeral: true,
            });
        }
        return;
    }


    if (interaction.isCommand()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Error executing command:', error);
            await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
        }
    }
});


const slashCommandsPath = path.join(__dirname, 'slashCommands');
const slashCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));

for (const file of slashCommandFiles) {
    const command = require(path.join(slashCommandsPath, file));
    if (command.data && command.execute) {
        client.slashCommands.set(command.data.name, command);
    } else {
        console.warn(`❗ Slash command at ${file} is missing a required "data" or "execute" property.`);
    }
}

client.on('guildCreate', async (guild) => {
    const channelId = config.logChannels.guildLogs;
    const joinChannel = client.channels.cache.get(channelId);

    if (!joinChannel) {
        console.error(`Join channel with ID ${channelId} not found.`);
        return;
    }

    const owner = await guild.fetchOwner();
    const embed = new EmbedBuilder()
        .setTitle('Joined a New Server')
        .setColor('Blurple')
        .addFields(
            { name: 'Server Name', value: guild.name, inline: true },
            { name: 'Server ID', value: guild.id, inline: true },
            { name: 'Total Members', value: `${guild.memberCount}`, inline: true },
            { name: 'Owner', value: `${owner.user.tag} (${owner.user.id})`, inline: true },
            { name: 'Region', value: guild.preferredLocale || 'Unknown', inline: true },
            { name: 'Created At', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setTimestamp();

    joinChannel.send({ embeds: [embed] });
});

client.on('guildDelete', (guild) => {
    const channelId = config.logChannels.guildLogs;
    const leaveChannel = client.channels.cache.get(channelId);

    if (!leaveChannel) {
        console.error(`Leave channel with ID ${channelId} not found.`);
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('Left a Server')
        .setColor(0xff0000)
        .addFields(
            { name: 'Server Name', value: guild.name, inline: true },
            { name: 'Server ID', value: guild.id, inline: true },
            { name: 'Total Members', value: `${guild.memberCount || 'Unknown'}`, inline: true },
        )
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setTimestamp();

    leaveChannel.send({ embeds: [embed] });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isStringSelectMenu() || interaction.customId !== 'faq_select') return;

    const responses = {
        seventh: `> To add AeroX Voucher to your server, visit [this link](${config.branding.botInvite}) and choose your server in which you want to add the bot.`,
        first: `${config.branding.name} is a server where we aim to expose and prevent fraudulent activities within online communities.\n${config.branding.name} was founded by <@${config.owners[1]}> and <@${config.owners[0]}>, On the other hand <@${config.owners[0]}> is the only sole developer of AeroX Voucher.`,
        second: `> To report fraud, please provide detailed information by creating a ticket from <#${config.faq.ticketsChannel}>, This includes proof like screenshots, links, and any relevant details.`,
        third: '> Always be cautious when making transactions. Report suspicious activity and help others stay safe!',
        fourth: '> No, advertising is strictly prohibited unless explicitly authorized by the admins.',
        fifth: '> If you are interested in becoming a mod, stay active, help out, and make sure to follow all server rules. Keep an eye on announcements for available positions.',
        sixth: `If you want to import your vouches, Head over to <#${config.faq.vouchesImportChannel}>.`,
        rpolicy: `**Report Policy of ${config.branding.name}**  

**__Valid Reports__**  

**Breach of Agreement**  
- A violation of an agreed-upon service term or contract.  

**Nitro Scams**  
- Scams related to Discord Nitro, including fraudulent giveaways and unauthorized charges.  

**Giveaway Scams**  
- The failure to deliver a promised giveaway prize.  

**Invite Rewards Scams**  
- Scams involving rewards for inviting users to a server, where the promised incentives are not provided.  

**Transfer Scams**  
- Fraudulent money transfer schemes, such as "money doubling" or "guaranteed gambling" scams.  

**Exchange Scams**  
- Scams involving currency or asset exchanges (e.g., cryptocurrency to USD).  

**Account Takeover / Attempted Account Takeover**  
- Unauthorized attempts to access or take control of another user’s account (e.g., phishing links or credential theft).  

**Middleman (MM) Refusal**  
- The refusal to use a mutually trusted middleman for a transaction, particularly when the counterparty insists on using an unverified third party.  

**Cooperation with a Known Scammer**  
- Evidence of a user working with or assisting a known scammer or a service owned by a scammer.  

**Attempted Scam**  
- Any failed or incomplete scam attempt, even if no funds or items were lost.  

**Submitting Fake Evidence**  
- Providing falsified, edited, or misleading evidence in an attempt to manipulate a report.  

---

**__Invalid Reports__**  

**Violations of Discord TOS or Local Laws**  
- Reports involving transactions that violate Discord’s Terms of Service or the laws of a specific country.  

**Highly Illegal Transactions**  
- Cases involving malware distribution, personal information leaks, child exploitation material (CSAM), or other serious criminal activities.  

**Offensive Actions**  
- Insults, defamation, libel, harassment, or sales-trashing are not handled under this policy.  

**Disputes Under $1 USD**  
- Reports regarding scams involving amounts less than $1 USD.  

**In-Game Trading Disputes**  
- Reports related to in-game item trading without real currency involved.  

**Malware-Related Reports**  
- Issues concerning viruses, ransomware, or malware-related transactions.  

**Non-English Reports**  
- Reports primarily written in a non-English language may not be processed unless they involve staff members, high-value scams, or scammers with numerous vouches.  
- Exceptions are made at the discretion of **@Report Admin**.  

**Unfair Seller Terms & Conditions (TOS)**  
- **Contradictory Terms** – e.g., offering a "lifetime warranty" but stating "no replacements or refunds."  
- **Scam by Supplier = No Refund** – e.g., refusing a refund if the seller’s supplier fails to deliver the product.  
- **No Replacement / Refund Under Any Circumstance** – e.g., denying buyer compensation regardless of seller wrongdoing.  
- **Excuses to Scam** – Unreasonable, unfair, or misleading terms that seek to exploit buyers rather than provide protection.  

---

**__Note:__**  
This is not an exhaustive list. Any term or action deemed predatory, unfair, or intentionally deceptive will be overruled. **Terms of Service should protect both buyers and sellers, not be used as a tool for exploitation.**  

If your report meets our policy, feel free to open a report in <#${config.faq.ticketsChannel}>.`,

        vpolicy: `**Vouch Policy of AeroX Voucher**  

---

### How to Vouch Correctly  

Vouching is an essential part of building trust within the community. To ensure a **transparent, clear, and fair vouching system**, all users must follow the proper format when submitting a vouch.  

Failure to adhere to the **Vouch Policy** may result in the vouch being denied, and repeated violations can lead to **blacklisting** from vouching privileges.  

---

### Format Requirement  

- Your vouch **must clearly mention the product/service name and the price** you paid.  
- **Incorrectly formatted vouches will be denied.**  

✅ **Example of a Correct Vouch:**  
- Legit Seller | **Nitro Boost 1 Month for $9 [LTC]**  
- Trusted Exchange | **Exchanged $100 [UPI] to LTC**  
- Smooth Transaction | **Bought Spotify Premium for ₹200**  

❌ **Incorrect Examples:**  
- **Got Nitro Boost**  
- **Legit Seller, fast service**  
- **Exchanged money successfully**  
- **Bought Netflix for 20**  

Vouches must contain **clear pricing information** and **the specific product/service purchased.**  

---

### Accepted & Prohibited Vouch Formats  

#### Exchange Vouches  

✅ **Correct Formats:**  
- Exchange **$100 [UPI]** to **LTC**  
- Exchange **$50 [LTC]** to **UPI**  
- Exchanged **$100 PayPal** to **Bitcoin**  

❌ **Incorrect Formats:**  
- Exchange **UPI to LTC**  
- Legit Exchange **$100**  
- Legit Exchange **100$ to 100$**  

A proper exchange vouch **must specify the currency used on both sides of the exchange.**  

---

#### Selling Vouches  

✅ **Correct Formats:**  
- **Nitro Boost 1 Month for $8**  
- **Netflix 1 Month for $9**  
- **Nitro Basic 1 Month for $1**  

❌ **Incorrect Formats:**  
- **Got Nitro Boost**  
- **Netflix Subscription**  
- **Nitro Basic**  
- **Spotify Premium for 20**  

A vouch **must specify the product/service and the price paid** in a **clear and structured format.**  

---

### Vouch Policy 1.2 - Minimum Amount Requirement  

To maintain the integrity of the vouching system, vouches are **only accepted for products/services priced above $1 USD** (or the equivalent in other currencies).  

✅ **Accepted Minimum Values:**  
- **$1 USD**  
- **₹90 INR**  
- **€1 EUR**  
- **£1 GBP**  

❌ **Not Accepted:**  
- **Deals below $1 USD or equivalent**  
- **"Gifted" or "Free" transactions**  

Any vouch for an amount lower than the **minimum price requirement** will be **denied automatically.**  

---

### Vouch Policy 1.3 - Prohibited Abbreviations & Slang  

To ensure clarity and professionalism, **shortened words, abbreviations, and informal slang** are **strictly prohibited** in vouches.  

❌ **Inappropriate Format Examples:**  
- **bst lyf 2$**  
- **basc 1$**  
- **pp2c 4$**  
- **Spotify prem 3$**  
- **Exch 10$ btc to ltc**  

✅ **Correct Formats:**  
- **Bought "Best Life" Package for $2**  
- **Purchased "Basic Nitro" for $1**  
- **Exchanged $10 Bitcoin to Litecoin**  

Vouches **must be written clearly** to be considered valid.  

---

### Vouch Policy 1.4 - Fake or Misleading Vouches  

- **Users found submitting fake vouches will be permanently blacklisted.**  
- **A fake vouch includes:**  
  - Submitting a vouch for a transaction that **never happened.**  
  - Exaggerating or **misrepresenting** the details of a transaction.  
  - **Using alternate accounts or friends** to generate fake vouches.  

- **Punishment for Fake Vouches:**  
  - **First offense:** Temporary vouch restriction.  
  - **Second offense:** Permanent vouch restriction and server-wide blacklist.  

---

### Vouch Policy 1.5 - Disputes & Conflict Resolution  

If you **disagree** with a vouch or suspect a false vouch, follow these steps:  

1. **Contact the staff team immediately** and provide evidence.  
2. **Do not harass or threaten users** over vouches.  
3. **All vouch-related disputes must go through official staff handling.**  
4. **Retaliatory vouching is prohibited.**  
   - This means **leaving a negative vouch** just because someone left one for you is **not allowed.**  

Repeated involvement in vouch-related conflicts **may result in temporary or permanent vouching restrictions.**  

---

### What Happens If You Don’t Follow the Vouch Policy?  

To maintain a **trusted and secure environment**, violations of the vouching policy will be taken seriously.  

1️⃣ **First Offense:** Vouch will be denied with an explanation.  
2️⃣ **Second Offense:** Warning issued in DMs.  
3️⃣ **Third Offense:** Temporary suspension from vouching.  
4️⃣ **Repeated Violations:** **Permanent blacklist from vouching.**  

If we detect inappropriate behavior, **abuse of the system, fake vouches, or attempts to manipulate vouch counts, you will be permanently blacklisted from vouching.**  

By using the vouching system, you agree to **follow these rules** and **maintain fair trade practices** within the community.  

AeroX Voucher reserves the right to update and modify these policies at any time.  
`,
    };

    const selectedResponse = responses[interaction.values[0]];
    if (selectedResponse) {
        await interaction.reply({
            content: selectedResponse,
            ephemeral: true
        });
    } else {
        await interaction.reply({
            content: 'An unexpected error occurred. Please try again.',
            ephemeral: true
        });
    }
});
/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */
