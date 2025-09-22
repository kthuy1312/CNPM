
const MenuRepository = require('../repositories/menuRepository');
const RestaurantService = require('./restaurantService');

class MenuService {
    constructor(menuRepository = new MenuRepository(), restaurantService = new RestaurantService()) {
        this.menuRepository = menuRepository;
        this.restaurantService = restaurantService;
    }

    async listMenu(restaurantId) {
        const restaurant = await this.restaurantService.getRestaurantById(restaurantId);
        if (!restaurant) {
            throw new Error('Restaurant not found');
        }
        return this.menuRepository.findByRestaurantId(restaurantId);
    }

    validateMenuPayload(payload) {
        if (!payload.name || !payload.name.trim()) {
            throw new Error('Menu item name is required');
        }
        const price = Number(payload.price);
        if (Number.isNaN(price) || price <= 0) {
            throw new Error('Menu item price must be a positive number');
        }
        const preparationTime = payload.preparationTime ? Number(payload.preparationTime) : null;
        if (preparationTime !== null && (Number.isNaN(preparationTime) || preparationTime < 0)) {
            throw new Error('Preparation time must be a positive number');
        }
    }

    async addMenuItem(restaurantId, payload) {
        await this.listMenu(restaurantId); // ensures restaurant exists
        this.validateMenuPayload(payload);

        return this.menuRepository.create({
            restaurantId,
            name: payload.name.trim(),
            description: payload.description ? payload.description.trim() : '',
            price: Number(payload.price),
            isAvailable: payload.isAvailable !== undefined ? Boolean(payload.isAvailable) : true,
            preparationTime: payload.preparationTime ? Number(payload.preparationTime) : null,
            tags: Array.isArray(payload.tags) ? payload.tags.map((tag) => String(tag)) : []
        });
    }

    async updateMenuItem(restaurantId, menuItemId, payload) {
        const menuItems = await this.menuRepository.findByRestaurantId(restaurantId);
        const menuItem = menuItems.find((item) => item.id === menuItemId);

        if (!menuItem) {
            return null;
        }

        const updates = {};

        if (payload.name) {
            updates.name = payload.name.trim();
        }
        if (payload.description !== undefined) {
            updates.description = payload.description ? payload.description.trim() : '';
        }
        if (payload.price !== undefined) {
            const price = Number(payload.price);
            if (Number.isNaN(price) || price <= 0) {
                throw new Error('Menu item price must be a positive number');
            }
            updates.price = price;
        }
        if (payload.isAvailable !== undefined) {
            updates.isAvailable = Boolean(payload.isAvailable);
        }
        if (payload.preparationTime !== undefined) {
            const preparationTime = Number(payload.preparationTime);
            if (Number.isNaN(preparationTime) || preparationTime < 0) {
                throw new Error('Preparation time must be a positive number');
            }
            updates.preparationTime = preparationTime;
        }
        if (payload.tags !== undefined) {
            updates.tags = Array.isArray(payload.tags) ? payload.tags.map((tag) => String(tag)) : [];
        }

        return this.menuRepository.update(menuItemId, updates);
    }

    async removeMenuItem(restaurantId, menuItemId) {
        const menuItems = await this.menuRepository.findByRestaurantId(restaurantId);
        const menuItem = menuItems.find((item) => item.id === menuItemId);
        if (!menuItem) {
            return false;
        }
        return this.menuRepository.delete(menuItemId);
    }
}

module.exports = MenuService;