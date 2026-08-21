import { NextResponse } from 'next/server'

// TODO: Replace with your real auth logic.
// This stub always returns unauthenticated so modals are hidden until you wire
// up a real session/cookie/token check here.
//
// Example with NextAuth:
//   import { getServerSession } from 'next-auth'
//   const session = await getServerSession()
//   if (!session?.user?.id) return NextResponse.json({ authenticated: false, userId: null })
//   return NextResponse.json({ authenticated: true, userId: session.user.id })

export async function GET() {
  return NextResponse.json({
    authenticated: false,
    userId: null,
  })
}
