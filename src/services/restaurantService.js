
const RestaurantRepository = require('../repositories/restaurantRepository');

class RestaurantService {
    constructor(repository = new RestaurantRepository()) {
        this.repository = repository;
    }

    async listRestaurants() {
        return this.repository.findAll();
    }

    async getRestaurantById(id) {
        return this.repository.findById(id);
    }

    validatePayload(payload) {
        const { name, address, cuisine, contactPhone } = payload;
        if (!name || !name.trim()) {
            throw new Error('Restaurant name is required');
        }
        if (!address || !address.trim()) {
            throw new Error('Restaurant address is required');
        }
        if (!cuisine || !cuisine.trim()) {
            throw new Error('Cuisine type is required');
        }
        if (!contactPhone || !contactPhone.trim()) {
            throw new Error('Contact phone is required');
        }
    }

    async createRestaurant(payload) {
        this.validatePayload(payload);
        return this.repository.create({
            name: payload.name.trim(),
            address: payload.address.trim(),
            cuisine: payload.cuisine.trim(),
            contactPhone: payload.contactPhone.trim(),
            contactEmail: payload.contactEmail ? payload.contactEmail.trim() : undefined,
            description: payload.description ? payload.description.trim() : '',
            rating: payload.rating ? Number(payload.rating) : null
        });
    }

    async updateRestaurant(id, payload) {
        const restaurant = await this.getRestaurantById(id);
        if (!restaurant) {
            return null;
        }

        const updates = {};
        if (payload.name) {
            updates.name = payload.name.trim();
        }
        if (payload.address) {
            updates.address = payload.address.trim();
        }
        if (payload.cuisine) {
            updates.cuisine = payload.cuisine.trim();
        }
        if (payload.contactPhone) {
            updates.contactPhone = payload.contactPhone.trim();
        }
        if (payload.contactEmail !== undefined) {
            updates.contactEmail = payload.contactEmail ? payload.contactEmail.trim() : '';
        }
        if (payload.description !== undefined) {
            updates.description = payload.description;
        }
        if (payload.rating !== undefined) {
            const rating = Number(payload.rating);
            if (Number.isNaN(rating) || rating < 0 || rating > 5) {
                throw new Error('Rating must be between 0 and 5');
            }
            updates.rating = rating;
        }

        if (Object.keys(updates).length === 0) {
            return restaurant;
        }

        return this.repository.update(id, updates);
    }

    async deleteRestaurant(id) {
        return this.repository.delete(id);
    }
}

module.exports = RestaurantService;
