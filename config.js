/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */

module.exports = {
    // --- Core Bot Configuration ---
    // The unique secret token for your Discord bot
    token: "MTM5MzYyODcyMDMxMjQ4Mzg0MA.GVTvce.tISqs5s8XXZ6MUQIqfD9-6IIMNNQ4WZuPwH3iE",
    // The bot's numeric Application/Client ID
    CLIENT_ID: "1393628720312483840",

    // --- MongoDB Database Connection ---
    // Your MongoDB Atlas Connection String
    mongoURI: "mongodb+srv://AeroX:AeroX@aerox.cgvmit4.mongodb.net/?retryWrites=true&w=majority&appName=AeroX",

    // --- Ownership ---
    // A list of User IDs that have full developer permissions (Eval, etc.)
    owners: [
        "1219880124351119373" // Primary Developers
    ],

    // --- Branding & Identity ---
    branding: {
        name: "AeroX Devs",
        footer: "Created by AeroX | AeroX Devs | .gg/AeroX",
        supportInvite: "https://discord.gg/AeroX",
        botInvite: "https://discord.com/oauth2/authorize?client_id=1335553466059325532&permissions=412317142080&integration_type=0&scope=bot",
        supportServerId: "1327975540963020800"
    },

    // --- Links & Documentation ---
    links: {
        reportPolicy: "https://fraudalertbot.github.io/report-policy/",
        vouchPolicy: "https://fraudalertbot.github.io/vouch-policy/"
    },

    // --- Images & Assets ---
    images: {
        verificationGif: "https://i.imgur.com/kZ8IEWl.gif"
    },

    // --- Specific Role IDs ---
    roles: {
        // General staff access
        staff: "1335633435460501617",
        // Can use +accept and +deny
        vouchManager: "1335556994781679617",
        // Can use +blacklist and +unblacklist
        blacklistManager: "1335557128609599529",
        // Can view +vstats (Vouch Stats)
        statsAccess: "1335894966903504966"
    },

    // --- Staff Permissions Group ---
    // These roles are ignored by cooldowns and other restrictions
    staffRoles: [
        "1335633435460501617",
        "1335556994781679617",
        "1335557128609599529",
        "1335894966903504966"
    ],

    // --- Channel Restrictions ---
    // Channels where the bot will ignore prefix commands (except for redirects)
    restrictedChannels: [
        "1343309341637345341",
        "1343544300298043402",
        "1337443235332755458",
        "1337443272356008119",
        "1337339627543203840",
        "1336300255741874199"
    ],
    // The channel the bot tells users to use instead of restricted ones
    redirectChannel: "1343666329177292945",

    // --- Logging Channels ---
    logChannels: {
        // Where join/leave logs are sent
        guildLogs: "1343667014157336667"
    },

    // --- Role Verification ---
    verification: {
        // The role given when someone clicks the 'Verify' button
        roleId: "1328270519249797181"
    },

    // --- Vouching System ---
    vouching: {
        // The primary guild/server where vouch logs reside
        mainGuildId: "1333156680623591586",
        // Staff channel where NEW vouches appear for review
        submissionChannel: "1343296542752374926",
        // Staff channel where ACCEPTED vouches are logged
        acceptedChannel: "1343296572326416425",
        // Staff channel where DENIED vouches are logged
        deniedChannel: "1343296595105546340",
        // Channel where permanent DWC (Deal with Caution) messages are posted
        dwcPostChannel: "1343289418961780768"
    },

    // --- FAQ & Assistance channels ---
    faq: {
        // The channel for creating support tickets
        ticketsChannel: "1335499331708649472",
        // The channel for importing external vouches
        vouchesImportChannel: "1335499394232881192"
    },

    // --- Custom Emojis ---
    emojis: {
        // Success checkmark (custom ID)
        tick: "<:tick:1335642897156145202>",
        // Another success checkmark
        tickYes: "<:tickYes:1331105902677327915>",
        // Animated loading/processing circle
        loading: "<a:loading:1335233861214539847>",
        // Failure/Error icon
        cross: "❌",
        // Warning icon
        warning: "⚠️"
    },

    // --- Profile Badges ---
    badges: {
        v500: "<:starr5:1328650028570378250>",
        v250: "<:starr4:1328649972933066757>",
        v100: "<:starr3:1328649933674250292>",
        v50: "<:starr2:1328649996383424553>",
        top10: "<:2RedStar:1328649882134642821>",
        member: "<:cb_members:1328649837721161800>",
        booster: "<:booster:1328649755030716499>"
    }
};

/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */
