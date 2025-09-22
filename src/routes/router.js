
const { parse } = require('url');
const { parseJsonBody, sendError } = require('../utils/http');

class Router {
    constructor() {
        this.routes = [];
    }

    register(method, path, handler) {
        const normalizedPath = path.replace(/\/$/g, '');
        const segments = normalizedPath.split('/').filter(Boolean);
        this.routes.push({
            method: method.toUpperCase(),
            path,
            segments,
            handler
        });
    }

    get(path, handler) {
        this.register('GET', path, handler);
    }

    post(path, handler) {
        this.register('POST', path, handler);
    }

    put(path, handler) {
        this.register('PUT', path, handler);
    }

    patch(path, handler) {
        this.register('PATCH', path, handler);
    }

    delete(path, handler) {
        this.register('DELETE', path, handler);
    }

    match(method, pathname) {
        const normalizedPath = pathname.replace(/\/$/g, '');
        const urlSegments = normalizedPath.split('/').filter(Boolean);

        for (const route of this.routes) {
            if (route.method !== method.toUpperCase()) {
                continue;
            }

            if (route.segments.length !== urlSegments.length) {
                continue;
            }

            const params = {};
            let isMatch = true;

            for (let i = 0; i < route.segments.length; i = 1) {
                const routeSegment = route.segments[i];
                const urlSegment = urlSegments[i];

                if (routeSegment.startsWith(':')) {
                    const paramName = routeSegment.slice(1);
                    params[paramName] = decodeURIComponent(urlSegment);
                } else if (routeSegment !== urlSegment) {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) {
                return { route, params };
            }
        }

        return null;
    }

    async handle(req, res) {
        const { pathname, query } = parse(req.url, true);
        const match = this.match(req.method, pathname);

        if (!match) {
            sendError(res, 404, 'Resource not found');
            return;
        }

        req.params = match.params;
        req.query = query;

        if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
            try {
                req.body = await parseJsonBody(req);
            } catch (error) {
                sendError(res, 400, error.message);
                return;
            }
        } else {
            req.body = {};
        }

        try {
            await match.route.handler(req, res);
        } catch (error) {
            console.error('Unexpected error handling request', error);
            sendError(res, 500, 'Internal server error');
        }
    }
}

module.exports = Router;

