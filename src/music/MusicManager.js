const Player = require("./structures/Player");
const Track = require("./structures/Track");
const { Collection } = require("discord.js");
const chalk = require("chalk");
const ytsr = require("ytsr");
const ytpl = require("ytpl");
ytpl.do_warn_deprecate = false;
ytsr.do_warn_deprecate = false;
module.exports = class MusicManager {
    constructor(client) {
        this.client = client;
        this.players = new Collection();
        this.client.on('messageDelete', async(message) => {
            const player = this.players.get(message.guild.id);
            if(player && player.message && message.id === player.message.id) return this.sendMessage();
        });
    };
    async spawn(voiceChannel, textChannel, guild) {
        const connection = await this.client.channels.cache.get(voiceChannel.id).join();
        const voice = this.client.guilds.cache.get(guild.id).me.voice;
        voice.setSelfDeaf(this.client.config.entryConfig.selfdeaf || false);
        voice.setSelfMute(this.client.config.entryConfig.selfmute || false);
        const player = new Player(this.client, connection, voiceChannel, textChannel, guild);
        this.players.set(guild.id, player);
        console.log(`[${chalk.red("MUSIC")}] Um player foi criado no servidor ${guild.name} (${guild.id})`);
        return player;
    };
    async delete(guildID) {
        const player = this.players.get(guildID);
        if(!player) return false;
        const guild = this.client.guilds.cache.get(guildID)
        console.log(`[${chalk.red("MUSIC")}] Um player foi deletado no servidor ${guild.name} (${guild.id})`);
        this.client.guilds.cache.get(guildID).me.voice.channel.leave();
        return this.players.delete(guildID);
    };
    async search(query, requester) {
        return new Promise(async(resolve, reject) => {
            if(ytpl.validateURL(query)) {
                const playlistID = await ytpl.getPlaylistID(query);
                ytpl(playlistID, (error, results) => {
                    if(error) {
                        reject(error);
                    } else {
                        let data = [];
                        results.items.map(track => data.push(new Track({
                            title: track.title,
                            link: track.url,
                            duration: track.duration,
                            author: { name: track.author.name },
                            thumbnail: track.thumbnail,
                        }, requester, true)));
                        resolve(data);
                    };
                });
            } else {
                ytsr(query, (error, results) => {
                    if(error) {
                        reject(error);
                    } else {
                    let data = [];
                    let res = results.items.filter(a => a.type === "video");
                    res.map(track => data.push(new Track(track, requester, false)));
                    resolve(data);
                    };
                });
            };
        });
    };
};