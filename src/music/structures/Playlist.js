module.exports = class Playlist {
    constructor({ title, author, uri, identifier }) {
        this.title = title;
        this.author = author;
        this.uri = uri;
        this.identifier = identifier;
    };
};