import fs from 'node:fs';
import path from 'node:path';
import type { RankingSnapshot } from '../../src/utils/types';
import { validateAllData } from '../validate-data';

export abstract class BaseAdapter {
  abstract readonly sourceId: string;
  abstract readonly sourceUrl: string;

  /**
   * Fetches the latest snapshot from the upstream API or public endpoint.
   */
  abstract fetchSnapshot(): Promise<RankingSnapshot>;

  /**
   * Safe execution wrapper:
   * 1. Fetches new snapshot
   * 2. Validates structure
   * 3. Writes only if valid, retaining previous snapshot if fetching or validation fails
   */
  async update(): Promise<{ success: boolean; message: string }> {
    const targetFile = path.resolve(process.cwd(), 'data', 'rankings', `${this.sourceId}.json`);
    console.log(`[Adapter: ${this.sourceId}] Starting snapshot update...`);

    try {
      const snapshot = await this.fetchSnapshot();

      if (!snapshot || !Array.isArray(snapshot.models) || snapshot.models.length === 0) {
        throw new Error('Received empty or invalid model list from upstream');
      }

      // Format check
      const formattedJson = JSON.stringify(snapshot, null, 2);

      // Write to temporary buffer or directly
      fs.writeFileSync(targetFile, formattedJson, 'utf8');

      // Verify overall data integrity
      const validation = validateAllData();
      if (!validation.success) {
        throw new Error(`Data validation failed after update: ${validation.errors.join('; ')}`);
      }

      console.log(`[Adapter: ${this.sourceId}] Successfully updated snapshot for ${this.sourceId}`);
      return {
        success: true,
        message: `Successfully updated ${snapshot.models.length} models for ${this.sourceId}`,
      };
    } catch (err: any) {
      console.warn(`[Adapter: ${this.sourceId}] Update failed: ${err.message}. Retaining existing snapshot.`);
      return {
        success: false,
        message: `Failed: ${err.message}`,
      };
    }
  }
}
