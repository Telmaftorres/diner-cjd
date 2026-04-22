'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function CancelPage() {
  const params = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    fetch(`/api/cancel?token=${token}`, { redirect: 'manual' })
      .then(r => {
        if (r.status === 0 || r.type === 'opaqueredirect') {
          setStatus('ok')
        } else if (r.ok) {
          setStatus('ok')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('ok'))
  }, [token])

  const style = {
    page: { minHeight: '100vh', background: '#f8f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, Arial, sans-serif', padding: '2rem' } as React.CSSProperties,
    card: { textAlign: 'center' as const, padding: '3rem 2rem', background: '#fff', border: '0.5px solid #e8e8e4', borderRadius: '16px', maxWidth: '400px', width: '100%' },
  }

  return (
    <div style={style.page}>
      <div style={style.card}>
        <p style={{ fontSize: '36px', marginBottom: '1.25rem' }}>🌹</p>
        {status === 'loading' && <p style={{ color: '#888' }}>Traitement en cours…</p>}
        {status === 'ok' && <>
          <h1 style={{ color: '#111', fontSize: '18px', fontWeight: 600, marginBottom: '0.75rem' }}>Absence enregistrée</h1>
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.8 }}>Merci de nous avoir prévenus. Votre place a été libérée et nous espérons vous retrouver à une prochaine édition.</p>
        </>}
        {status === 'error' && <>
          <h1 style={{ color: '#111', fontSize: '18px', fontWeight: 600, marginBottom: '0.75rem' }}>Lien déjà utilisé</h1>
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.8 }}>Votre absence a déjà été enregistrée.</p>
        </>}
      </div>
    </div>
  )
}
