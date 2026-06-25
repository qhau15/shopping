import { redirect } from 'next/navigation'

export default function AdminIndex() {
  redirect('/tmt/admin/products')
}
