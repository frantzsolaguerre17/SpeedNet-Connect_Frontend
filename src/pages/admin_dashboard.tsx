
import { useEffect, useState } from 'react'
import {
  creerCompteAdmin,
  listerTousLesComptes,
} from '../services/api'
import type { Utilisateur } from '../types/utilisateur'

type Props = {
  utilisateur: Utilisateur
  onDeconnecter: () => void
}

const statistiques = [
  {
    titre: 'Clients inscrits',
    valeur: '—',
    icone: 'users',
    description: 'Nombre total de clients',
  },
  {
    titre: 'Ventes du jour',
    valeur: '— HTG',
    icone: 'wallet',
    description: 'Commandes confirmées aujourd’hui',
  },
  {
    titre: 'Codes disponibles',
    valeur: '—',
    icone: 'ticket',
    description: 'Codes Wi-Fi en stock',
  },
  {
    titre: 'Recharges en attente',
    valeur: '—',
    icone: 'clock',
    description: 'Recharges à vérifier',
  },
]

const navigation = [
  { titre: 'Vue d’ensemble', icone: '▦' },
  { titre: 'Comptes', icone: '♙' },
  { titre: 'Portefeuilles', icone: '◈' },
  { titre: 'Recharges', icone: '↗' },
  { titre: 'Forfaits Wi-Fi', icone: '◇' },
  { titre: 'Codes Wi-Fi', icone: '▤' },
  { titre: 'Commandes', icone: '≡' },
]

export default function AdminDashboard({
  utilisateur,
  onDeconnecter,
}: Props) {
  const [sidebarReduit, setSidebarReduit] = useState(false)
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false)
  const [sectionActive, setSectionActive] =
    useState('Vue d’ensemble')
    
const [clients, setClients] = useState<Utilisateur[]>([])
const [chargementClients, setChargementClients] = useState(false)
const [erreurClients, setErreurClients] = useState('')
const [messageClients, setMessageClients] = useState('')
const [formulaireOuvert, setFormulaireOuvert] = useState(false)
const [creationEnCours, setCreationEnCours] = useState(false)

const [nomClient, setNomClient] = useState('')
const [telephoneClient, setTelephoneClient] = useState('')
const [emailClient, setEmailClient] = useState('')
const [motDePasseClient, setMotDePasseClient] = useState('')
const [roleClient, setRoleClient] = useState<'user' | 'admin'>('user')

useEffect(() => {
  if (sectionActive !== 'Comptes') return

  let actif = true

  async function chargerClients() {
    setChargementClients(true)
    setErreurClients('')

    try {
      const resultat = await listerTousLesComptes()
      if (actif) {
        setClients(resultat)
      }
    } catch (erreur) {
      if (actif) {
        setErreurClients(
          erreur instanceof Error
            ? erreur.message
            : 'Impossible de charger les clients.',
        )
      }
    } finally {
      if (actif) setChargementClients(false)
    }
  }

  void chargerClients()

  return () => {
    actif = false
  }
}, [sectionActive])


  function choisirSection(titre: string) {
    setSectionActive(titre)
    setMenuMobileOuvert(false)
  }


