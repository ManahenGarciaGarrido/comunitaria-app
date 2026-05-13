import { redirect } from 'next/navigation'

// The actual home is in (app)/dashboard/page.tsx — this avoids a route conflict
// with the (app) route group.
export default function RootPage() {
  redirect('/dashboard')
}
