

export type Utilisateur = {
  id: number
  full_name: string
  phone: string
  email: string
  role: 'admin' | 'user'
  status: string
  created_at: string
  updated_at: string
}
