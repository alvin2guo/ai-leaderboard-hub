import { describe, it, expect } from 'vitest';
import { validateAllData } from '../scripts/validate-data';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'node:fs';
import path from 'node:path';

describe('Data Schema and Integrity', () => {
  it('should validate all production sources and snapshots without errors', () => {
    const result = validateAllData();
    expect(result.errors).toEqual([]);
    expect(result.success).toBe(true);
  });

  it('should reject ranking snapshots with missing required fields', () => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);

    const schemaPath = path.resolve(process.cwd(), 'data', 'schema', 'ranking.schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const validate = ajv.compile(schema);

    // Missing required source_url and normalized_model_name
    const invalidSnapshot = {
      source_id: 'test-source',
      snapshot_date: '2026-10-25',
      models: [
        {
          rank: 1,
          model_name: 'test-model',
          organization: 'Test Org',
          score: 100,
        },
      ],
    };

    const valid = validate(invalidSnapshot);
    expect(valid).toBe(false);
    expect(validate.errors?.some((e) => e.params.missingProperty === 'source_url')).toBe(true);
  });

  it('should reject models with negative or zero ranks', () => {
    const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
    addFormats(ajv);

    const schemaPath = path.resolve(process.cwd(), 'data', 'schema', 'ranking.schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const validate = ajv.compile(schema);

    const invalidRankSnapshot = {
      source_id: 'test-source',
      snapshot_date: '2026-10-25',
      source_url: 'https://example.com/test',
      models: [
        {
          rank: 0, // rank must be >= 1
          model_name: 'test-model',
          normalized_model_name: 'test-model',
          organization: 'Test Org',
          score: 100,
        },
      ],
    };

    const valid = validate(invalidRankSnapshot);
    expect(valid).toBe(false);
  });
});
