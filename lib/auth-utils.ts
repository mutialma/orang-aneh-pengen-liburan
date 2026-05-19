import crypto from "node:crypto";

const ITERATIONS = 100000;
const KEY_LEN = 64; // 512 bits
const ALGO = "sha256";

export const authUtils = {
  // 1. PBKDF2 Hashing
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString("hex"); // 128-bit salt
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, ITERATIONS, KEY_LEN, ALGO, (err, derivedKey) => {
        if (err) reject(err);
        // Format: iterations:salt:hash
        resolve(`${ITERATIONS}:${salt}:${derivedKey.toString("hex")}`);
      });
    });
  },

  

  // 2. Constant-time Verification
  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [iterations, salt, hash] = storedHash.split(":");
    const hashBuffer = Buffer.from(hash, "hex");
    
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, parseInt(iterations), KEY_LEN, ALGO, (err, derivedKey) => {
        if (err) reject(err);
        // timingSafeEqual mencegah timing attacks
        resolve(crypto.timingSafeEqual(hashBuffer, derivedKey));
      });
    });
  },

 generateSessionToken(email: string): string {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(8).toString("hex");
    const signature = crypto
      .createHash("sha256")
      .update(`${email}${timestamp}${nonce}${ALGO}`) // Tambah bumbu rahasia
      .digest("hex");
    
    // Format: email|signature (Email untuk identitas, signature untuk validasi)
    return `${email}|${signature}`;
  }
  
};