'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'

const S = {
  wrap: { maxWidth: '480px', width: '100%', fontFamily: '-apple-system, Arial, sans-serif' } as React.CSSProperties,
  header: { textAlign: 'center' as const, padding: '2.5rem 1.5rem', background: '#fff', borderRadius: '16px', marginBottom: '1.5rem', border: '0.5px solid #e8e8e4' },
  h1: { color: '#111', fontSize: '20px', fontWeight: 600, margin: '1rem 0 0.5rem' },
  sub: { color: '#888', fontSize: '14px', lineHeight: 1.8, margin: 0 },
  label: { display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' },
  input: { width: '100%', padding: '14px 16px', border: '0.5px solid #ddd', borderRadius: '10px', background: '#fff', color: '#111', fontSize: '16px', outline: 'none', boxSizing: 'border-box' as const },
  field: { marginBottom: '1.25rem' } as React.CSSProperties,
  sectionLabel: { fontSize: '11px', fontWeight: 600, color: '#aaa', letterSpacing: '.08em', textTransform: 'uppercase' as const, margin: '1.5rem 0 0.75rem' },
  submitBtn: { width: '100%', padding: '16px', background: '#111', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginTop: '1.5rem' } as React.CSSProperties,
  err: { fontSize: '13px', color: '#E24B4A', marginTop: '6px' } as React.CSSProperties,
}

export default function AdminForm() {
  const params = useParams()
  const token = params.token as string

  const [lieu, setLieu] = useState('')
  const [horaire, setHoraire] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  const submit = async () => {
    if (!lieu || !horaire) { setErrMsg('Merci de remplir les deux champs.'); return }
    setStatus('loading')
    const res = await fetch('/api/admin/set-lieu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, lieu, horaire }),
    })
    if (res.ok) {
      setStatus('success')
    } else {
      setErrMsg('Lien invalide ou déjà utilisé.')
      setStatus('error')
    }
  }

  if (status === 'success') return (
    <div style={{ ...S.wrap, textAlign: 'center', padding: '3rem 1.5rem', background: '#fff', border: '0.5px solid #e8e8e4', borderRadius: '16px' }}>
      <p style={{ fontSize: '36px', marginBottom: '1.25rem' }}>🌹</p>
      <h2 style={{ color: '#111', fontSize: '20px', fontWeight: 600, marginBottom: '0.75rem' }}>Merci Baptiste !</h2>
      <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.8 }}>Le lieu et l'horaire sont enregistrés. Les invités seront prévenus automatiquement à J-10.</p>
    </div>
  )

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <p style={{ fontSize: '36px', margin: 0 }}>🌹</p>
        <h1 style={S.h1}>Dîner surprise</h1>
        <p style={S.sub}>Renseignez le lieu et l'horaire du prochain dîner.</p>
      </div>

      <div style={S.sectionLabel}>Informations du dîner</div>

      <div style={S.field}>
        <label style={S.label}>Lieu</label>
        <input
          style={S.input}
          value={lieu}
          onChange={e => setLieu(e.target.value)}
          placeholder="Restaurant Le ..."
        />
      </div>

      <div style={S.field}>
        <label style={S.label}>Horaire</label>
        <input
          style={S.input}
          value={horaire}
          onChange={e => setHoraire(e.target.value)}
          placeholder="19h30"
        />
      </div>

      {errMsg && <p style={S.err}>{errMsg}</p>}

      <button style={S.submitBtn} onClick={submit} disabled={status === 'loading'}>
        {status === 'loading' ? 'Enregistrement…' : 'Confirmer'}
      </button>
    </div>
  )
}
