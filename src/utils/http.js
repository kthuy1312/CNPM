
const { StringDecoder } = require('string_decoder');

const JSON_HEADERS = {
    'Content-Type': 'application/json; charset=utf-8'
};

async function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        const decoder = new StringDecoder('utf8');
        let buffer = '';

        req.on('data', (chunk) => {
            buffer = decoder.write(chunk);
            if (buffer.length > 1e6) {
                req.destroy();
                reject(new Error('Payload too large'));
            }
        });

        req.on('end', () => {
            buffer = decoder.end();
            if (!buffer) {
                resolve({});
                return;
            }

            try {
                const data = JSON.parse(buffer);
                resolve(data);
            } catch (error) {
                reject(new Error('Invalid JSON payload'));
            }
        });

        req.on('error', (error) => reject(error));
    });
}

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, JSON_HEADERS);
    res.end(JSON.stringify(payload));
}

function sendEmpty(res, statusCode = 204) {
    res.writeHead(statusCode, JSON_HEADERS);
    res.end();
}

function sendError(res, statusCode, message, details = undefined) {
    const payload = {
        error: message
    };

    if (details) {
        payload.details = details;
    }

    sendJson(res, statusCode, payload);
}

module.exports = {
    parseJsonBody,
    sendJson,
    sendEmpty,
    sendError
};
