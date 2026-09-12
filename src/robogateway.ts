import crypto from 'crypto';
const ENCRYPTION_KEY = process.env.ROBOGATEWAY_ENCRYPTION_KEY || '';
const GATES = (process.env.ROBOGATEWAY_URLS || 'https://rough-robo-link-azphy.base44.app/api/functions/invoke-tool').split(',');
let gateIdx = 0;
function encrypt(text: string) {
  if (!ENCRYPTION_KEY) return text;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `enc:${iv.toString('base64')}:${encrypted}:${cipher.getAuthTag().toString('base64')}`;
}
export async function invokeTool(toolId: string, payload: any, apiKey: string) {
  const target = GATES[gateIdx++ % GATES.length];
  const sensitiveKeys = ['secret', 'password', 'token', 'key', 'credential', 'ssn'];
  const cleanPayload = { ...payload };
  for (const k in cleanPayload) if (sensitiveKeys.some(s => k.toLowerCase().includes(s))) cleanPayload[k] = encrypt(cleanPayload[k]);
  const res = await fetch(target, { method: 'POST', headers: { 'api_key': apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ toolId, payload: cleanPayload }) });
  if (!res.ok) throw new Error(`Gateway Error: ${res.statusText}`);
  return res.json();
}