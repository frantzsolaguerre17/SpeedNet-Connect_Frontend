import { useState, type FormEvent } from 'react'
import {
  inscrireUtilisateur,
  connecterUtilisateur,
  type Utilisateur,
} from './services/api'
import AdminDashboard from './pages/admin_dashboard'
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Barre de navigation fixe */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/95 px-6 py-5 shadow-lg backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            type="button"
            onClick={() => changerMode('inscription')}
            className="text-2xl font-bold tracking-tight"
          >
            SpeedNet<span className="text-cyan-400">Connect</span>
          </button>

          <button
            type="button"
            onClick={() =>
              changerMode(
                mode === 'inscription' ? 'connexion' : 'inscription',
              )
            }
            className="rounded-xl border border-white/15 px-4 py-2 text-sm transition hover:bg-white/5"
          >
            {mode === 'inscription' ? 'Se connecter' : 'Créer un compte'}
          </button>
        </nav>
      </header>

      {/* Contenu principal */}
      <main className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-14 pt-32 md:grid-cols-2 md:pb-20 md:pt-40">
        <section>
          <p className="mb-4 font-semibold text-cyan-400">
            VOTRE COMMUNAUTÉ, VOTRE CONNEXION
          </p>

          <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">
            Connectez-vous au
            <span className="block text-cyan-400">
              monde autrement.
            </span>
          </h1>

          <p className="mt-6 max-w-lg leading-7 text-slate-400">
            Rejoignez SpeedNetConnect et profitez d'une plateforme conçue
            pour simplifier les connexions.
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-300">
            <span>⚡ Simple</span>
            <span>🔒 Protégé</span>
            <span>🌐 Connecté</span>
          </div>
        </section>

        {/* Formulaire et profil */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-9">
          {utilisateur && mode === 'connexion' ? (
            <>
              <div className="mb-8">
                <p className="text-sm font-medium text-cyan-400">
                  BIENVENUE SUR SPEEDNETCONNECT
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Votre profil
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Vous êtes connecté avec succès.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
                <p className="text-sm font-medium text-cyan-400">
                  PROFIL UTILISATEUR
                </p>

                <h3 className="mt-3 text-xl font-bold">
                  {utilisateur.full_name}
                </h3>

                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p>
                    <span className="text-slate-500">Téléphone :</span>{' '}
                    {utilisateur.phone}
                  </p>

                  <p>
                    <span className="text-slate-500">E-mail :</span>{' '}
                    {utilisateur.email}
                  </p>

                  <p>
                    <span className="text-slate-500">Rôle :</span>{' '}
                    {utilisateur.role}
                  </p>

                  <p>
                    <span className="text-slate-500">Statut :</span>{' '}
                    {utilisateur.status}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={deconnecter}
                  className="mt-5 rounded-xl border border-white/15 px-4 py-2 text-sm transition hover:bg-white/5"
                >
                  Déconnexion
                </button>
              </div>

              {message && (
                <div
                  role={erreur ? 'alert' : 'status'}
                  className={`mt-5 rounded-xl border p-3 text-sm ${
                    erreur
                      ? 'border-red-500/30 bg-red-500/10 text-red-300'
                      : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                  }`}
                >
                  {message}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-sm font-medium text-cyan-400">
                  BIENVENUE SUR SPEEDNETCONNECT
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  {mode === 'inscription'
                    ? 'Créer un compte'
                    : 'Bon retour !'}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {mode === 'inscription'
                    ? 'Remplissez les informations ci-dessous.'
                    : 'Connectez-vous avec votre numéro de téléphone.'}
                </p>
              </div>

              <form onSubmit={gererSoumission} className="space-y-5">
                {mode === 'inscription' && (
                  <>
                    <div>
                      <label
                        htmlFor="nom"
                        className="mb-2 block text-sm"
                      >
                        Nom complet
                      </label>

                      <input
                        id="nom"
                        type="text"
                        required
                        autoComplete="name"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        placeholder="Votre nom complet"
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none transition focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-sm"
                      >
                        Adresse e-mail
                      </label>

                      <input
                        id="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vous@exemple.com"
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none transition focus:border-cyan-400"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label
                    htmlFor="telephone"
                    className="mb-2 block text-sm"
                  >
                    Numéro de téléphone
                  </label>

                  <input
                    id="telephone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="Votre numéro de téléphone"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none transition focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="motDePasse"
                    className="mb-2 block text-sm"
                  >
                    Mot de passe
                  </label>

                  <input
                    id="motDePasse"
                    type="password"
                    required
                    autoComplete={
                      mode === 'inscription'
                        ? 'new-password'
                        : 'current-password'
                    }
                    minLength={
                      mode === 'inscription' ? 8 : undefined
                    }
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none transition focus:border-cyan-400"
                  />

                  {mode === 'inscription' && (
                    <p className="mt-2 text-xs text-slate-500">
                      8 caractères minimum.
                    </p>
                  )}
                </div>

                {message && (
                  <div
                    role={erreur ? 'alert' : 'status'}
                    className={`rounded-xl border p-3 text-sm ${
                      erreur
                        ? 'border-red-500/30 bg-red-500/10 text-red-300'
                        : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'
                    }`}
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={chargement}
                  className="w-full rounded-xl bg-cyan-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {chargement
                    ? 'Veuillez patienter...'
                    : mode === 'inscription'
                      ? 'Créer mon compte'
                      : 'Se connecter'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                {mode === 'inscription'
                  ? 'Vous avez déjà un compte ?'
                  : 'Vous n’avez pas encore de compte ?'}{' '}

                <button
                  type="button"
                  onClick={() =>
                    changerMode(
                      mode === 'inscription'
                        ? 'connexion'
                        : 'inscription',
                    )
                  }
                  className="font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  {mode === 'inscription'
                    ? 'Se connecter'
                    : 'S’inscrire'}
                </button>
              </p>
            </>
          )}
        </section>
      </main>

      <footer className="border-t border-white/10 px-6 py-5 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} SpeedNetConnect. Tous droits réservés.
      </footer>
    </div>
  )
}

export default App
