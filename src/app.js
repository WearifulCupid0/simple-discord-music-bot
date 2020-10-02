const express = require("express");
const app = express();
const http = require("http");
module.exports = class App {
    constructor(client) {
        this.client = client;
        app.use("/queue/:guildId", (req, res, next) => {
            if(req.query.password !== this.client.config.httpPassword) return res.sendStatus(401)
            const guildID = req.params.guildId;
            this.queue(req, res, next, guildID);
        });
        app.use("/player/:guildId", (req, res, next) => {
            if(req.query.password !== this.client.config.httpPassword) return res.sendStatus(401)
            const guildID = req.params.guildId;
            this.player(req, res, next, guildID);
        });
    };
    async init() {
        const server = http.createServer(app);
        server.listen(this.client.httpPort);
    };
    async player(req, res, next, guildID) {
        const player = this.client.music.players.get(guildID);
        if(!player) return res.send({message: "Nenhum player encontrado nesse servidor!", code: 404});
        else res.status(200).send({
            player: {
                volume: player.volume,
                queueRepeat: player.queueRepeat,
                trackRepeat: player.trackRepeat,
                playing: player.playing,
                paused: player.paused,
                voiceChannel: player.voiceChannel.id,
                textChannel: player.textChannel.id,
            },
        });
    };
    async queue(req, res, next, guildID) {
        const player = this.client.music.players.get(guildID);
        if(!player) return res.send({message: "Nenhuma fila de músicas encontrada nesse servidor!", code: 404})
        else {
            let queue = [];
            player.queue.map(track => queue.push({
                title: track.title,
                uri: track.uri,
                duration: track.duration,
                author: track.author,
                artwork: track.artwork,
                requesterID: track.requester.id,
            }));
            return res.status(200).send(queue)
        };
    };
};