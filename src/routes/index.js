
const restaurantController = require('../controllers/restaurantController');
const customerController = require('../controllers/customerController');
const droneController = require('../controllers/droneController');
const orderController = require('../controllers/orderController');
const { sendJson } = require('../utils/http');

function registerRoutes(router) {
    router.get('/', (req, res) => {
        sendJson(res, 200, {
            service: 'FoodFast API',
            version: '1.0.0',
            message: 'Welcome to FoodFast drone delivery platform'
        });
    });

    router.get('/api/v1/health', (req, res) => {
        sendJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
    });

    router.get('/api/v1/restaurants', restaurantController.listRestaurants);
    router.post('/api/v1/restaurants', restaurantController.createRestaurant);
    router.get('/api/v1/restaurants/:id', restaurantController.getRestaurant);
    router.put('/api/v1/restaurants/:id', restaurantController.updateRestaurant);
    router.delete('/api/v1/restaurants/:id', restaurantController.deleteRestaurant);

    router.get('/api/v1/restaurants/:id/menu', restaurantController.listMenu);
    router.post('/api/v1/restaurants/:id/menu', restaurantController.addMenuItem);
    router.put('/api/v1/restaurants/:id/menu/:menuItemId', restaurantController.updateMenuItem);
    router.delete('/api/v1/restaurants/:id/menu/:menuItemId', restaurantController.deleteMenuItem);

    router.get('/api/v1/customers', customerController.listCustomers);
    router.post('/api/v1/customers', customerController.createCustomer);
    router.get('/api/v1/customers/:id', customerController.getCustomer);
    router.put('/api/v1/customers/:id', customerController.updateCustomer);

    router.get('/api/v1/drones', droneController.listDrones);
    router.post('/api/v1/drones', droneController.createDrone);
    router.get('/api/v1/drones/:id', droneController.getDrone);
    router.put('/api/v1/drones/:id', droneController.updateDrone);
    router.patch('/api/v1/drones/:id/status', droneController.updateDroneStatus);

    router.get('/api/v1/orders', orderController.listOrders);
    router.post('/api/v1/orders', orderController.createOrder);
    router.get('/api/v1/orders/summary', orderController.getSummary);
    router.get('/api/v1/orders/:id', orderController.getOrder);
    router.put('/api/v1/orders/:id/status', orderController.updateOrderStatus);
    router.post('/api/v1/orders/:id/assign-drone', orderController.assignDrone);
    router.post('/api/v1/orders/:id/cancel', orderController.cancelOrder);
}

module.exports = registerRoutes;
