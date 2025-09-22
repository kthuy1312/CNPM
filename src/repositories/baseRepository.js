
const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

class BaseRepository {
    constructor(fileName) {
        this.filePath = path.join(__dirname, '../../data', fileName);
    }

    async ensureFile() {
        try {
            await fs.access(this.filePath);
        } catch (error) {
            await fs.mkdir(path.dirname(this.filePath), { recursive: true });
            await fs.writeFile(this.filePath, '[]', 'utf-8');
        }
    }

    async readAll() {
        await this.ensureFile();
        const raw = await fs.readFile(this.filePath, 'utf-8');
        if (!raw) {
            return [];
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            console.error(`Failed to parse data file ${this.filePath}`, error);
            return [];
        }
    }

    async writeAll(items) {
        await fs.writeFile(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
    }

    async findAll() {
        const items = await this.readAll();
        return items;
    }

    async findById(id) {
        const items = await this.readAll();
        return items.find((item) => item.id === id) || null;
    }

    async create(payload) {
        const items = await this.readAll();
        const now = new Date().toISOString();
        const entity = {
            id: randomUUID(),
            createdAt: now,
            updatedAt: now,
            ...payload
        };
        items.push(entity);
        await this.writeAll(items);
        return entity;
    }

    async update(id, updates) {
        const items = await this.readAll();
        const index = items.findIndex((item) => item.id === id);

        if (index === -1) {
            return null;
        }

        const now = new Date().toISOString();
        const updated = {
            ...items[index],
            ...updates,
            id,
            updatedAt: now
        };

        items[index] = updated;
        await this.writeAll(items);
        return updated;
    }

    async delete(id) {
        const items = await this.readAll();
        const index = items.findIndex((item) => item.id === id);

        if (index === -1) {
            return false;
        }

        items.splice(index, 1);
        await this.writeAll(items);
        return true;
    }
}

module.exports = BaseRepository;

