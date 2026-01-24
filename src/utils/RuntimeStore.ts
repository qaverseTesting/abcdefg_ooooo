/**
 * RuntimeStore
 * ------------
 * Stores runtime values (like created group name)
 * across dependent Playwright projects.
 *
 * Uses JSON file so data survives:
 * - project boundaries
 * - retries
 * - CI workers
 */

import fs from 'fs';
import path from 'path';
import { Logger } from './Logger';

const STORE_PATH = path.resolve(process.cwd(), 'storage/runtime.json');

type RuntimeData = {
  groupName?: string;
};

export class RuntimeStore {
  /**
   * Read full runtime store
   */
  private static read(): RuntimeData {
    if (!fs.existsSync(STORE_PATH)) return {};
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  }

  /**
   * Write full runtime store
   */
  private static write(data: RuntimeData): void {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
  }

  /**
   * Save created group name
   */
  static saveGroupName(name: string): void {
    Logger.info(`Saving group name: ${name}`);
    const data = this.read();
    data.groupName = name;
    this.write(data);
  }

  /**
   * Get saved group name
   */
  static getGroupName(): string {
    const data = this.read();
    if (!data.groupName) {
      throw new Error('RuntimeStore: groupName not found');
    }
    return data.groupName;
  }
}
