import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/users.json');

class UsersRepository {
  private async readUsers(): Promise<User[]> {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist, return empty array
      return [];
    }
  }

  private async writeUsers(users: User[]): Promise<void> {
    await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
  }

  async findById(id: string): Promise<User | null> {
    const users = await this.readUsers();
    return users.find(user => user.id === id) || null;
  }

  async findByTwitterId(twitterId: string): Promise<User | null> {
    const users = await this.readUsers();
    return users.find(user => user.twitterId === twitterId) || null;
  }

  async findByStripeCustomerId(customerId: string): Promise<User | null> {
    const users = await this.readUsers();
    return users.find(user => user.stripeCustomerId === customerId) || null;
  }

  async findByStripeSubscriptionId(subscriptionId: string): Promise<User | null> {
    const users = await this.readUsers();
    return users.find(user => user.stripeSubscriptionId === subscriptionId) || null;
  }

  async create(user: User): Promise<User> {
    const users = await this.readUsers();
    users.push(user);
    await this.writeUsers(users);
    return user;
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const users = await this.readUsers();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      return null;
    }
    
    users[index] = { ...users[index], ...userData, updatedAt: new Date().toISOString() };
    await this.writeUsers(users);
    return users[index];
  }

  async setPro(id: string, pro: boolean): Promise<void> {
    await this.update(id, { pro });
  }

  async setTokenGatePassed(id: string, passed: boolean): Promise<void> {
    await this.update(id, { tokenGatePassed: passed });
  }

  async setStripeCustomerId(id: string, customerId: string): Promise<void> {
    await this.update(id, { stripeCustomerId: customerId });
  }

  async setStripeSubscriptionId(id: string, subscriptionId: string): Promise<void> {
    await this.update(id, { stripeSubscriptionId: subscriptionId });
  }
}

export const usersRepository = new UsersRepository();