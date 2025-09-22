
const DroneRepository = require('../repositories/droneRepository');

const VALID_STATUSES = ['available', 'delivering', 'charging', 'maintenance'];

class DroneService {
    constructor(repository = new DroneRepository()) {
        this.repository = repository;
    }

    validatePayload(payload) {
        if (!payload.identifier || !payload.identifier.trim()) {
            throw new Error('Drone identifier is required');
        }
        const maxPayload = Number(payload.maxPayloadKg);
        if (Number.isNaN(maxPayload) || maxPayload <= 0) {
            throw new Error('Maximum payload must be a positive number');
        }
        if (!payload.homeBase || !payload.homeBase.trim()) {
            throw new Error('Home base is required');
        }
    }

    normalizeStatus(status) {
        if (!status) {
            return 'available';
        }
        const normalized = status.toLowerCase();
        if (!VALID_STATUSES.includes(normalized)) {
            throw new Error(`Invalid drone status. Allowed: ${VALID_STATUSES.join(', ')}`);
        }
        return normalized;
    }

    async registerDrone(payload) {
        this.validatePayload(payload);
        const status = this.normalizeStatus(payload.status || 'available');

        return this.repository.create({
            identifier: payload.identifier.trim(),
            status,
            maxPayloadKg: Number(payload.maxPayloadKg),
            batteryLevel: payload.batteryLevel !== undefined ? Number(payload.batteryLevel) : 100,
            homeBase: payload.homeBase.trim(),
            currentLocation: payload.currentLocation ? payload.currentLocation.trim() : payload.homeBase.trim(),
            lastMaintenance: payload.lastMaintenance || new Date().toISOString()
        });
    }

    async listDrones() {
        return this.repository.findAll();
    }

    async getDroneById(id) {
        return this.repository.findById(id);
    }

    async updateDrone(id, payload) {
        const drone = await this.getDroneById(id);
        if (!drone) {
            return null;
        }

        const updates = {};
        if (payload.identifier) {
            updates.identifier = payload.identifier.trim();
        }
        if (payload.maxPayloadKg !== undefined) {
            const maxPayload = Number(payload.maxPayloadKg);
            if (Number.isNaN(maxPayload) || maxPayload <= 0) {
                throw new Error('Maximum payload must be a positive number');
            }
            updates.maxPayloadKg = maxPayload;
        }
        if (payload.batteryLevel !== undefined) {
            const battery = Number(payload.batteryLevel);
            if (Number.isNaN(battery) || battery < 0 || battery > 100) {
                throw new Error('Battery level must be between 0 and 100');
            }
            updates.batteryLevel = battery;
        }
        if (payload.status) {
            updates.status = this.normalizeStatus(payload.status);
        }
        if (payload.currentLocation) {
            updates.currentLocation = payload.currentLocation.trim();
        }
        if (payload.homeBase) {
            updates.homeBase = payload.homeBase.trim();
        }
        if (payload.lastMaintenance) {
            updates.lastMaintenance = payload.lastMaintenance;
        }

        if (Object.keys(updates).length === 0) {
            return drone;
        }

        return this.repository.update(id, updates);
    }

    async setDroneStatus(id, status) {
        const drone = await this.getDroneById(id);
        if (!drone) {
            return null;
        }
        const normalized = this.normalizeStatus(status);
        return this.repository.update(id, { status: normalized });
    }
}

module.exports = { DroneService, VALID_STATUSES };