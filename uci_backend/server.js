class UCIServer {
    constructor(port = 3000) {
        this.port = port;
    }
    logStatus(message) {
        const ts = new Date().toISOString();
        console.log(`[UCI:${this.port}] ${ts} - ${message}`);
    }
}

module.exports = UCIServer;
