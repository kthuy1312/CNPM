
const BaseRepository = require('./baseRepository');

class MenuRepository extends BaseRepository {
    constructor() {
        super('menuItems.json');
    }

    async findByRestaurantId(restaurantId) {
        const items = await this.findAll();
        return items.filter((item) => item.restaurantId === restaurantId);
    }
}

module.exports = MenuRepository;
