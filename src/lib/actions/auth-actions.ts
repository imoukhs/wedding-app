"use server";

export async function verifyBouncerPin(pin: string): Promise<boolean> {
  return pin === process.env.BOUNCER_PIN;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  return password === process.env.ADMIN_PASSWORD;
}

export async function verifyCatererPin(pin: string): Promise<boolean> {
  return pin === process.env.CATERER_PIN;
}
