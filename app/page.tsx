import { Suspense } from 'react'
import Form from './Form'

export const metadata = {
  title: 'Dîner surprise — CJD',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function Page() {
  return (
    <main style={{ minHeight: '100vh', background: '#f8f8f6', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem 4rem' }}>
      <Suspense>
        <Form />
      </Suspense>
    </main>
  )
}
