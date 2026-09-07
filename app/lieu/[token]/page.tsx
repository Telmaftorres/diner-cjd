import { Suspense } from 'react'
import LieuForm from './LieuForm'

export const metadata = { title: 'Renseigner le lieu — Dîner confidentiel' }

export default function Page() {
  return <Suspense><LieuForm /></Suspense>
}