async function gererCreationCompte(
  e: React.FormEvent<HTMLFormElement>,
) {
  e.preventDefault()
  setErreurClients('')
  setMessageClients('')
  setCreationEnCours(true)

  try {
    await creerCompteAdmin({
      full_name: nomClient,
      phone: telephoneClient,
      email: emailClient,
      password: motDePasseClient,
      role: roleClient,
    })

    const resultat = await listerTousLesComptes()
    setClients(resultat)
    setMessageClients(
      roleClient === 'admin'
        ? 'Compte administrateur créé avec succès.'
        : 'Compte client créé avec succès.',
    )

    setNomClient('')
    setTelephoneClient('')
    setEmailClient('')
    setMotDePasseClient('')
    setRoleClient('user')
    setFormulaireOuvert(false)
  } catch (erreur) {
    setErreurClients(
      erreur instanceof Error
        ? erreur.message
        : 'Impossible de créer le compte.',
    )
  } finally {
    setCreationEnCours(false)
  }
}


  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Fond du menu mobile */}
      {menuMobileOuvert && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setMenuMobileOuvert(false)}
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
        />
      )}

      {/* Sidebar fixe à gauche */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-slate-950 transition-all duration-300 ${
          sidebarReduit ? 'w-[76px]' : 'w-64'
        } ${
          menuMobileOuvert
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div
          className={`flex h-[82px] shrink-0 items-center border-b border-white/10 ${
            sidebarReduit ? 'justify-center px-2' : 'justify-between px-5'
          }`}
        >
          {sidebarReduit ? (
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-xl font-extrabold text-cyan-400"
              title="SpeedNetConnect"
            >
              S
            </div>
          ) : (
            <>
              <div className="min-w-0">
                <h1 className="whitespace-nowrap text-xl font-extrabold tracking-tight">
                  SpeedNet
                  <span className="text-cyan-400">Connect</span>
                </h1>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Administration
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSidebarReduit(true)}
                aria-label="Réduire le menu"
                className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-cyan-400 md:block"
              >
                ‹
              </button>
            </>
          )}
        </div>

        {/* Bouton pour réouvrir le menu réduit */}
        {sidebarReduit && (
          <button
            type="button"
            onClick={() => setSidebarReduit(false)}
            aria-label="Agrandir le menu"
            className="mx-auto mt-4 hidden rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-cyan-400 md:block"
          >
            ›
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {!sidebarReduit && (
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Menu principal
            </p>
          )}

          {navigation.map((item, index) => {
            const actif = sectionActive === item.titre

            return (
              <button
                key={item.titre}
                type="button"
                title={sidebarReduit ? item.titre : undefined}
                onClick={() => choisirSection(item.titre)}
                className={`group relative flex w-full items-center rounded-xl py-3 text-sm transition-all duration-200 ${
                  sidebarReduit
                    ? 'justify-center px-2'
                    : 'gap-3 px-3'
                } ${
                  actif
                    ? 'border border-cyan-400/20 bg-cyan-400/10 font-semibold text-cyan-300 shadow-sm shadow-cyan-950/30'
                    : 'border border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {actif && (
                  <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-cyan-400" />
                )}

                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg ${
                    actif
                      ? 'bg-cyan-400/10 text-cyan-300'
                      : 'text-slate-400 group-hover:text-white'
                  }`}
                >
                  {item.icone}
                </span>

                {!sidebarReduit && (
                  <>
                    <span className="flex-1 text-left">
                      {item.titre}
                    </span>
                    {index === 3 && (
                      <span className="rounded-md bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        À suivre
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bloc administrateur en bas */}
        <div className="shrink-0 border-t border-white/10 p-3">
          {!sidebarReduit && (
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 font-bold text-cyan-300">
                {utilisateur.full_name
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {utilisateur.full_name}
                </p>
                <p className="mt-1 text-xs text-cyan-400">
                  Administrateur
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            title={sidebarReduit ? 'Paramètres' : undefined}
            onClick={() => choisirSection('Paramètres')}
            className={`mb-1 flex w-full items-center rounded-xl py-3 text-sm transition hover:bg-white/5 hover:text-white ${
              sidebarReduit ? 'justify-center px-2' : 'gap-3 px-3'
            } ${
              sectionActive === 'Paramètres'
                ? 'bg-cyan-400/10 text-cyan-300'
                : 'text-slate-400'
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center text-lg">
              ⚙
            </span>
            {!sidebarReduit && <span>Paramètres</span>}
          </button>

          <button
            type="button"
            title={sidebarReduit ? 'Déconnexion' : undefined}
            onClick={onDeconnecter}
            className={`flex w-full items-center rounded-xl py-3 text-sm text-red-300 transition hover:bg-red-400/10 hover:text-red-200 ${
              sidebarReduit ? 'justify-center px-2' : 'gap-3 px-3'
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center text-lg">
              ↪
            </span>
            {!sidebarReduit && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Zone principale : décalée selon la largeur du sidebar */}
      <div
        className={`min-h-screen transition-[padding] duration-300 ${
          sidebarReduit ? 'md:pl-[76px]' : 'md:pl-64'
        }`}
      >
        {/* Barre supérieure */}
        <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuMobileOuvert(true)}
              aria-label="Ouvrir le menu"
              className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300 md:hidden"
            >
              ☰
            </button>

            <div className="min-w-0">
              <p className="truncate text-xs text-slate-500">
                Administration / {sectionActive}
              </p>
              <h2 className="mt-1 truncate text-lg font-bold sm:text-xl">
                {sectionActive}
              </h2>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-48 truncate text-sm font-semibold">
                {utilisateur.full_name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Espace administrateur
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 font-bold text-cyan-300">
              {utilisateur.full_name
                .trim()
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {sectionActive === 'Vue d’ensemble' ? (
            <>
              <div className="mb-8">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Tableau de bord
                </p>

                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
                  Bonjour, {utilisateur.full_name} !
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Bienvenue dans votre espace de gestion
                  SpeedNetConnect. Retrouvez ici un aperçu de votre
                  activité.
                </p>
              </div>

              {/* Statistiques */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {statistiques.map((stat) => (
                  <article
                    key={stat.titre}
                    className="group rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-900"
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-400">
                        {stat.titre}
                      </span>

                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/10 text-xl">
                        {stat.icone === 'users' && '👥'}
                        {stat.icone === 'wallet' && '💰'}
                        {stat.icone === 'ticket' && '🎟️'}
                        {stat.icone === 'clock' && '⏳'}
                      </span>
                    </div>

                    <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                      {stat.valeur}
                    </p>

                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      {stat.description}
                    </p>
                  </article>
                ))}
              </div>

              {/* Activité récente */}
              <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-5 sm:px-6">
                  <div>
                    <h3 className="text-lg font-bold">
                      Activité récente
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Suivi des opérations de la plateforme
                    </p>
                  </div>

                  <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/5 px-3 py-2 text-xs font-semibold text-cyan-300">
                    En préparation
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-5 py-12 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl">
                      ↗
                    </div>

                    <h4 className="font-semibold text-slate-200">
                      Vos transactions apparaîtront ici
                    </h4>

                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Les commandes, les ventes et les recharges seront
                      affichées ici après connexion aux routes de votre
                      backend FastAPI.
                    </p>
                  </div>
                </div>
              </section>
            </>
                   ) : sectionActive === 'Comptes' ? (
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                    Gestion des comptes
                  </p>
                  <h1 className="text-2xl font-extrabold sm:text-3xl">
                    Comptes clients
                  </h1>
                  <p className="mt-2 text-sm text-slate-400">
                    {clients.length} compte(s) chargé(s).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFormulaireOuvert(!formulaireOuvert)}
                  className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300"
                >
                  {formulaireOuvert ? 'Annuler' : '+ Créer un compte'}
                </button>
              </div>

              {messageClients && (
                <p className="rounded-xl bg-emerald-400/10 p-4 text-sm text-emerald-300">
                  {messageClients}
                </p>
              )}

              {erreurClients && (
                <p role="alert" className="rounded-xl bg-red-400/10 p-4 text-sm text-red-300">
                  {erreurClients}
                </p>
              )}

              {formulaireOuvert && (
                <form
                  onSubmit={gererCreationCompte}
                  className="grid gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:grid-cols-2"
                >
                  <label className="text-sm text-slate-300">
                    Nom complet
                    <input
                      required
                      value={nomClient}
                      onChange={(e) => setNomClient(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                    />
                  </label>

                  <label className="text-sm text-slate-300">
                    Téléphone
                    <input
                      required
                      value={telephoneClient}
                      onChange={(e) => setTelephoneClient(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                    />
                  </label>

                  <label className="text-sm text-slate-300">
                    E-mail
                    <input
                      required
                      type="email"
                      value={emailClient}
                      onChange={(e) => setEmailClient(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                    />
                  </label>

                  <label className="text-sm text-slate-300">
                    Mot de passe
                    <input
                      required
                      type="password"
                      minLength={8}
                      value={motDePasseClient}
                      onChange={(e) => setMotDePasseClient(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                    />
                  </label>

                  <label className="text-sm text-slate-300 sm:col-span-2">
                    Type de compte
                    <select
                      value={roleClient}
                      onChange={(e) =>
                        setRoleClient(e.target.value as 'user' | 'admin')
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                    >
                      <option value="user">Client</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </label>

                  <button
                    type="submit"
                    disabled={creationEnCours}
                    className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-50 sm:col-span-2"
                  >
                    {creationEnCours ? 'Création en cours…' : 'Créer le compte'}
                  </button>
                </form>
              )}

              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/40">
                {chargementClients ? (
                  <p className="p-6 text-slate-400">Chargement des clients…</p>
                ) : (
                  
<table className="w-full min-w-[900px] text-left text-sm">
  <thead className="bg-white/[0.03] text-slate-400">
    <tr>
      <th className="p-4">Nom</th>
      <th className="p-4">Téléphone</th>
      <th className="p-4">E-mail</th>
      <th className="p-4">Rôle</th>
      <th className="p-4">Statut</th>
      <th className="p-4">Date de création</th>
    </tr>
  </thead>

  <tbody className="divide-y divide-white/5">
    {clients.map((client) => (
      <tr key={client.id}>
        <td className="p-4">{client.full_name}</td>
        <td className="p-4">{client.phone}</td>
        <td className="p-4">{client.email}</td>
        <td className="p-4">
          <span
            className={
              client.role === 'admin'
                ? 'rounded-lg bg-cyan-400/10 px-2 py-1 text-cyan-300'
                : 'rounded-lg bg-white/5 px-2 py-1 text-slate-300'
            }
          >
            {client.role === 'admin' ? 'Administrateur' : 'Client'}
          </span>
        </td>
        <td className="p-4">{client.status}</td>
        <td className="p-4">
          {client.created_at
            ? new Date(client.created_at).toLocaleDateString('fr-FR')
            : '—'}
        </td>
      </tr>
    ))}
  </tbody>
</table>

                )}

                {!chargementClients && clients.length === 0 && (
                  <p className="p-5 text-sm text-slate-400">
                    Aucun compte à afficher.
                  </p>
                )}
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                Gestion SpeedNetConnect
              </p>

              <h1 className="text-2xl font-extrabold sm:text-3xl">
                {sectionActive}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Cette section est prête à être développée. Nous pourrons
                ensuite la connecter aux données réelles de PostgreSQL
                via FastAPI.
              </p>

              <button
                type="button"
                onClick={() => choisirSection('Vue d’ensemble')}
                className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Retour au tableau de bord
              </button>
            </section>
          )}
        </main>

        <footer className="border-t border-white/10 px-6 py-5 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} SpeedNetConnect. Tous droits réservés.
        </footer>
      </div>
    </div>
  )
}
