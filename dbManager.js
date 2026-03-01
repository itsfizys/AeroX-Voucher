/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */

const mongoose = require('mongoose');

const DbSchema = new mongoose.Schema({
    collectionName: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const DBModel = mongoose.model('KeyValStore', DbSchema);

class DBManager {
    constructor() {
        this.cache = {};
        this.syncing = false;
        this.saveQueue = new Set();
    }

    async init(uri) {
        if (!uri || uri.includes('admin:admin123')) {
            console.log(`\x1b[33m[ MONGO WARN ] Please replace the mongoURI in config.js with your actual details.\x1b[0m`);
            // Wait to allow local fallback logic 
        } else {
            try {
                mongoose.set('strictQuery', false);
                await mongoose.connect(uri);
                const collections = await DBModel.find();
                collections.forEach(doc => {
                    this.cache[doc.collectionName] = doc.data;
                });

                // Keep RAM completely synced with Mongo Atlas every 3s
                setInterval(() => this.processQueue(), 3000);
                console.log(`\x1b[32m[ MONGO SUCCESS ] Connected to MongoDB securely.\x1b[0m`);
                console.log(`\x1b[35m[ SYSTEM ] Preloaded ${collections.length} collections into RAM.\x1b[0m`);
            } catch (err) {
                console.error(`\x1b[31m[ MONGO FATAL ] Connection Error:\x1b[0m`, err.message);
            }
        }
    }

    get(collectionName) {
        // Return existing data, or determine type
        if (!this.cache[collectionName]) {
            // Arrays: vouches, blacklisted, scammers, dwc, manuals, buttons
            const isArray = ['badges', 'blacklisted', 'buttons', 'dwc', 'scammers', 'vouches', 'manuals', 'imported'].includes(collectionName);
            this.cache[collectionName] = isArray ? [] : {};
        }
        return this.cache[collectionName];
    }

    set(collectionName, data) {
        this.cache[collectionName] = data;
        // Schedule async mongodbsave
        this.saveQueue.add(collectionName);
    }

    async processQueue() {
        if (this.syncing || this.saveQueue.size === 0) return;
        this.syncing = true;

        const toSave = Array.from(this.saveQueue);
        this.saveQueue.clear();

        for (const name of toSave) {
            try {
                await DBModel.findOneAndUpdate(
                    { collectionName: name },
                    { data: this.cache[name] },
                    { upsert: true }
                );
            } catch (err) {
                console.error(`\x1b[31m[ MONGO ERROR ] Failed saving ${name}:\x1b[0m`, err.message);
                this.saveQueue.add(name);
            }
        }
        this.syncing = false;
    }
}

const dbManager = new DBManager();
module.exports = dbManager;


/*
 * Open Sourced by AeroX Development
 * Discord: https://discord.gg/aerox
 * Made from original source bot of FraudAlert
 * Modified by itsfizys
 */
