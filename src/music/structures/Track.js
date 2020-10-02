module.exports = class Track {
    constructor(options = {}) {
        this.title = options.title || "Unknown Title";
        this.author = options.author || "Unknown Artist";
        this.duration = options.duration;
        this.uri = options.uri;
        this.artwork = options.artwork;
        this.identifier = options.identifier || options.uri;
        this.isStream = options.isStream;
        this.track = Buffer.from(JSON.stringify(this)).toString('base64');
        this.requester = null
    };
    addRequester(requester) { this.requester = requester };
};