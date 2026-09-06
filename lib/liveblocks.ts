import { Liveblocks } from "@liveblocks/node"

// The Liveblocks constructor validates the secret eagerly, so creating the
// client at module scope makes `next build` fail: collecting page data imports
// every route, and build environments don't carry runtime secrets. Build it on
// first use instead, so the secret is only required when a request needs it.
let client: Liveblocks | undefined

export function getLiveblocks() {
  if (!client) {
    const secret = process.env.LIVEBLOCKS_SECRET_KEY

    if (!secret) {
      throw new Error("LIVEBLOCKS_SECRET_KEY is not set")
    }

    client = new Liveblocks({ secret })
  }

  return client
}
