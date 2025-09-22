
const http = require('http');
const Router = require('./routes/router');
const registerRoutes = require('./routes');
const { sendError } = require('./utils/http');

const router = new Router();
registerRoutes(router);

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        await router.handle(req, res);
    } catch (error) {
        console.error('Unhandled server error', error);
        sendError(res, 500, 'Internal server error');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`FoodFast backend listening on port ${PORT}`);
});

module.exports = server;
