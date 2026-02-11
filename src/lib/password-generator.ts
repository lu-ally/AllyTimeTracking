export function generatePassword(length: number = 16): string {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%&*";
  const all = uppercase + lowercase + digits + special;

  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  // Ensure at least one of each category
  let password = "";
  password += uppercase[randomValues[0] % uppercase.length];
  password += lowercase[randomValues[1] % lowercase.length];
  password += digits[randomValues[2] % digits.length];
  password += special[randomValues[3] % special.length];

  for (let i = password.length; i < length; i++) {
    password += all[randomValues[i] % all.length];
  }

  // Shuffle using Fisher-Yates with crypto random
  const chars = password.split("");
  const shuffleValues = new Uint32Array(chars.length);
  crypto.getRandomValues(shuffleValues);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuffleValues[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
