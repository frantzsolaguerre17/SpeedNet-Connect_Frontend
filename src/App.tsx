
import { useState, type FormEvent } from 'react'
import {
  inscrireUtilisateur,
  connecterUtilisateur,
} from './services/api'
import type { Utilisateur } from './types/utilisateur'
import AdminDashboard from './pages/admin_dashboard'
import AuthPage from './pages/auth_page'

type Mode = 'inscription' | 'connexion'

function App() {
  const [mode, setMode] = useState<Mode>('inscription')
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null)

  async function gererSoumission(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')
    setErreur(false)
    setChargement(true)

    try {
      if (mode === 'inscription') {
        await inscrireUtilisateur({
          full_name: nom,
          phone: telephone,
          email,
          password: motDePasse,
        })

        setMessage(
          'Compte créé avec succès ! Vous pouvez vous connecter.',
        )
        setMode('connexion')
        setMotDePasse('')
      } else {
        const profil = await connecterUtilisateur({
          phone: telephone,
          password: motDePasse,
        })

        console.log('Réponse de connexion :', profil)
        console.log('Rôle reçu :', profil?.role)

        setUtilisateur(profil)
        setMessage(
          'Connexion réussie ! Bienvenue sur SpeedNetConnect.',
        )
        setMotDePasse('')
      }
    } catch (e) {
      setErreur(true)
      setMessage(
        e instanceof Error ? e.message : 'Une erreur est survenue.',
      )
    } finally {
      setChargement(false)
    }
  }

  function changerMode(nouveauMode: Mode) {
    setMode(nouveauMode)
    setMessage('')
    setErreur(false)
  }

  function deconnecter() {
    setUtilisateur(null)
    setTelephone('')
    setMotDePasse('')
    setMessage('')
    setErreur(false)
    setMode('connexion')
  }

  if (utilisateur?.role === 'admin') {
    return (
      <AdminDashboard
        utilisateur={utilisateur}
        onDeconnecter={deconnecter}
      />
    )
  }

  return (
    <AuthPage
      mode={mode}
      nom={nom}
      telephone={telephone}
      email={email}
      motDePasse={motDePasse}
      message={message}
      erreur={erreur}
      chargement={chargement}
      utilisateur={utilisateur}
      gererSoumission={gererSoumission}
      changerMode={changerMode}
      deconnecter={deconnecter}
      setNom={setNom}
      setTelephone={setTelephone}
      setEmail={setEmail}
      setMotDePasse={setMotDePasse}
    />
  )
}

export default App
