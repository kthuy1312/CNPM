
const BaseRepository = require('./baseRepository');

class OrderRepository extends BaseRepository {
    constructor() {
        super('orders.json');
    }

    async findByStatus(status) {
        const orders = await this.findAll();
        return orders.filter((order) => order.status === status);
    }
}

module.exports = OrderRepository;

