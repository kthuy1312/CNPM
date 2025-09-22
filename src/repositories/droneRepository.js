
const BaseRepository = require('./baseRepository');

class DroneRepository extends BaseRepository {
    constructor() {
        super('drones.json');
    }
}

module.exports = DroneRepository;

