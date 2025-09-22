
const { OrderService, ORDER_STATUSES } = require('../services/orderService');
const { sendJson, sendError } = require('../utils/http');

const orderService = new OrderService();

async function listOrders(req, res) {
    const filter = {};
    if (req.query.status) {
        filter.status = req.query.status;
    }
    if (req.query.customerId) {
        filter.customerId = req.query.customerId;
    }

    try {
        const orders = await orderService.listOrders(filter);
        sendJson(res, 200, { data: orders });
    } catch (error) {
        sendError(res, 400, error.message);
    }
}

async function getOrder(req, res) {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
        sendError(res, 404, 'Order not found');
        return;
    }
    sendJson(res, 200, { data: order });
}

async function createOrder(req, res) {
    try {
        const order = await orderService.createOrder(req.body);
        sendJson(res, 201, { data: order });
    } catch (error) {
        sendError(res, 400, error.message);
    }
}

async function updateOrderStatus(req, res) {
    const status = req.body.status;
    if (!status) {
        sendError(res, 400, `Missing status. Allowed statuses: ${ORDER_STATUSES.join(', ')}`);
        return;
    }

    try {
        const order = await orderService.updateOrderStatus(req.params.id, status);
        if (!order) {
            sendError(res, 404, 'Order not found');
            return;
        }
        sendJson(res, 200, { data: order });
    } catch (error) {
        sendError(res, 400, error.message);
    }
}

async function assignDrone(req, res) {
    const { droneId } = req.body;
    if (!droneId) {
        sendError(res, 400, 'Missing droneId');
        return;
    }

    try {
        const order = await orderService.assignDrone(req.params.id, droneId);
        if (!order) {
            sendError(res, 404, 'Order not found');
            return;
        }
        sendJson(res, 200, { data: order });
    } catch (error) {
        sendError(res, 400, error.message);
    }
}

async function cancelOrder(req, res) {
    const order = await orderService.cancelOrder(req.params.id);
    if (!order) {
        sendError(res, 404, 'Order not found');
        return;
    }
    sendJson(res, 200, { data: order, message: 'Order cancelled successfully' });
}

async function getSummary(req, res) {
    const summary = await orderService.getOperationalSummary();
    sendJson(res, 200, { data: summary });
}

module.exports = {
    listOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    assignDrone,
    cancelOrder,
    getSummary
};
