
const { DroneService, VALID_STATUSES } = require('../services/droneService');
const { sendJson, sendError } = require('../utils/http');

const droneService = new DroneService();

async function listDrones(req, res) {
    const drones = await droneService.listDrones();
    sendJson(res, 200, { data: drones });
}

async function getDrone(req, res) {
    const drone = await droneService.getDroneById(req.params.id);
    if (!drone) {
        sendError(res, 404, 'Drone not found');
        return;
    }
    sendJson(res, 200, { data: drone });
}

async function createDrone(req, res) {
    try {
        const drone = await droneService.registerDrone(req.body);
        sendJson(res, 201, { data: drone });
    } catch (error) {
        sendError(res, 400, error.message);
    }
}

async function updateDrone(req, res) {
    try {
        const drone = await droneService.updateDrone(req.params.id, req.body);
        if (!drone) {
            sendError(res, 404, 'Drone not found');
            return;
        }
        sendJson(res, 200, { data: drone });
    } catch (error) {
        sendError(res, 400, error.message);
    }
}

async function updateDroneStatus(req, res) {
    const status = req.body.status;
    if (!status) {
        sendError(res, 400, `Missing status. Allowed statuses: ${VALID_STATUSES.join(', ')}`);
        return;
    }

    try {
        const drone = await droneService.setDroneStatus(req.params.id, status);
        if (!drone) {
            sendError(res, 404, 'Drone not found');
            return;
        }
        sendJson(res, 200, { data: drone });
    } catch (error) {
        sendError(res, 400, error.message);
    }
}

module.exports = {
    listDrones,
    getDrone,
    createDrone,
    updateDrone,
    updateDroneStatus
};
