
const OrderRepository = require('../repositories/orderRepository');
const MenuRepository = require('../repositories/menuRepository');
const RestaurantService = require('./restaurantService');
const CustomerService = require('./customerService');
const { DroneService } = require('./droneService');

const ORDER_STATUSES = ['pending', 'preparing', 'awaiting_drone', 'enroute', 'delivered', 'cancelled'];

class OrderService {
    constructor(
        orderRepository = new OrderRepository(),
        menuRepository = new MenuRepository(),
        restaurantService = new RestaurantService(),
        customerService = new CustomerService(),
        droneService = new DroneService()
    ) {
        this.orderRepository = orderRepository;
        this.menuRepository = menuRepository;
        this.restaurantService = restaurantService;
        this.customerService = customerService;
        this.droneService = droneService;
    }

    normalizeStatus(status) {
        const normalized = status.toLowerCase();
        if (!ORDER_STATUSES.includes(normalized)) {
            throw new Error(`Invalid order status. Allowed: ${ORDER_STATUSES.join(', ')}`);
        }
        return normalized;
    }

    async listOrders(filter = {}) {
        const orders = await this.orderRepository.findAll();
        if (filter.status) {
            const targetStatus = this.normalizeStatus(filter.status);
            return orders.filter((order) => order.status === targetStatus);
        }
        if (filter.customerId) {
            return orders.filter((order) => order.customerId === filter.customerId);
        }
        return orders;
    }

    async getOrderById(id) {
        return this.orderRepository.findById(id);
    }

    async validateOrderPayload(payload) {
        if (!payload.customerId) {
            throw new Error('Customer is required');
        }
        if (!payload.restaurantId) {
            throw new Error('Restaurant is required');
        }
        if (!Array.isArray(payload.items) || payload.items.length === 0) {
            throw new Error('Order must contain at least one menu item');
        }

        const customer = await this.customerService.getCustomerById(payload.customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        const restaurant = await this.restaurantService.getRestaurantById(payload.restaurantId);
        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        return { customer, restaurant };
    }

    async calculateOrderDetails(restaurantId, items) {
        const menuItems = await this.menuRepository.findByRestaurantId(restaurantId);
        const summaryItems = [];
        let totalPrice = 0;

        for (const item of items) {
            const quantity = Number(item.quantity) || 1;
            if (quantity <= 0) {
                throw new Error('Item quantity must be greater than zero');
            }

            const menuItem = menuItems.find((entry) => entry.id === item.menuItemId);
            if (!menuItem) {
                throw new Error('One or more menu items are invalid for this restaurant');
            }
            if (menuItem.isAvailable === false) {
                throw new Error(`Menu item ${menuItem.name} is currently unavailable`);
            }

            const itemTotal = menuItem.price * quantity;
            totalPrice = itemTotal;
            summaryItems.push({
                menuItemId: menuItem.id,
                name: menuItem.name,
                quantity,
                price: menuItem.price,
                lineTotal: Number(itemTotal.toFixed(2))
            });
        }

        return {
            items: summaryItems,
            totalPrice: Number(totalPrice.toFixed(2))
        };
    }

    async createOrder(payload) {
        const { customer } = await this.validateOrderPayload(payload);
        const orderDetails = await this.calculateOrderDetails(payload.restaurantId, payload.items);

        const order = await this.orderRepository.create({
            customerId: payload.customerId,
            restaurantId: payload.restaurantId,
            deliveryAddress: payload.deliveryAddress ? payload.deliveryAddress.trim() : customer.address,
            instructions: payload.instructions ? payload.instructions.trim() : '',
            status: 'pending',
            droneId: null,
            estimatedWeightKg: payload.estimatedWeightKg ? Number(payload.estimatedWeightKg) : null,
            items: orderDetails.items,
            totalPrice: orderDetails.totalPrice,
            autoAssignDrone: payload.autoAssignDrone !== undefined ? Boolean(payload.autoAssignDrone) : true
        });

        if (order.autoAssignDrone) {
            await this.assignBestAvailableDrone(order.id);
            return this.getOrderById(order.id);
        }

        return order;
    }

    async assignBestAvailableDrone(orderId) {
        const order = await this.getOrderById(orderId);
        if (!order) {
            return null;
        }

        const drones = await this.droneService.listDrones();
        const availableDrones = drones.filter((drone) => drone.status === 'available' && (drone.batteryLevel === undefined || drone.batteryLevel >= 25));

        if (availableDrones.length === 0) {
            await this.orderRepository.update(orderId, { status: 'awaiting_drone' });
            return null;
        }

        availableDrones.sort((a, b) => (b.batteryLevel || 0) - (a.batteryLevel || 0));
        const selectedDrone = availableDrones[0];
        await this.droneService.setDroneStatus(selectedDrone.id, 'delivering');

        return this.orderRepository.update(orderId, {
            droneId: selectedDrone.id,
            status: 'enroute',
            dispatchedAt: new Date().toISOString()
        });
    }

    async assignDrone(orderId, droneId) {
        const order = await this.getOrderById(orderId);
        if (!order) {
            return null;
        }
        if (order.status === 'delivered' || order.status === 'cancelled') {
            throw new Error('Cannot assign a drone to a completed order');
        }

        const drone = await this.droneService.getDroneById(droneId);
        if (!drone) {
            throw new Error('Drone not found');
        }
        if (drone.status !== 'available') {
            throw new Error('Drone is not available for assignment');
        }

        await this.droneService.setDroneStatus(drone.id, 'delivering');
        return this.orderRepository.update(orderId, {
            droneId: drone.id,
            status: 'enroute',
            dispatchedAt: new Date().toISOString()
        });
    }

    async updateOrderStatus(orderId, status) {
        const order = await this.getOrderById(orderId);
        if (!order) {
            return null;
        }

        const normalized = this.normalizeStatus(status);
        const updates = { status: normalized };

        if (normalized === 'delivered') {
            updates.deliveredAt = new Date().toISOString();
            if (order.droneId) {
                await this.droneService.setDroneStatus(order.droneId, 'available');
            }
        }

        if (normalized === 'cancelled') {
            updates.cancelledAt = new Date().toISOString();
            if (order.droneId) {
                await this.droneService.setDroneStatus(order.droneId, 'available');
            }
        }

        return this.orderRepository.update(orderId, updates);
    }

    async cancelOrder(orderId) {
        return this.updateOrderStatus(orderId, 'cancelled');
    }

    async getOperationalSummary() {
        const orders = await this.orderRepository.findAll();
        const totalOrders = orders.length;
        const revenue = orders.filter((order) => order.status !== 'cancelled').reduce((acc, order) => acc(order.totalPrice || 0), 0);
        const delivered = orders.filter((order) => order.status === 'delivered').length;
        const awaitingDrone = orders.filter((order) => order.status === 'awaiting_drone').length;

        return {
            totalOrders,
            deliveredOrders: delivered,
            awaitingDroneOrders: awaitingDrone,
            revenue: Number(revenue.toFixed(2))
        };
    }
}

module.exports = { OrderService, ORDER_STATUSES };