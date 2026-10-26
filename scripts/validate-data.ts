import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
addFormats(ajv);

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SCHEMA_DIR = path.join(DATA_DIR, 'schema');
const SOURCES_FILE = path.join(DATA_DIR, 'sources.yml');
const RANKINGS_DIR = path.join(DATA_DIR, 'rankings');

const sourceSchemaPath = path.join(SCHEMA_DIR, 'source.schema.json');
const rankingSchemaPath = path.join(SCHEMA_DIR, 'ranking.schema.json');

function loadJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function validateAllData(): { success: boolean; errors: string[] } {
  const errors: string[] = [];

  console.log('🔍 Starting AI Leaderboard Hub data validation...');

  // 1. Validate source schema
  if (!fs.existsSync(sourceSchemaPath)) {
    errors.push(`Missing source schema at ${sourceSchemaPath}`);
    return { success: false, errors };
  }
  const sourceSchema = loadJson(sourceSchemaPath);
  const validateSource = ajv.compile(sourceSchema);

  // 2. Validate sources.yml
  if (!fs.existsSync(SOURCES_FILE)) {
    errors.push(`Missing sources file at ${SOURCES_FILE}`);
    return { success: false, errors };
  }

  let sources: any[] = [];
  try {
    const rawYaml = fs.readFileSync(SOURCES_FILE, 'utf8');
    sources = yaml.load(rawYaml) as any[];
  } catch (err: any) {
    errors.push(`Failed to parse sources.yml: ${err.message}`);
    return { success: false, errors };
  }

  const validSources = validateSource(sources);
  if (!validSources) {
    validateSource.errors?.forEach((e) => {
      errors.push(`sources.yml schema error: ${e.instancePath} ${e.message}`);
    });
  }

  // Check unique source IDs
  const sourceIds = new Set<string>();
  sources.forEach((s) => {
    if (sourceIds.has(s.id)) {
      errors.push(`Duplicate source id found in sources.yml: '${s.id}'`);
    }
    sourceIds.add(s.id);
  });

  console.log(`✓ Loaded and validated ${sources.length} sources from sources.yml`);

  // 3. Validate ranking schema
  if (!fs.existsSync(rankingSchemaPath)) {
    errors.push(`Missing ranking schema at ${rankingSchemaPath}`);
    return { success: false, errors };
  }
  const rankingSchema = loadJson(rankingSchemaPath);
  const validateRanking = ajv.compile(rankingSchema);

  // 4. Validate all snapshots in data/rankings/*.json
  if (fs.existsSync(RANKINGS_DIR)) {
    const rankingFiles = fs.readdirSync(RANKINGS_DIR).filter((f) => f.endsWith('.json'));

    console.log(`✓ Checking ${rankingFiles.length} ranking snapshots in data/rankings/`);

    for (const file of rankingFiles) {
      const fullPath = path.join(RANKINGS_DIR, file);
      let snapshotData: any;
      try {
        snapshotData = loadJson(fullPath);
      } catch (err: any) {
        errors.push(`Invalid JSON in ${file}: ${err.message}`);
        continue;
      }

      // Schema check
      const validSnapshot = validateRanking(snapshotData);
      if (!validSnapshot) {
        validateRanking.errors?.forEach((e) => {
          errors.push(`${file} schema error: ${e.instancePath} ${e.message}`);
        });
      }

      // Referential integrity: snapshot.source_id must exist in sources.yml
      if (!sourceIds.has(snapshotData.source_id)) {
        errors.push(`${file}: source_id '${snapshotData.source_id}' does not exist in sources.yml`);
      }

      // Check models array
      if (Array.isArray(snapshotData.models)) {
        const rankSet = new Set<number>();
        const modelNames = new Set<string>();

        snapshotData.models.forEach((m: any, idx: number) => {
          if (m.rank == null || typeof m.rank !== 'number' || m.rank < 1) {
            errors.push(`${file} model[${idx}]: rank must be a positive integer`);
          }

          if (!m.normalized_model_name || m.normalized_model_name.trim() === '') {
            errors.push(`${file} model[${idx}]: missing normalized_model_name`);
          }

          if (m.score === undefined || m.score === null || m.score === '') {
            errors.push(`${file} model[${idx}]: missing score value`);
          }
        });
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

// Direct execution CLI support
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('validate-data.ts') || process.argv[1].endsWith('validate-data.js')
);

if (isMainModule) {
  const result = validateAllData();
  if (result.success) {
    console.log('✅ All data schemas and referential integrity checks PASSED successfully!');
    process.exit(0);
  } else {
    console.error('❌ Data validation failed with the following errors:');
    result.errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }
}
