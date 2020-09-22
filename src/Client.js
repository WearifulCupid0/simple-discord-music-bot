const { Client, Collection } = require("discord.js");
const chalk = require("chalk");
const App = require("./app");
const fs = require("fs");
const MusicManager = require("./music/MusicManager");
const config = require("../config.json");
module.exports = class extends Client {
    constructor(options = {}) {
        super(options);
        this.config = config;
        this.commands = new Collection();
        this.aliases = new Collection();
        this.cooldowns = new Collection();
        this.httpPort = process.env.PORT || 3000;;
        this.music = null;
        this.on('ready', () => {
            this.music = new MusicManager(this);
            console.log(`[${chalk.magenta("BOT")}] Estou online em ${this.guilds.cache.size} servidores com ${this.users.cache.size} usuários!`);
            let index = 0;
            setInterval(async() => {
                let activities = [
                    { name: `${this.guilds.cache.size} servidores.`, type: 0 },
                    { name: `${this.music.players.size} players.`, type: 0 },
                    { name: `${this.guilds.cache.size} usuários.`, type: 0 },
                    { name: `${this.commands.size} comandos.`, type: 0 }
                ];
                let activitie = activities[index++ % activities.length];
                this.user.setPresence({ activity: { name: activitie.name, type: activitie.type } });
            }, 30000);
        });
        this.on("message", async(message) => {
            if(message.author.bot || message.channel.type === "dm") return;
            if(!message.content.startsWith(this.config.prefix)) return;

            const args = message.content.slice(this.config.prefix.length).trim().split(/ +/g);
            const command = args.shift().toLowerCase();

            const cmd = this.commands.get(command) || this.commands.get(this.aliases.get(command));
            if(cmd) {
                const now = Date.now();
                const timestamps = this.cooldowns.get(cmd.config.name);
                const cooldownAmount = (cmd.config.cooldown || 3) * 1000;
                if (timestamps.has(message.author.id)) {
                    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                    if (now < expirationTime) {
                        const timeLeft = (expirationTime - now) / 1000;
                        return message.channel.send(`Você precisa esperar mais \`${timeLeft.toFixed(1)}\` segundos para executar esse comando!`);
                    };
                };
                timestamps.set(message.author.id, now);
                setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
                try {
                    cmd.run(this, message, args);
                } catch(e) {
                    console.log(e);
                    return message.channel.send(`Um erro aconteceu ao executar o comando \`${cmd.config.name}\`!`);
                };
            };
        });
    };
    async init() {
        fs.readdir("./src/commands", (err, files) => {
            if(err) return console.log(err);
            files.filter(a => a.split(".").pop() === "js");
            files.forEach(file => {
                const pull = require(`./commands/${file}`);
                console.log(`[${chalk.blue("COMMAND")}] Comando ${pull.config.name} carregado!`);
                this.cooldowns.set(pull.config.name, new Collection());
                this.commands.set(pull.config.name, pull);
                if(pull.config.aliases) pull.config.aliases.map(a => this.aliases.set(a, pull.config.name));
            });
        });
        this.login(this.config.token).then(() => {
            const server = new App(this);
            server.init();
            console.log(`[${chalk.red("SYSTEM")}] Sucesso ao logar no Discord, e o servidor HTTP foi iniciado na porta ${this.httpPort}!`);
        });
    };
};
