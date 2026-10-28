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


export async function listerClients(): Promise<Utilisateur[]> {
  const token = localStorage.getItem('access_token')

  if (!token) {
    throw new Error('Tu dois te connecter en tant qu’administrateur.')
  }

  const response = await fetch(`${API_URL}/users/admin/clients`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const resultat = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      typeof resultat?.detail === 'string'
        ? resultat.detail
        : 'Impossible de charger les comptes clients.',
    )
  }

  return resultat as Utilisateur[]
}

export async function creerCompteAdmin(donnees: {
  full_name: string
  phone: string
  email: string
  password: string
  role: 'user' | 'admin'
}): Promise<Utilisateur> {
  const token = localStorage.getItem('access_token')

  if (!token) {
    throw new Error('Tu dois te connecter en tant qu’administrateur.')
  }

  const response = await fetch(`${API_URL}/users/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(donnees),
  })

  const resultat = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      typeof resultat?.detail === 'string'
        ? resultat.detail
        : 'Impossible de créer le compte.',
    )
  }

  return resultat as Utilisateur
}





export async function listerTousLesComptes(): Promise<Utilisateur[]> {
  const token = localStorage.getItem('access_token')

  if (!token) {
    throw new Error('Tu dois te connecter en tant qu’administrateur.')
  }

  const response = await fetch(`${API_URL}/users/admin/users`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const resultat = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      typeof resultat?.detail === 'string'
        ? resultat.detail
        : 'Impossible de charger tous les comptes.',
    )
  }

  return resultat as Utilisateur[]
}




export type RechargeResponse = {
  message: string
  user_id: number
  balance: string | number
  currency: string
}

export async function rechargerCompte(
  userId: number,
  amount: string,
): Promise<RechargeResponse> {
  const token = localStorage.getItem('access_token')

  if (!token) {
    throw new Error('Tu dois te connecter en tant qu’administrateur.')
  }

  const response = await fetch(
    `${API_URL}/users/admin/users/${userId}/recharge`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    },
  )

  const resultat = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      typeof resultat?.detail === 'string'
        ? resultat.detail
        : 'Impossible d’effectuer la recharge.',
    )
  }

  return resultat as RechargeResponse
}




export type ForfaitWifi = {
  id: number
  name: string
  duration_hours: number
  price: string | number
  currency: string
  description: string | null
  status: string
}


export type CodeWifi = {
  id: number
  code: string
  status: string
  plan_id: number
  plan_name: string
  created_at: string | null
  sold_at?: string | null
  buyer_name?: string | null
  buyer_phone?: string | null
}



function obtenirTokenAdmin(): string {
  const token = localStorage.getItem('access_token')

  if (!token) {
    throw new Error('Tu dois te connecter en tant qu’administrateur.')
  }

  return token
}

async function lireReponse<T>(response: Response): Promise<T> {
  const resultat = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      typeof resultat?.detail === 'string'
        ? resultat.detail
        : 'Une erreur est survenue lors de la requête.',
    )
  }

  return resultat as T
}

// Charger les forfaits Wi-Fi
export async function listerForfaitsWifi(): Promise<ForfaitWifi[]> {
  const response = await fetch(`${API_URL}/wifi/plans`)
  return lireReponse<ForfaitWifi[]>(response)
}

// Créer un forfait Wi-Fi
export async function creerForfaitWifi(donnees: {
  name: string
  duration_hours: number
  price: number
  currency: string
  description: string
}) {
  const token = obtenirTokenAdmin()

  const response = await fetch(`${API_URL}/wifi/admin/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(donnees),
  })

  return lireReponse<ForfaitWifi>(response)
}

// Ajouter UN SEUL code à un forfait existant
export async function ajouterCodeWifi(
  planId: number,
  code: string,
) {
  const token = obtenirTokenAdmin()

  const response = await fetch(`${API_URL}/wifi/admin/codes/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      plan_id: planId,
      codes: [code.trim()],
    }),
  })

  return lireReponse<unknown>(response)
}




export async function listerTousLesCodesWifi(): Promise<CodeWifi[]> {
  const token = obtenirTokenAdmin()

  const response = await fetch(`${API_URL}/wifi/admin/codes`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await lireReponse<CodeWifi[]>(response)

  console.log('Codes Wi-Fi reçus du backend :', data)

  return data
}



export type StatistiquesAdmin = {
  clients_inscrits: number
  ventes_du_jour: string | number
  codes_disponibles: number
  plans_disponibles: number
}

export async function listerStatistiquesAdmin(): Promise<StatistiquesAdmin> {
  const token = obtenirTokenAdmin()

  const response = await fetch(`${API_URL}/users/admin/stats`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return lireReponse<StatistiquesAdmin>(response)
}





export type Portefeuille = {
  balance: string | number
  currency: string
}

export type TransactionPortefeuille = {
  id: string | number
  type: 'recharge' | 'achat_wifi' | 'transfer_out' | 'transfer_in' | string
  description: string
  amount: string | number
  currency: string
  date: string
  balance_after: string | number | null
}

export type TransferResponse = {
  message: string
  recipient_phone: string
  amount: string | number
  balance: string | number
  currency: string
}



export type TransactionAdmin = {
  id: string;
  type: string;
  description: string;
  amount: string;
  currency: string;
  date: string;
  balance_after: string | null;
  user_name: string;
  user_phone: string;
};

export async function listerTransactionsRecentesAdmin(): Promise<TransactionAdmin[]> {
  const token = obtenirTokenAdmin();

  const reponse = await fetch(
    `${API_URL}/users/admin/transactions/recentes`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return lireReponse<TransactionAdmin[]>(reponse);
}


// Récupérer le portefeuille du client connecté
export async function obtenirMonPortefeuille(): Promise<Portefeuille> {
  const token = localStorage.getItem('access_token')

  if (!token) {
    throw new Error('Tu dois te connecter pour consulter ton portefeuille.')
  }

  const response = await fetch(`${API_URL}/users/me/wallet`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return lireReponse<Portefeuille>(response)
}

// Récupérer l'historique du client connecté
export async function listerMesTransactions(): Promise<TransactionPortefeuille[]> {
  const token = localStorage.getItem('access_token')

  if (!token) {
    throw new Error('Tu dois te connecter pour consulter tes transactions.')
  }

  const response = await fetch(`${API_URL}/users/me/transactions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return lireReponse<TransactionPortefeuille[]>(response)
}

// Transférer de l'argent à un autre client par son numéro de téléphone
export async function transfererArgent(donnees: {
  phone: string
  amount: string
}): Promise<TransferResponse> {
  const token = localStorage.getItem('access_token')

  if (!token) {
    throw new Error('Tu dois te connecter pour effectuer un transfert.')
  }

  const response = await fetch(`${API_URL}/users/me/transfer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      phone: donnees.phone.trim(),
      amount: donnees.amount,
    }),
  })

  return lireReponse<TransferResponse>(response)
}
