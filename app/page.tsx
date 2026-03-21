import { redirect } from 'next/navigation'

// Root path — redirect to the main dashboard
export default function RootPage() {
    redirect('/dashboard')
}
