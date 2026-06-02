// Nilai P: Bilangan prima 32-bit terbesar untuk operasi modulo
const P = 4294967291n;

/**
 * Fungsi internal untuk menghitung hash berdasarkan rumus:
 * h(k) = ( Σ ASCII[i] × (i+1) × salt ) mod P
 */
function calculateCustomHash(password: string, salt: number): string {
  let sum = 0n;
  const saltBig = BigInt(salt);

  for (let i = 0; i < password.length; i++) {
    const ascii = BigInt(password.charCodeAt(i));
    const positionFactor = BigInt(i + 1); // (i + 1)
    
    // Σ ASCII[i] × (i+1) × salt
    sum += ascii * positionFactor * saltBig;
  }

  // mod P
  const hashValue = sum % P;
  return hashValue.toString();
}

/**
 * Fungsi helper untuk melakukan komparasi string secara constant-time 
 * tanpa menggunakan library luar untuk mencegah timing attacks.
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    // Operasi bitwise XOR
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export const authUtils = {
  // 1. Kustom Hashing (Tanpa Library)
  async hashPassword(password: string): Promise<string> {
    // Menghasilkan salt 32-bit acak (rentang: 0 hingga 4,294,967,295 atau 0xFFFFFFFF)
    const salt = Math.floor(Math.random() * 4294967296);
    const hash = calculateCustomHash(password, salt);

    // Format: salt:hash
    return `${salt}:${hash}`;
  },

  // 2. Verifikasi Password (Constant-time manual)
  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [saltStr, hash] = storedHash.split(":");
    
    if (!saltStr || !hash) {
      return false;
    }

    const salt = parseInt(saltStr, 10);

    // Hitung ulang hash dengan salt yang disimpan
    const computedHash = calculateCustomHash(password, salt);

    // Verifikasi dengan aman tanpa kebocoran waktu (timing-safe)
    return safeEqual(hash, computedHash);
  },

  // 3. Pembuatan Session Token (Tanpa Library)
  generateSessionToken(email: string): string {
    const timestamp = Date.now().toString();
    const nonce = Math.floor(Math.random() * 1000000).toString();
    
    // Menggunakan fungsi hash kustom dengan salt statis sebagai pengganti SHA-256
    const secretSalt = 54321; 
    const signature = calculateCustomHash(`${email}${timestamp}${nonce}`, secretSalt);

    // Format: email|signature (Email untuk identitas, signature untuk validasi)
    return `${email}|${signature}`;
  }
};