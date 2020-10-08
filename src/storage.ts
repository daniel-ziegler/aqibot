import google_private from '../config/google_private'

export async function buildGCPClient() {
  return new GCPClient(google_private)
}

type Config = typeof google_private

export class GCPClient {
  url: string
  config: Config
  constructor(config: Config) {
    this.url = "https://firestore.googleapis.com/v1/projects/aqibot-291821/databases/(default)/documents"
    this.config = config
  }

  async authHeaders() {
    let token = await getAuthToken(this.config)
    return { Authorization: `${token.token_type} ${token.access_token}` }
  }

  async getDocument(collection: string, documentId: string): Promise<any> {
    const headers = await this.authHeaders()
    const resp = await fetch(`${this.url}/${collection}/${documentId}`, {
      headers,
    })
    if (!resp.ok) {
      throw new Error(resp.statusText)
    }
    const doc = await resp.json() as { fields: GoogleObj }
    return decodeObj(doc.fields)
  }

  async patchDocument(collection: string, documentId: string, doc: any) {
    const headers = await this.authHeaders()
    const fields = Object.entries(doc).reduce(
      (acc, [k, v]) => ({ ...acc, [k]: encodeFieldValue(v) }),
      {}
    )
    let url = new URL(`${this.url}/${collection}/${documentId}`)
    for (let k of Object.keys(doc)) {
      url.searchParams.append("mask.fieldPaths", k)
    }
    const resp = await fetch(url.href, {
      headers,
      method: 'PATCH',
      body: JSON.stringify({ fields })
    })
    if (!resp.ok) {
      throw new Error(resp.statusText)
    }
    const newDoc = await resp.json() as { fields: GoogleObj }
    return decodeObj(newDoc.fields)
  }

  async listDocuments(collection: string, nextPageToken?: string) {
    let headers = await this.authHeaders()
    let qs = new URLSearchParams({
      fields: 'documents(fields,name),nextPageToken',
    })
    if (nextPageToken) qs.append('pageToken', nextPageToken)
    return fetch(`${this.url}/${collection}?${qs.toString()}`, {
      method: 'GET',
      headers,
    })
  }
}

type GoogleVal =
  | { doubleValue: number }
  | { intValue: number }
  | { stringValue: string }

type GoogleObj = { [k: string]: GoogleVal }

function encodeFieldValue(v: any): GoogleVal {
  if (typeof v === "number") {
    return { doubleValue: v }
  } else if (typeof v === "string") {
    return { stringValue: v }
  } else {
    throw new Error(`don't know how to handle ${v}`)
  }
}

function decodeObj(o: GoogleObj): any {
  return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, decodeFieldValue(v)]))
}

function decodeFieldValue(v: GoogleVal): any {
  if ('doubleValue' in v) {
    return v.doubleValue
  } else if ('intValue' in v) {
    return v.intValue
  } else if ('stringValue' in v) {
    return v.stringValue
  } else {
    throw new Error(`don't know how to handle ${Object.entries(v)}`)
  }
}

type OAuthToken = {
  token_type: string
  access_token: string
  expires_in: number
}

// Adapted from https://community.cloudflare.com/t/connecting-to-google-storage/32350
async function getAuthToken(config: Config): Promise<OAuthToken> {
  // Get the header of the OAUTH request
  const GOOGLE_KEY_HEADER = objectToBase64url({
    alg: 'RS256',
    typ: 'JWT',
  })

  // Determine the issue and expiration date for the claimset
  const iat = Math.round(Date.now() / 1000)
  // Expires in an hour (that is the max allowed)
  const exp = iat + 3600

  // Generate the claimset payload
  const claimset = objectToBase64url({
    iss: 'cloudflare-worker@aqibot-291821.iam.gserviceaccount.com',
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://www.googleapis.com/oauth2/v4/token',
    exp,
    iat,
  })

  // Import the Key into a CryptoKey object
  // This will export a private key, only used for signing
  const key = await crypto.subtle.importKey(
    'jwk',
    {
      ...config,
      // Add alg: 'RS256' to it
      alg: 'RS256',
    },
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: {
        name: 'SHA-256',
      },
    },
    false,
    ['sign'],
  )

  // Sign the header and claimset
  const rawToken = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(`${GOOGLE_KEY_HEADER}.${claimset}`),
  )

  // Convert the token to Base64URL format
  const token = arrayBufferToBase64Url(rawToken)

  // Make the OAUTH request
  const response = await fetch('https://www.googleapis.com/oauth2/v4/token', {
    method: 'POST',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${GOOGLE_KEY_HEADER}.${claimset}.${token}`,
    }),
  })

  // Grab the JSON from the response
  const oauth = await response.json()
  return oauth
}

/**
 * Helper methods for getting things to/from base64url and array buffers
 */
function objectToBase64url(payload: any) {
  return arrayBufferToBase64Url(
    new TextEncoder().encode(JSON.stringify(payload)),
  )
}

function arrayBufferToBase64Url(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}