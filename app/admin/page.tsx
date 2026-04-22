'use client'
import { useState } from 'react'

type Inscrit = {
  prenom: string
  nom: string
  email: string
  tel: string
  date_label: string
  created_at: string
  annule: boolean
}

const S = {
  page: { minHeight: '100vh', background: '#f8f8f6', padding: '2rem 1rem', fontFamily: '-apple-system, Arial, sans-serif' } as React.CSSProperties,
  wrap: { maxWidth: '900px', margin: '0 auto' } as React.CSSProperties,
  header: { textAlign: 'center' as const, padding: '2rem 1.5rem', background: '#fff', borderRadius: '16px', marginBottom: '1.5rem', border: '0.5px solid #e8e8e4' },
  h1: { color: '#111', fontSize: '22px', fontWeight: 600, margin: '1rem 0 0.5rem' },
  input: { width: '100%', padding: '14px 16px', border: '0.5px solid #ddd', borderRadius: '10px', background: '#fff', color: '#111', fontSize: '16px', outline: 'none', boxSizing: 'border-box' as const, marginBottom: '1rem' },
  btn: { width: '100%', padding: '14px', background: '#111', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
  exportBtn: { padding: '10px 20px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
  err: { fontSize: '13px', color: '#E24B4A', marginTop: '6px', textAlign: 'center' as const },
}

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [inscrits, setInscrits] = useState<Inscrit[] | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/inscrits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminSecret: secret }),
    })
    if (res.ok) {
      const data = await res.json()
      setInscrits(data.inscrits)
    } else {
      setError('Mot de passe incorrect.')
    }
    setLoading(false)
  }

  const exportExcel = () => {
    if (!inscrits) return
    const rows = [
      ['Prénom', 'Nom', 'Email', 'Téléphone', 'Date', 'Statut'],
      ...inscrits.map(i => [
        i.prenom, i.nom, i.email, i.tel, i.date_label, i.annule ? 'Annulé' : 'Confirmé'
      ])
    ]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inscrits-diner-cjd.csv'
    a.click()
  }

  if (inscrits === null) return (
    <div style={S.page}>
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div style={S.header}>
          <p style={{ fontSize: '36px', margin: 0 }}>🌹</p>
          <h1 style={S.h1}>Espace admin</h1>
          <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Dîner surprise CJD</p>
        </div>
        <input
          style={S.input}
          type="password"
          placeholder="Mot de passe"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
        />
        {error && <p style={S.err}>{error}</p>}
        <button style={S.btn} onClick={load} disabled={loading}>
          {loading ? 'Chargement…' : 'Accéder'}
        </button>
      </div>
    </div>
  )

  const actifs = inscrits.filter(i => !i.annule)
  const annules = inscrits.filter(i => i.annule)

  const parDate: Record<string, Inscrit[]> = {}
  actifs.forEach(i => {
    if (!parDate[i.date_label]) parDate[i.date_label] = []
    parDate[i.date_label].push(i)
  })

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap' as const, gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111', margin: '0 0 4px' }}>🌹 Inscrits — Dîner CJD</h1>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{actifs.length} inscrits actifs · {annules.length} annulations</p>
          </div>
          <button style={S.exportBtn} onClick={exportExcel}>Télécharger CSV</button>
        </div>

        {Object.entries(parDate).map(([date, liste]) => (
          <div key={date} style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid #e8e8e4', marginBottom: '1rem', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e8e8e4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '15px', color: '#111' }}>{date}</span>
              <span style={{ fontSize: '13px', color: liste.length >= 9 ? '#E24B4A' : '#1D9E75', fontWeight: 600 }}>{liste.length} / 9</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8f8f6' }}>
                  {['Prénom', 'Nom', 'Email', 'Téléphone'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left' as const, color: '#888', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liste.map((i, idx) => (
                  <tr key={idx} style={{ borderTop: '0.5px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 16px', color: '#111' }}>{i.prenom}</td>
                    <td style={{ padding: '12px 16px', color: '#111' }}>{i.nom}</td>
                    <td style={{ padding: '12px 16px', color: '#555' }}>{i.email}</td>
                    <td style={{ padding: '12px 16px', color: '#555' }}>{i.tel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {annules.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '12px', border: '0.5px solid #e8e8e4', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e8e8e4' }}>
              <span style={{ fontWeight: 600, fontSize: '15px', color: '#888' }}>Annulations ({annules.length})</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8f8f6' }}>
                  {['Prénom', 'Nom', 'Email', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left' as const, color: '#888', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {annules.map((i, idx) => (
                  <tr key={idx} style={{ borderTop: '0.5px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 16px', color: '#999' }}>{i.prenom}</td>
                    <td style={{ padding: '12px 16px', color: '#999' }}>{i.nom}</td>
                    <td style={{ padding: '12px 16px', color: '#999' }}>{i.email}</td>
                    <td style={{ padding: '12px 16px', color: '#999' }}>{i.date_label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
