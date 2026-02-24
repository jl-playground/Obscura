import { createClient } from 'redis';

import type { RedisClientType } from 'redis';

export default class RedisService {
  private static instance: RedisService;

  private client: RedisClientType;

  private isConnected = false;

  private port = process.env.CACHE_PORT;

  private host = process.env.CACHE_HOST;

  private username = process.env.CACHE_USERNAME;

  private password = process.env.CACHE_PASSWORD;

  private url: string;

  readonly serviceName = 'RedisService';

  private constructor() {
    this.url = `redis://${this.username}:${this.password}@${this.host}:${this.port}`;
    this.client = createClient({ url: this.url });
    this.client.on('connect', () => console.log('\x1b[36m', `Redis ᚨ started on port ${this.port}`, '\x1b[0m'));
    this.client.on('error', (err) => console.error(`[Error] in ${this.serviceName}`, err));
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      this.client.quit();
      this.isConnected = false;
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  public getUrl(): string {
    return this.url;
  }
}
