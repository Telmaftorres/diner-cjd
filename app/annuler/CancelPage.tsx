'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function CancelPage() {
  const params = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    fetch(`/api/cancel?token=${token}`)
      .then(r => setStatus(r.ok ? 'ok' : 'error'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <main style={{ minHeight: '100vh', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial,sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
        <p style={{ fontSize: '32px', marginBottom: '1rem' }}>🌹</p>
        {status === 'loading' && <p style={{ color: '#888' }}>Traitement en cours…</p>}
        {status === 'ok' && <>
          <h1 style={{ color: '#5DCAA5', fontSize: '18px', fontWeight: 500, marginBottom: '0.75rem' }}>Absence enregistrée</h1>
          <p style={{ color: '#9FE1CB', fontSize: '13px', lineHeight: 1.7 }}>Votre place a été libérée. Nous espérons vous retrouver à une prochaine édition.</p>
        </>}
        {status === 'error' && <>
          <h1 style={{ color: '#E24B4A', fontSize: '18px', fontWeight: 500, marginBottom: '0.75rem' }}>Lien invalide</h1>
          <p style={{ color: '#aaa', fontSize: '13px', lineHeight: 1.7 }}>Ce lien n'est pas valide ou a déjà été utilisé.</p>
        </>}
      </div>
    </main>
  )
}
