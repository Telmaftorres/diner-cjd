'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { DATES, MAX_PER_DATE } from '@/lib/dates'

const S = {
  wrap: { maxWidth: '520px', width: '100%', fontFamily: '-apple-system, Arial, sans-serif' } as React.CSSProperties,
  header: { textAlign: 'center' as const, padding: '2.5rem 1.5rem', background: '#fff', borderRadius: '16px', marginBottom: '1.5rem', border: '0.5px solid #e8e8e4' },
  h1: { color: '#111', fontSize: '22px', fontWeight: 600, margin: '1rem 0 0.5rem' },
  sub: { color: '#888', fontSize: '15px', lineHeight: 1.8, margin: 0 },
  sectionLabel: { fontSize: '11px', fontWeight: 600, color: '#aaa', letterSpacing: '.08em', textTransform: 'uppercase' as const, margin: '2rem 0 0.75rem' },
  label: { display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px' },
  input: { width: '100%', padding: '14px 16px', border: '0.5px solid #ddd', borderRadius: '10px', background: '#fff', color: '#111', fontSize: '16px', outline: 'none', boxSizing: 'border-box' as const, WebkitAppearance: 'none' as const },
  dateBtn: (selected: boolean, disabled: boolean): React.CSSProperties => ({
    padding: '16px 10px',
    border: `0.5px solid ${selected ? '#1D9E75' : disabled ? '#eee' : '#ddd'}`,
    borderRadius: '12px',
    background: selected ? '#f0faf6' : disabled ? '#f8f8f8' : '#fff',
    color: selected ? '#0F6E56' : disabled ? '#ccc' : '#333',
    cursor: disabled ? 'not-allowed' : 'pointer',
    textAlign: 'center',
    lineHeight: 1.5,
    width: '100%',
    WebkitTapHighlightColor: 'transparent',
  }),
  submitBtn: { width: '100%', padding: '18px', background: '#111', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', marginTop: '2rem', letterSpacing: '.01em', WebkitTapHighlightColor: 'transparent' } as React.CSSProperties,
  err: { fontSize: '13px', color: '#E24B4A', marginTop: '6px' } as React.CSSProperties,
  field: { marginBottom: '1.25rem' } as React.CSSProperties,
}

export default function Form() {
  const params = useSearchParams()
  const cancelStatus = params.get('cancel')

  const [counts, setCounts] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [fields, setFields] = useState({ prenom: '', nom: '', tel: '', email: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch('/api/counts').then(r => r.json()).then(setCounts)
  }, [])

  const set = (k: string, v: string) => setFields(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!fields.prenom) e.prenom = 'Requis'
    if (!fields.nom) e.nom = 'Requis'
    if (!fields.tel) e.tel = 'Requis'
    if (!fields.email || !/\S+@\S+\.\S+/.test(fields.email)) e.email = 'Email invalide'
    if (!selected) e.date = 'Choisissez une date'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setStatus('loading')
    const res = await fetch('/api/inscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...fields, dateId: selected }),
    })
    if (res.ok) {
      setStatus('success')
    } else {
      const d = await res.json()
      setErrorMsg(
        d.error === 'Complet' ? 'Cette date est complète.' :
        d.error === 'Déjà inscrit' ? 'Vous êtes déjà inscrit pour cette date.' :
        'Une erreur est survenue.'
      )
      setStatus('error')
    }
  }

  if (cancelStatus === 'ok') return (
    <div style={{ ...S.wrap, textAlign: 'center', padding: '3rem 1.5rem', background: '#fff', border: '0.5px solid #e8e8e4', borderRadius: '16px' }}>
      <p style={{ fontSize: '36px', marginBottom: '1.25rem' }}>🌹</p>
      <h2 style={{ color: '#111', fontSize: '20px', fontWeight: 600, marginBottom: '0.75rem' }}>Absence enregistrée</h2>
      <p style={{ color: '#888', fontSize: '15px', lineHeight: 1.8 }}>Votre place a été libérée. Nous espérons vous retrouver à une prochaine édition.</p>
    </div>
  )

  if (status === 'success') return (
    <div style={{ ...S.wrap, textAlign: 'center', padding: '3rem 1.5rem', background: '#fff', border: '0.5px solid #e8e8e4', borderRadius: '16px' }}>
      <p style={{ fontSize: '36px', marginBottom: '1.25rem' }}>🌹</p>
      <h2 style={{ color: '#111', fontSize: '20px', fontWeight: 600, marginBottom: '0.75rem' }}>À bientôt, {fields.prenom} !</h2>
      <p style={{ color: '#888', fontSize: '15px', lineHeight: 1.8 }}>
        Votre inscription est confirmée.<br />Vous recevrez un email de confirmation.<br /><br />
        Le lieu ? Il vous parviendra au dernier moment.
      </p>
    </div>
  )

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <p style={{ fontSize: '36px', margin: 0 }}>🌹</p>
        <h1 style={S.h1}>Dîner surprise</h1>
        <p style={S.sub}>Un soir pas comme les autres.<br />Le reste… reste un secret.</p>
      </div>

      <div style={S.sectionLabel}>Vos coordonnées</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.25rem' }}>
        {(['prenom', 'nom'] as const).map(k => (
          <div key={k}>
            <label style={S.label}>{k === 'prenom' ? 'Prénom' : 'Nom'}</label>
            <input
              style={S.input}
              value={fields[k]}
              onChange={e => set(k, e.target.value)}
              placeholder={k === 'prenom' ? 'Marie' : 'Dupont'}
              autoCapitalize="words"
            />
            {errors[k] && <p style={S.err}>{errors[k]}</p>}
          </div>
        ))}
      </div>
      <div style={S.field}>
        <label style={S.label}>Téléphone</label>
        <input
          style={S.input}
          type="tel"
          inputMode="tel"
          value={fields.tel}
          onChange={e => set('tel', e.target.value)}
          placeholder="+33 6 00 00 00 00"
        />
        {errors.tel && <p style={S.err}>{errors.tel}</p>}
      </div>
      <div style={S.field}>
        <label style={S.label}>Email</label>
        <input
          style={S.input}
          type="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          value={fields.email}
          onChange={e => set('email', e.target.value)}
          placeholder="marie@exemple.fr"
        />
        {errors.email && <p style={S.err}>{errors.email}</p>}
      </div>

      <div style={S.sectionLabel}>Choisissez votre date</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {DATES.map(d => {
          const full = (counts[d.id] ?? 0) >= MAX_PER_DATE
          const sel = selected === d.id
          return (
            <button
              key={d.id}
              style={S.dateBtn(sel, full)}
              disabled={full}
              onClick={() => { setSelected(d.id); setErrors(e => ({ ...e, date: '' })) }}
            >
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{d.label}</div>
              <div style={{ fontSize: '12px', opacity: .6, marginTop: '3px' }}>{full ? 'complet' : d.sub}</div>
            </button>
          )
        })}
      </div>
      {errors.date && <p style={S.err}>{errors.date}</p>}
      {status === 'error' && <p style={{ ...S.err, marginTop: '1rem', textAlign: 'center' }}>{errorMsg}</p>}

      <button style={S.submitBtn} onClick={submit} disabled={status === 'loading'}>
        {status === 'loading' ? 'Envoi…' : 'Je participe'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '12px', color: '#ccc', marginTop: '1.5rem', lineHeight: 1.6 }}>
        La confirmation vous sera envoyée par email.<br />Le lieu vous parviendra au dernier moment.
      </p>
    </div>
  )
}