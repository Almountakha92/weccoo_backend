import fs from 'node:fs';
import path from 'node:path';

interface UniversityEmailDbFile {
  generatedAt: string;
  source: string;
  rowCount: number;
  universities: Record<string, string[]>;
}

const normalizeUniversity = (value: string) => value.trim().toLowerCase();
const normalizeEmail = (value: string) => value.trim().toLowerCase();

let cachedDb: Map<string, Set<string>> | null = null;

const defaultDbPath = () =>
  path.resolve(__dirname, '..', '..', 'data', 'university_email_db.json');

export const loadUniversityEmailDb = () => {
  if (cachedDb) {
    return cachedDb;
  }

  const dbPath = process.env.UNIVERSITY_EMAIL_DB_PATH?.trim() || defaultDbPath();
  const raw = fs.readFileSync(dbPath, 'utf-8');
  const parsed = JSON.parse(raw) as UniversityEmailDbFile;

  const map = new Map<string, Set<string>>();
  for (const [university, emails] of Object.entries(parsed.universities ?? {})) {
    map.set(normalizeUniversity(university), new Set(emails.map(normalizeEmail)));
  }

  cachedDb = map;
  return cachedDb;
};

export const isUniversityEmailInDb = (university: string, email: string) => {
  const uniKey = normalizeUniversity(university);
  const emailKey = normalizeEmail(email);
  if (!uniKey || !emailKey) {
    return false;
  }

  const db = loadUniversityEmailDb();
  const set = db.get(uniKey);
  return set ? set.has(emailKey) : false;
};
