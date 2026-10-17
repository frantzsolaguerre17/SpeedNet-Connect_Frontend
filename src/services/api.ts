import type { Utilisateur } from '../types/utilisateur'

export type { Utilisateur } from '../types/utilisateur'

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

  // Vérifier que le backend a bien renvoyé l'utilisateur
  if (!resultat?.user || !resultat?.access_token) {
    throw new Error('Réponse de connexion invalide.')
  }

  // Enregistrer le jeton pour les futures requêtes protégées
  localStorage.setItem('access_token', resultat.access_token)

  // Retourner l'utilisateur, pas l'objet complet de connexion
  return resultat.user as Utilisateur
}

