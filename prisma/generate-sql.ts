import { faker } from '@faker-js/faker';
import * as fs from 'fs';
import * as path from 'path';

// ==========================================
// KODE HASHING KUSTOM MILIKMU
// ==========================================
const P = 4294967291n;

function calculateCustomHash(password: string, salt: number): string {
  let sum = 0n;
  const saltBig = BigInt(salt);

  for (let i = 0; i < password.length; i++) {
    const ascii = BigInt(password.charCodeAt(i));
    const positionFactor = BigInt(i + 1);
    sum += ascii * positionFactor * saltBig;
  }

  const hashValue = sum % P;
  return hashValue.toString();
}

async function hashPassword(password: string): Promise<string> {
  const salt = Math.floor(Math.random() * 4294967296);
  const hash = calculateCustomHash(password, salt);
  return `${salt}:${hash}`;
}

// ==========================================
// LOGIK GENERATOR 250 DATA SQL
// ==========================================
async function run() {
  const totalData = 250;
  const sqlStatements: string[] = [];
  
  console.log(`Sedang memproses dan meng-hash ${totalData} password...`);

  for (let i = 0; i < totalData; i++) {
    const id = faker.string.uuid();
    const name = faker.person.fullName().replace(/'/g, "''"); // Antisipasi petik tunggal di SQL
    const firstName = faker.person.firstName().replace(/[^a-zA-Z0-9]/g, '');
    const email = faker.internet.email({ firstName: `user${i}_${firstName}` }).toLowerCase();
    
    // Password mentah yang akan di-hash
    const rawPassword = 'password123'; 
    const hashedPwd = await hashPassword(rawPassword);
    
    const createdAt = new Date().toISOString().replace('T', ' ').replace('Z', '');

    // Susun template string INSERT ke tabel "User" PostgreSQL
    const sql = `INSERT INTO "User" ("id", "name", "email", "password", "createdAt") VALUES ('${id}', '${name}', '${email}', '${hashedPwd}', '${createdAt}');`;
    sqlStatements.push(sql);
  }

  // Tulis hasilnya menjadi file bernama dummy_users.sql di root project
  const outputPath = path.join(__dirname, '../dummy_users.sql');
  fs.writeFileSync(outputPath, sqlStatements.join('\n'), 'utf-8');

  console.log(`\n BERHASIL! File SQL telah dibuat di: ${outputPath}`);
  console.log(`Silakan buka file tersebut dan langsung paste isinya ke SQL Editor database 'plenger' kamu.`);
}

run().catch(console.error);