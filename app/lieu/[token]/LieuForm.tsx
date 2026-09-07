'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { DATES } from '@/lib/dates'

const S = {
  page: { minHeight: '100vh', background: '#f8f8f6', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '2rem 1rem 4rem' } as React.CSSProperties,
  wrap: { maxWidth: '520px', width: '100%', fontFamily: '-apple-system, Arial, sans-serif' } as React.CSSProperties,
  card: { background: '#fff', borderRadius: '16px', border: '0.5px solid #e8e8e4', padding: '2rem 1.5rem' } as React.CSSProperties,
  logo: { display: 'block', width: '150px', maxWidth: '55%', height: 'auto', margin: '0 auto 1.25rem' } as React.CSSProperties,
  h1: { color: '#111', fontSize: '20px', fontWeight: 600, margin: '0 0 0.4rem', textAlign: 'center' as const },
  sub: { color: '#888', fontSize: '14px', lineHeight: 1.7, margin: '0 0 1.75rem', textAlign: 'center' as const },
  label: { display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' },
  input: { width: '100%', padding: '14px 16px', border: '0.5px solid #ddd', borderRadius: '10px', background: '#fff', color: '#111', fontSize: '16px', outline: 'none', boxSizing: 'border-box' as const, WebkitAppearance: 'none' as const },
  field: { marginBottom: '1.25rem' } as React.CSSProperties,
  btn: { width: '100%', padding: '16px', background: '#111', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem' } as React.CSSProperties,
  err: { fontSize: '13px', color: '#E24B4A', marginTop: '6px' } as React.CSSProperties,
}

export default function LieuForm() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [invalid, setInvalid] = useState(false)
  const [dateLabel, setDateLabel] = useState('')
  const [lieu, setLieu] = useState('')
  const [horaire, setHoraire] = useState('19h')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  useEffect(() => {
    fetch(`/api/lieu/set?token=${token}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => {
        const date = DATES.find(x => x.id === d.date_id)
        setDateLabel(date ? date.label : d.date_id)
        if (d.lieu) setLieu(d.lieu)
        if (d.horaire) setHoraire(d.horaire)
      })
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false))
  }, [token])

  const submit = async () => {
    if (!lieu.trim()) { setErrMsg('Merci d’indiquer le lieu.'); return }
    setStatus('loading')
    const res = await fetch('/api/lieu/set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, lieu, horaire }),
    })
    if (res.ok) setStatus('success')
    else { setErrMsg('Lien invalide ou expiré.'); setStatus('error') }
  }

  if (loading) return (
    <div style={S.page}><div style={S.wrap}><div style={S.card}>
      <p style={{ textAlign: 'center', color: '#888' }}>Chargement…</p>
    </div></div></div>
  )

  if (invalid) return (
    <div style={S.page}><div style={S.wrap}><div style={S.card}>
      <img src="/logo-cjd-rouen.svg" alt="CJD Rouen" style={S.logo} />
      <h1 style={S.h1}>Lien invalide</h1>
      <p style={S.sub}>Ce lien n'est plus valable. Contacte l'organisation.</p>
    </div></div></div>
  )

  if (status === 'success') return (
    <div style={S.page}><div style={S.wrap}><div style={S.card}>
      <img src="/logo-cjd-rouen.svg" alt="CJD Rouen" style={S.logo} />
      <h1 style={S.h1}>Merci, c'est enregistré</h1>
      <p style={S.sub}>
        Lieu du dîner du <strong>{dateLabel}</strong> : <strong>{lieu}</strong> ({horaire}).<br />
        Les inscrits seront prévenus. Tu peux revenir sur ce lien pour corriger si besoin.
      </p>
    </div></div></div>
  )

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={S.card}>
          <img src="/logo-cjd-rouen.svg" alt="CJD Rouen" style={S.logo} />
          <h1 style={S.h1}>Lieu du dîner</h1>
          <p style={S.sub}>Dîner du <strong>{dateLabel}</strong>.<br />Renseigne l'adresse exacte et l'horaire.</p>

          <div style={S.field}>
            <label style={S.label}>Lieu (adresse complète)</label>
            <input
              style={S.input}
              value={lieu}
              onChange={e => setLieu(e.target.value)}
              placeholder="Restaurant …, 12 rue …, Rouen"
            />
          </div>

          <div style={S.field}>
            <label style={S.label}>Horaire</label>
            <input
              style={S.input}
              value={horaire}
              onChange={e => setHoraire(e.target.value)}
              placeholder="19h"
            />
          </div>

          {(errMsg && (status === 'error' || status === 'idle')) && <p style={S.err}>{errMsg}</p>}

          <button style={S.btn} onClick={submit} disabled={status === 'loading'}>
            {status === 'loading' ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
