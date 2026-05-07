const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class JsonRepository {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async ensureFile() {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify([], null, 2));
    }
  }

  async readAll() {
    await this.ensureFile();
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${this.filePath}:`, error);
      return [];
    }
  }

  async findById(id) {
    const items = await this.readAll();
    return items.find(item => item.id === id) || null;
  }

  async findBy(predicate) {
    const items = await this.readAll();
    return items.find(predicate) || null;
  }

  async filter(predicate) {
    const items = await this.readAll();
    return items.filter(predicate);
  }

  async create(data) {
    const items = await this.readAll();
    const newItem = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newItem);
    await this._writeAll(items);
    return newItem;
  }

  async update(id, updates) {
    const items = await this.readAll();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await this._writeAll(items);
    return items[index];
  }

  async delete(id) {
    const items = await this.readAll();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    items.splice(index, 1);
    await this._writeAll(items);
    return true;
  }

  async _writeAll(items) {
    await fs.writeFile(this.filePath, JSON.stringify(items, null, 2));
  }
}

module.exports = JsonRepository;
