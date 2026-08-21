import { NextRequest, NextResponse } from 'next/server'

// TODO: Save token to your database.
// This stub logs the token and returns success.
//
// Example implementation:
//   import { db } from '@/lib/db'
//   await db.pushToken.upsert({
//     where: { userId_token: { userId, token } },
//     update: { updatedAt: new Date() },
//     create: { userId, token },
//   })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, userId } = body as { token: string; userId: string }

    if (!token || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing token or userId' },
        { status: 400 }
      )
    }

    // TODO: Persist to database
    console.log('[register-token] Received push token:', { userId, token: token.slice(0, 20) + '…' })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[register-token] Error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
