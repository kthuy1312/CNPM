
const RestaurantService = require('../services/restaurantService');
const MenuService = require('../services/menuService');
const { sendJson, sendError } = require('../utils/http');

const restaurantService = new RestaurantService();
const menuService = new MenuService();

async function listRestaurants(req, res) {
    const restaurants = await restaurantService.listRestaurants();
    sendJson(res, 200, { data: restaurants });
}

async function getRestaurant(req, res) {
    const restaurant = await restaurantService.getRestaurantById(req.params.id);
    if (!restaurant) {
        sendError(res, 404, 'Restaurant not found');
        return;
    }
    sendJson(res, 200, { data: restaurant });
}

async function createRestaurant(req, res) {
    try {
        const restaurant = await restaurantService.createRestaurant(req.body);
        sendJson(res, 201, { data: restaurant });
    } catch (error) {
        sendError(res, 400, error.message);
    }
}

async function updateRestaurant(req, res) {
    try {
        const restaurant = await restaurantService.updateRestaurant(req.params.id, req.body);
        if (!restaurant) {
            sendError(res, 404, 'Restaurant not found');
            return;
        }
        sendJson(res, 200, { data: restaurant });
    } catch (error) {
        sendError(res, 400, error.message);
    }
}

async function deleteRestaurant(req, res) {
    const deleted = await restaurantService.deleteRestaurant(req.params.id);
    if (!deleted) {
        sendError(res, 404, 'Restaurant not found');
        return;
    }
    sendJson(res, 200, { message: 'Restaurant removed successfully' });
}

async function listMenu(req, res) {
    try {
        const menuItems = await menuService.listMenu(req.params.id);
        sendJson(res, 200, { data: menuItems });
    } catch (error) {
        sendError(res, 404, error.message);
    }
}

async function addMenuItem(req, res) {
    try {
        const menuItem = await menuService.addMenuItem(req.params.id, req.body);
        sendJson(res, 201, { data: menuItem });
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 400;
        sendError(res, status, error.message);
    }
}

async function updateMenuItem(req, res) {
    try {
        const menuItem = await menuService.updateMenuItem(req.params.id, req.params.menuItemId, req.body);
        if (!menuItem) {
            sendError(res, 404, 'Menu item not found');
            return;
        }
        sendJson(res, 200, { data: menuItem });
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 400;
        sendError(res, status, error.message);
    }
}

async function deleteMenuItem(req, res) {
    const removed = await menuService.removeMenuItem(req.params.id, req.params.menuItemId);
    if (!removed) {
        sendError(res, 404, 'Menu item not found');
        return;
    }
    sendJson(res, 200, { message: 'Menu item removed successfully' });
}

module.exports = {
    listRestaurants,
    getRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    listMenu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem
};
