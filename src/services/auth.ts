import bcrypt from "bcryptjs";
import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2";

export async function hashPassword(password: string, mode: "bcrypt" | "argon2" = "argon2") {
  if (mode === "bcrypt") return bcrypt.hash(password, 12);
  return argonHash(password);
}

export async function verifyPassword(
  password: string,
  hash: string,
  mode: "bcrypt" | "argon2" = "argon2",
) {
  if (mode === "bcrypt") return bcrypt.compare(password, hash);
  return argonVerify(hash, password);
}
