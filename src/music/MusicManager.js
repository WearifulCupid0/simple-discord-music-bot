const Player = require("./structures/Player");
const Track = require("./structures/Track");
const { Collection } = require("discord.js");
const { EventEmitter } = require("events");
const chalk = require("chalk");
const ytsr = require("ytsr");
const ytpl = require("ytpl");
ytpl.do_warn_deprecate = false;
ytsr.do_warn_deprecate = false;
module.exports = class MusicManager extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this.players = new Collection();
        this.client.on('messageDelete', async(message) => {
            const player = this.players.get(message.guild.id);
            if(player && player.message && message.id === player.message.id) return player.sendMessage();
        }).on("voiceStateUpdate", async(oldState, newState) => {
            if(this.client.guilds.cache.get(oldState.guild.id).me.voice.channel && this.client.guilds.cache.get(oldState.guild.id).me.voice.channel.members.size<2){
                const player = this.players.get(oldState.guild.id);
                player.textChannel.send(`Saindo do canal de voz, motivo: Estou sozinho nele!`);
                this.delete(oldState.guild.id);
            } else if(!this.client.guilds.cache.get(oldState.guild.id).me.voice.channel && this.players.get(oldState.guild.id)){
                const player = this.players.get(oldState.guild.id);
                player.textChannel.send(`Fui kickado do canal de voz! Desligando player...`);
                console.log(`[${chalk.red("MUSIC")}] Um player foi deletado no servidor ${oldState.guild.name} (${oldState.guild.id})`);
                player.deleteMessage();
                this.players.delete(oldState.guild.id);
            };
        }).on("channelDelete", (channel) => {
            const player = this.players.get(channel.guild.id);
            if(!player) return;
            if(player.textChannel.id === channel.id) { player.allowSendMessage(false) };
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
                ytpl(playlistID).then(res => {
                    let data = [];
                    res.items.map(track => data.push(new Track({
                            title: track.title,
                            link: track.url,
                            duration: track.duration,
                            author: { name: track.author.name },
                            thumbnail: track.thumbnail,
                        }, requester, true)));
                    resolve(data)
                }).catch(err => reject(err));
            } else {
                ytsr(query).then(res => {
                    let data = [];
                    res = res.items.filter(a => a.type === "video");
                    res.map(track => data.push(new Track(track, requester, false)));
                    resolve(data);
                }).catch(err => reject(err))
            };
        });
    };
};
