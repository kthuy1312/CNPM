
const CustomerService = require('../services/customerService');
const { sendJson, sendError } = require('../utils/http');

const customerService = new CustomerService();

async function listCustomers(req, res) {
    const customers = await customerService.listCustomers();
    sendJson(res, 200, { data: customers });
}

async function getCustomer(req, res) {
    const customer = await customerService.getCustomerById(req.params.id);
    if (!customer) {
        sendError(res, 404, 'Customer not found');
        return;
    }
    sendJson(res, 200, { data: customer });
}

async function createCustomer(req, res) {
    try {
        const customer = await customerService.createCustomer(req.body);
        sendJson(res, 201, { data: customer });
    } catch (error) {
        sendError(res, 400, error.message);
    }
}

async function updateCustomer(req, res) {
    try {
        const customer = await customerService.updateCustomer(req.params.id, req.body);
        if (!customer) {
            sendError(res, 404, 'Customer not found');
            return;
        }
        sendJson(res, 200, { data: customer });
    } catch (error) {
        sendError(res, 400, error.message);
    }
}

module.exports = {
    listCustomers,
    getCustomer,
    createCustomer,
    updateCustomer
};
