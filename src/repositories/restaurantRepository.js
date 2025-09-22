
const BaseRepository = require('./baseRepository');

class RestaurantRepository extends BaseRepository {
    constructor() {
        super('restaurants.json');
    }
}

module.exports = RestaurantRepository;

