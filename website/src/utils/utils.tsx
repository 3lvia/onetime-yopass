import { message, encrypt, decrypt, DecryptResult } from 'openpgp';

type Response = {
  // TODO: this shouldn't be any
  data: any;
  status: number;
};

export const randomString = (): string => {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 12; i++) {
    text += possible.charAt(randomInt(0, possible.length));
  }
  return text;
};

const randomInt = (min: number, max: number): number => {
  const byteArray = new Uint8Array(1);
  window.crypto.getRandomValues(byteArray);

  const range = max - min;
  const maxRange = 256;
  if (byteArray[0] >= Math.floor(maxRange / range) * range) {
    return randomInt(min, max);
  }
  return min + (byteArray[0] % range);
};

export const backendDomain = process.env.REACT_APP_BACKEND_URL
  ? `${process.env.REACT_APP_BACKEND_URL}`
  : '';

export const postSecret = async (body: any): Promise<Response> => {
  return post(backendDomain + '/secret', body);
};

export const uploadFile = async (body: any): Promise<Response> => {
  return post(backendDomain + '/file', body);
};

const post = async (url: string, body: any): Promise<Response> => {
  const request = await fetch(url, {
    body: JSON.stringify(body),
    method: 'POST',
  });
  return { data: await request.json(), status: request.status };
};

export const decryptMessage = async (
  data: string,
  passwords: string,
  format: 'utf8' | 'binary',
): Promise<DecryptResult> => {
  const r = await decrypt({
    message: await message.readArmored(data),
    passwords,
    format,
  });
  return r;
};

export const encryptMessage = async (
  data: string,
  passwords: string,
): Promise<string> => {
  const r = await encrypt({
    message: message.fromText(data),
    passwords,
  });
  return r.data as string;
};

export default randomString;
