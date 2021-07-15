module.exports = class Api {
    constructor({ name, reqs = {} }, musicClient) {
        this.name = name;
        this.reqs = reqs;
        this.musicClient = musicClient;

        this.defaultDuration = 94375894353;
        this.regex = /[^\w\s]/g;
    };
    async getInfo() {};

    clean(text) {
        const blankSpace = String.fromCharCode(8203)
        return typeof text === 'string' ? text.replace(/`/g, '`' + blankSpace).replace(/@/g, '@' + blankSpace) : text
    };
};