const CustomerRepository = require('../repositories/customerRepository');

class CustomerService {
    constructor(repository = new CustomerRepository()) {
        this.repository = repository;
    }

    validatePayload(payload) {
        if (!payload.name || !payload.name.trim()) {
            throw new Error('Customer name is required');
        }
        if (!payload.email || !payload.email.trim()) {
            throw new Error('Customer email is required');
        }
        if (!payload.address || !payload.address.trim()) {
            throw new Error('Customer address is required');
        }
        if (!payload.phone || !payload.phone.trim()) {
            throw new Error('Customer phone is required');
        }
    }

    async createCustomer(payload) {
        this.validatePayload(payload);

        return this.repository.create({
            name: payload.name.trim(),
            email: payload.email.trim().toLowerCase(),
            address: payload.address.trim(),
            phone: payload.phone.trim(),
            preferredDropoff: payload.preferredDropoff ? payload.preferredDropoff.trim() : null
        });
    }

    async listCustomers() {
        return this.repository.findAll();
    }

    async getCustomerById(id) {
        return this.repository.findById(id);
    }

    async updateCustomer(id, payload) {
        const customer = await this.getCustomerById(id);
        if (!customer) {
            return null;
        }

        const updates = {};
        if (payload.name) {
            updates.name = payload.name.trim();
        }
        if (payload.email) {
            updates.email = payload.email.trim().toLowerCase();
        }
        if (payload.address) {
            updates.address = payload.address.trim();
        }
        if (payload.phone) {
            updates.phone = payload.phone.trim();
        }
        if (payload.preferredDropoff !== undefined) {
            updates.preferredDropoff = payload.preferredDropoff ? payload.preferredDropoff.trim() : null;
        }

        if (Object.keys(updates).length === 0) {
            return customer;
        }

        return this.repository.update(id, updates);
    }
}

module.exports = CustomerService;