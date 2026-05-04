import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl, apiKey } = appParams;
const serverUrl = typeof appBaseUrl === 'string' && appBaseUrl.startsWith('http')
  ? appBaseUrl
  : '';

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl,
  requiresAuth: false,
  appBaseUrl,
  headers: apiKey ? { api_key: apiKey } : undefined,
});
