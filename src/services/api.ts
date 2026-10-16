

export type Utilisateur = {
  id: number
  full_name: string
  phone: string
  email: string
  role: string
  status: string
  created_at: string
  updated_at: string
}


const API_URL = 'http://127.0.0.1:8000'

export async function inscrireUtilisateur(donnees: {
  full_name: string
  phone: string
  email: string
  password: string
}) {
  const reponse = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(donnees),
  })

  const resultat = await reponse.json()

  if (!reponse.ok) {
    throw new Error(
      typeof resultat.detail === 'string'
        ? resultat.detail
        : JSON.stringify(resultat.detail),
    )
  }

  return resultat
}


export async function connecterUtilisateur(donnees: {
  phone: string
  password: string
}): Promise<Utilisateur> {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(donnees),
  })

  const resultat = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      typeof resultat?.detail === 'string'
        ? resultat.detail
        : 'Numéro de téléphone ou mot de passe incorrect.'

    throw new Error(message)
  }

  return resultat as Utilisateur
}
