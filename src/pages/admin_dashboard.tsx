
import {
  creerCompteAdmin,
  listerTousLesComptes,
  rechargerCompte,
  listerForfaitsWifi,
  creerForfaitWifi,
  ajouterCodeWifi,
  listerTousLesCodesWifi,
  listerStatistiquesAdmin,
} from '../services/api'

import type {
  ForfaitWifi,
  Utilisateur,
  CodeWifi,
} from '../services/api'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'

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
    titre: 'Plans disponibles',
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
  const [motDePasseClient, setMotDePasseClient] = useState('')
  const [roleClient, setRoleClient] = useState<'user' | 'admin'>('user')

  const [clientARecharger, setClientARecharger] =
    useState<Utilisateur | null>(null)
  const [montantRecharge, setMontantRecharge] = useState('')
  const [rechargeEnCours, setRechargeEnCours] = useState(false)

// Gestion des forfaits Wi-Fi
const [forfaitsWifi, setForfaitsWifi] = useState<ForfaitWifi[]>([])
const [chargementForfaits, setChargementForfaits] = useState(false)
const [erreurWifi, setErreurWifi] = useState('')
const [messageWifi, setMessageWifi] = useState('')
const [creationForfaitEnCours, setCreationForfaitEnCours] = useState(false)
const [ajoutCodeEnCours, setAjoutCodeEnCours] = useState(false)

const [nomForfait, setNomForfait] = useState('')
const [dureeForfait, setDureeForfait] = useState('1')
const [prixForfait, setPrixForfait] = useState('')
const [descriptionForfait, setDescriptionForfait] = useState('')

const [forfaitCodeId, setForfaitCodeId] = useState('')
const [nouveauCodeWifi, setNouveauCodeWifi] = useState('')
const [codesWifi, setCodesWifi] = useState<CodeWifi[]>([])
const [chargementCodesWifi, setChargementCodesWifi] = useState(false)
const [filtreCodesWifi, setFiltreCodesWifi] = useState<
  'TOUS' | 'DISPONIBLE' | 'VENDU'
>('TOUS')

const [pageCodesWifi, setPageCodesWifi] = useState(1)
const codesParPage = 10


const [statsAdmin, setStatsAdmin] = useState({
  clients_inscrits: 0,
  ventes_du_jour: '0.00',
  codes_disponibles: 0,
  plans_disponibles: 0,
})

const [chargementStats, setChargementStats] = useState(true)
const [erreurStats, setErreurStats] = useState('')

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
        if (actif) {
          setChargementClients(false)
        }
      }
    }

    void chargerClients()

    return () => {
      actif = false
    }
  }, [sectionActive])



  useEffect(() => {
  let actif = true

  async function chargerStatistiques() {
    try {
      setChargementStats(true)
      setErreurStats('')

      const resultat = await listerStatistiquesAdmin()

      if (actif) {
        setStatsAdmin(resultat)
      }
    } catch (erreur) {
      if (actif) {
        setErreurStats(
          erreur instanceof Error
            ? erreur.message
            : 'Impossible de charger les statistiques.',
        )
      }
    } finally {
      if (actif) {
        setChargementStats(false)
      }
    }
  }

  void chargerStatistiques()

  return () => {
    actif = false
  }
}, [])

  useEffect(() => {
  if (
    sectionActive !== 'Forfaits Wi-Fi' &&
    sectionActive !== 'Codes Wi-Fi'
  ) {
    return
  }

  let actif = true

  async function chargerForfaits() {
    setChargementForfaits(true)
    setErreurWifi('')

    try {
      const resultat = await listerForfaitsWifi()

      if (actif) {
        setForfaitsWifi(resultat)

        if (
          resultat.length > 0 &&
          !resultat.some(
            (forfait) => String(forfait.id) === forfaitCodeId,
          )
        ) {
          setForfaitCodeId(String(resultat[0].id))
        }
      }
    } catch (erreur) {
      if (actif) {
        setErreurWifi(
          erreur instanceof Error
            ? erreur.message
            : 'Impossible de charger les forfaits Wi-Fi.',
        )
      }
    } finally {
      if (actif) setChargementForfaits(false)
    }
  }

  void chargerForfaits()

  return () => {
    actif = false
  }
}, [sectionActive])


useEffect(() => {
  if (sectionActive !== 'Codes Wi-Fi') return

  let actif = true

  async function chargerCodes() {
    setChargementCodesWifi(true)

    try {
      const resultat = await listerTousLesCodesWifi()

      if (actif) {
        setCodesWifi(resultat)
        setErreurWifi('')
      }
    } catch (erreur) {
      if (actif) {
        setErreurWifi(
          erreur instanceof Error
            ? erreur.message
            : 'Impossible de charger les codes Wi-Fi.',
        )
      }
    } finally {
      if (actif) setChargementCodesWifi(false)
    }
  }

  void chargerCodes()

  return () => {
    actif = false
  }
}, [sectionActive])

  function choisirSection(titre: string) {
    setSectionActive(titre)
    setMenuMobileOuvert(false)
  }

  async function gererCreationCompte(
    e: FormEvent<HTMLFormElement>,
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

  async function gererRecharge(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!clientARecharger) return

    const montant = montantRecharge.trim()

    if (
      !montant ||
      !Number.isFinite(Number(montant)) ||
      Number(montant) <= 0
    ) {
      setErreurClients(
        'Saisis un montant valide supérieur à 0 HTG.',
      )
      return
    }

    setErreurClients('')
    setMessageClients('')
    setRechargeEnCours(true)

    try {
      const resultat = await rechargerCompte(
        clientARecharger.id,
        montant,
      )

      setMessageClients(
        `Recharge réussie pour ${clientARecharger.full_name}. Nouveau solde : ${resultat.balance} ${resultat.currency}.`,
      )

      setClientARecharger(null)
      setMontantRecharge('')
    } catch (erreur) {
      setErreurClients(
        erreur instanceof Error
          ? erreur.message
          : 'Impossible d’effectuer la recharge.',
      )
    } finally {
      setRechargeEnCours(false)
    }
  }


  async function gererCreationForfait(
  e: FormEvent<HTMLFormElement>,
) {
  e.preventDefault()
  setErreurWifi('')
  setMessageWifi('')

  const prix = Number(prixForfait)
  const duree = Number(dureeForfait)

  if (!Number.isFinite(prix) || prix <= 0) {
    setErreurWifi('Le prix doit être supérieur à zéro.')
    return
  }

  if (!Number.isInteger(duree) || duree <= 0) {
    setErreurWifi('La durée doit être un nombre entier positif.')
    return
  }

  setCreationForfaitEnCours(true)

  try {
    const resultat = await creerForfaitWifi({
      name: nomForfait.trim(),
      duration_hours: duree,
      price: prix,
      currency: 'HTG',
      description: descriptionForfait.trim(),
    })

    const liste = await listerForfaitsWifi()
    setForfaitsWifi(liste)
    setForfaitCodeId(String(resultat.id))

    setNomForfait('')
    setDureeForfait('1')
    setPrixForfait('')
    setDescriptionForfait('')

    setMessageWifi('Forfait Wi-Fi créé avec succès.')
  } catch (erreur) {
    setErreurWifi(
      erreur instanceof Error
        ? erreur.message
        : 'Impossible de créer le forfait.',
    )
  } finally {
    setCreationForfaitEnCours(false)
  }
}

async function gererAjoutCode(e: FormEvent<HTMLFormElement>) {
  e.preventDefault()
  setErreurWifi('')
  setMessageWifi('')

  const code = nouveauCodeWifi.trim()
  const planId = Number(forfaitCodeId)

  if (!forfaitCodeId || !Number.isInteger(planId)) {
    setErreurWifi('Sélectionne un forfait Wi-Fi.')
    return
  }

  if (!code) {
    setErreurWifi('Saisis un code Wi-Fi.')
    return
  }

  setAjoutCodeEnCours(true)

  try {
   await ajouterCodeWifi(planId, code)

setNouveauCodeWifi('')
await actualiserCodesWifi()

setMessageWifi('Code Wi-Fi ajouté avec succès.')
  } catch (erreur) {
    setErreurWifi(
      erreur instanceof Error
        ? erreur.message
        : 'Impossible d’ajouter le code Wi-Fi.',
    )
  } finally {
    setAjoutCodeEnCours(false)
  }
}



async function actualiserCodesWifi() {
  setChargementCodesWifi(true)
  setErreurWifi('')

  try {
    const resultat = await listerTousLesCodesWifi()
    setCodesWifi(resultat)
  } catch (erreur) {
    setErreurWifi(
      erreur instanceof Error
        ? erreur.message
        : 'Impossible de charger les codes Wi-Fi.',
    )
  } finally {
    setChargementCodesWifi(false)
  }
}

const codesFiltresWifi = codesWifi.filter((code) => {
  const statut = code.status.toUpperCase()

  if (filtreCodesWifi === 'TOUS') return true

  if (filtreCodesWifi === 'DISPONIBLE') {
    return statut === 'AVAILABLE' || statut === 'DISPONIBLE'
  }

  return statut === 'SOLD' || statut === 'VENDU'
})

const totalPagesCodesWifi = Math.max(
  1,
  Math.ceil(codesFiltresWifi.length / codesParPage),
)

const codesAffichesWifi = codesFiltresWifi.slice(
  (pageCodesWifi - 1) * codesParPage,
  pageCodesWifi * codesParPage,
)

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
                {utilisateur.full_name.trim().charAt(0).toUpperCase()}
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

      {/* Zone principale */}
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
              {utilisateur.full_name.trim().charAt(0).toUpperCase()}
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
                      {chargementStats
  ? '…'
  : stat.titre === 'Clients inscrits'
    ? statsAdmin.clients_inscrits.toLocaleString('fr-FR')
    : stat.titre === 'Ventes du jour'
      ? `${Number(statsAdmin.ventes_du_jour).toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} HTG`
      : stat.titre === 'Codes disponibles'
        ? statsAdmin.codes_disponibles.toLocaleString('fr-FR')
        : statsAdmin.plans_disponibles.toLocaleString('fr-FR')
        }
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
                  {formulaireOuvert
                    ? 'Annuler'
                    : '+ Créer un compte'}
                </button>
              </div>

              {messageClients && (
                <p className="rounded-xl bg-emerald-400/10 p-4 text-sm text-emerald-300">
                  {messageClients}
                </p>
              )}

              {erreurClients && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-400/10 p-4 text-sm text-red-300"
                >
                  {erreurClients}
                </p>
              )}

              {/* Formulaire de recharge */}
              {clientARecharger && (
                <form
                  onSubmit={gererRecharge}
                  className="rounded-2xl border border-cyan-400/20 bg-slate-900/60 p-5"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">
                        Recharger le portefeuille
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Client : {clientARecharger.full_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Téléphone : {clientARecharger.phone}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setClientARecharger(null)
                        setMontantRecharge('')
                        setErreurClients('')
                      }}
                      className="rounded-lg px-3 py-2 text-slate-400 hover:bg-white/5 hover:text-white"
                    >
                      Annuler
                    </button>
                  </div>

                  <label className="block text-sm text-slate-300">
                    Montant de la recharge (HTG)
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={montantRecharge}
                      onChange={(e) =>
                        setMontantRecharge(e.target.value)
                      }
                      placeholder="Ex. : 500"
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 sm:max-w-md"
                    />
                  </label>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={rechargeEnCours}
                      className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
                    >
                      {rechargeEnCours
                        ? 'Recharge en cours…'
                        : 'Confirmer la recharge'}
                    </button>

                    <button
                      type="button"
                      disabled={rechargeEnCours}
                      onClick={() => {
                        setClientARecharger(null)
                        setMontantRecharge('')
                      }}
                      className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {/* Formulaire de création de compte */}
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
                      onChange={(e) =>
                        setTelephoneClient(e.target.value)
                      }
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
                      onChange={(e) =>
                        setMotDePasseClient(e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
                    />
                  </label>

                  <label className="text-sm text-slate-300 sm:col-span-2">
                    Type de compte
                    <select
                      value={roleClient}
                      onChange={(e) =>
                        setRoleClient(
                          e.target.value as 'user' | 'admin',
                        )
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
                    {creationEnCours
                      ? 'Création en cours…'
                      : 'Créer le compte'}
                  </button>
                </form>
              )}

              {/* Tableau des comptes */}
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/40">
                {chargementClients ? (
                  <p className="p-6 text-slate-400">
                    Chargement des clients…
                  </p>
                ) : (
                  <table className="w-full min-w-[1000px] text-left text-sm">
                    <thead className="bg-white/[0.03] text-slate-400">
                      <tr>
                        <th className="p-4">Nom</th>
                        <th className="p-4">Téléphone</th>
                        <th className="p-4">Rôle</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4">Date de création</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                      {clients.map((client) => (
                        <tr key={client.id}>
                          <td className="p-4">
                            {client.full_name}
                          </td>

                          <td className="p-4">
                            {client.phone}
                          </td>

                          <td className="p-4">
                            <span
                              className={
                                client.role === 'admin'
                                  ? 'rounded-lg bg-cyan-400/10 px-2 py-1 text-cyan-300'
                                  : 'rounded-lg bg-white/5 px-2 py-1 text-slate-300'
                              }
                            >
                              {client.role === 'admin'
                                ? 'Administrateur'
                                : 'Client'}
                            </span>
                          </td>

                          <td className="p-4">
                            {client.status}
                          </td>

                          <td className="p-4">
                            {client.created_at
                              ? new Date(
                                  client.created_at,
                                ).toLocaleDateString('fr-FR')
                              : '—'}
                          </td>

                          {/* Correction : le bouton est dans le map */}
                          <td className="p-4">
                            {client.role === 'user' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setClientARecharger(client)
                                  setMontantRecharge('')
                                  setErreurClients('')
                                  setMessageClients('')
                                }}
                                className="rounded-lg bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-400/20"
                              >
                                Recharger
                              </button>
                            )}
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
          ) : sectionActive === 'Forfaits Wi-Fi' ? (
  <section className="space-y-6">
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
        Gestion du catalogue
      </p>
      <h1 className="text-2xl font-extrabold sm:text-3xl">
        Forfaits Wi-Fi
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        Crée les forfaits proposés à tes clients.
      </p>
    </div>

    {messageWifi && (
      <p className="rounded-xl bg-emerald-400/10 p-4 text-sm text-emerald-300">
        {messageWifi}
      </p>
    )}

    {erreurWifi && (
      <p role="alert" className="rounded-xl bg-red-400/10 p-4 text-sm text-red-300">
        {erreurWifi}
      </p>
    )}

    <form
      onSubmit={gererCreationForfait}
      className="grid gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:grid-cols-2"
    >
      <label className="text-sm text-slate-300">
        Nom du forfait
        <input
          required
          value={nomForfait}
          onChange={(e) => setNomForfait(e.target.value)}
          placeholder="Ex. : Wi-Fi 1 heure"
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        />
      </label>

      <label className="text-sm text-slate-300">
        Durée (heures)
        <input
          required
          type="number"
          min="1"
          step="1"
          value={dureeForfait}
          onChange={(e) => setDureeForfait(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        />
      </label>

      <label className="text-sm text-slate-300">
        Prix (HTG)
        <input
          required
          type="number"
          min="0.01"
          step="0.01"
          value={prixForfait}
          onChange={(e) => setPrixForfait(e.target.value)}
          placeholder="Ex. : 50"
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        />
      </label>

      <label className="text-sm text-slate-300">
        Description
        <input
          value={descriptionForfait}
          onChange={(e) => setDescriptionForfait(e.target.value)}
          placeholder="Description du forfait"
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        />
      </label>

      <button
        type="submit"
        disabled={creationForfaitEnCours}
        className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50 sm:col-span-2"
      >
        {creationForfaitEnCours ? 'Création en cours…' : 'Créer le forfait'}
      </button>
    </form>

    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/40">
      <div className="border-b border-white/10 p-5">
        <h2 className="font-bold">Forfaits existants</h2>
      </div>

      {chargementForfaits ? (
        <p className="p-5 text-sm text-slate-400">Chargement des forfaits…</p>
      ) : forfaitsWifi.length === 0 ? (
        <p className="p-5 text-sm text-slate-400">Aucun forfait disponible.</p>
      ) : (
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-white/[0.03] text-slate-400">
            <tr>
              <th className="p-4">Nom</th>
              <th className="p-4">Durée</th>
              <th className="p-4">Prix</th>
              <th className="p-4">Statut</th>
            </tr>
          </thead>
          

<tbody className="divide-y divide-white/5">
  {forfaitsWifi.map((forfait) => (
    <tr key={forfait.id}>
      <td className="p-4 font-medium">{forfait.name}</td>
      <td className="p-4">{forfait.duration_hours} h</td>
      <td className="p-4">
        {forfait.price} {forfait.currency}
      </td>
      <td className="p-4">{forfait.status}</td>
    </tr>
  ))}
</tbody>


        </table>
      )}
    </div>
  </section>
) : sectionActive === 'Codes Wi-Fi' ? (
  <section className="space-y-6">
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
        Gestion du stock
      </p>
      <h1 className="text-2xl font-extrabold sm:text-3xl">Codes Wi-Fi</h1>
      <p className="mt-2 text-sm text-slate-400">
        Ajoute les codes un par un et associe chaque code à son forfait.
      </p>
    </div>

    {messageWifi && (
      <p className="rounded-xl bg-emerald-400/10 p-4 text-sm text-emerald-300">
        {messageWifi}
      </p>
    )}

    {erreurWifi && (
      <p role="alert" className="rounded-xl bg-red-400/10 p-4 text-sm text-red-300">
        {erreurWifi}
      </p>
    )}

    <form
      onSubmit={gererAjoutCode}
      className="space-y-5 rounded-2xl border border-white/10 bg-slate-900/60 p-5"
    >
      <label className="block text-sm text-slate-300">
        Forfait associé
        <select
          required
          value={forfaitCodeId}
          onChange={(e) => setForfaitCodeId(e.target.value)}
          disabled={chargementForfaits || forfaitsWifi.length === 0}
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        >
          <option value="">Sélectionner un forfait</option>
          {forfaitsWifi.map((forfait) => (
            <option key={forfait.id} value={String(forfait.id)}>
              {forfait.name} — {forfait.price} {forfait.currency}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm text-slate-300">
        Code Wi-Fi
        <input
          required
          value={nouveauCodeWifi}
          onChange={(e) => setNouveauCodeWifi(e.target.value)}
          placeholder="Saisis un seul code"
          autoComplete="off"
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3"
        />
      </label>

      <button
        type="submit"
        disabled={ajoutCodeEnCours || chargementForfaits || forfaitsWifi.length === 0}
        className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
      >
        {ajoutCodeEnCours ? 'Ajout en cours…' : 'Ajouter ce code'}
      </button>

      {forfaitsWifi.length === 0 && !chargementForfaits && (
        <p className="text-sm text-amber-300">
          Crée d’abord un forfait dans la section « Forfaits Wi-Fi ».
        </p>
      )}
    </form>

    
    {/* Liste des codes Wi-Fi */}
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5">
        <div>
          <h2 className="font-bold">Tous les codes Wi-Fi</h2>
          <p className="mt-1 text-sm text-slate-400">
            {codesWifi.length} code(s) enregistré(s)
          </p>
        </div>

        <button
          type="button"
          onClick={() => void actualiserCodesWifi()}
          disabled={chargementCodesWifi}
          className="rounded-xl border border-cyan-400/20 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/10 disabled:opacity-50"
        >
          {chargementCodesWifi ? 'Actualisation…' : '↻ Actualiser'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 p-5">
        {(['TOUS', 'DISPONIBLE', 'VENDU'] as const).map((filtre) => (
          <button
            key={filtre}
            type="button"
           onClick={() => {
  setFiltreCodesWifi(filtre)
  setPageCodesWifi(1)
}}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              filtreCodesWifi === filtre
                ? 'bg-cyan-400 text-slate-950'
                : 'border border-white/10 text-slate-300 hover:bg-white/5'
            }`}
          >
            {filtre === 'TOUS'
              ? 'Tous'
              : filtre === 'DISPONIBLE'
                ? 'Disponibles'
                : 'Vendus'}
          </button>
        ))}
      </div>

      {chargementCodesWifi && codesWifi.length === 0 ? (
        <p className="p-5 text-sm text-slate-400">
          Chargement des codes Wi-Fi…
        </p>
      ) : (
<div className="overflow-x-auto">
          <table className="w-full min-w-[950px] table-fixed text-left text-sm">
  <colgroup>
    <col className="w-[45%]" />
    <col className="w-[23%]" />
    <col className="w-[14%]" />
    <col className="w-[18%]" />
  </colgroup>
            <thead className="bg-white/[0.03] text-slate-400">
              <tr>
                <th className="p-4">Code Wi-Fi</th>
                <th className="p-4">Forfait</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Date d’ajout</th>
              </tr>
            </thead>

            
<tbody className="divide-y divide-white/5">
  {codesAffichesWifi.map((code) => {
    const statut = code.status.toUpperCase()
    const vendu = statut === 'SOLD' || statut === 'VENDU'

    return (
      <tr
        key={code.id}
        className="transition hover:bg-white/[0.02]"
      >
        <td className="p-4">
          <span className="block break-all rounded-lg border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-3 font-mono text-base font-bold tracking-wide text-cyan-300 sm:text-lg">
            {code.code}
          </span>
        </td>

        <td className="break-words p-4 font-medium text-slate-200">
          {code.plan_name ??
            forfaitsWifi.find((f) => f.id === code.plan_id)?.name ??
            `Forfait #${code.plan_id}`}
        </td>

        <td className="p-4">
          <span
            className={`whitespace-nowrap rounded-lg px-2 py-1 text-xs font-bold ${
              vendu
                ? 'bg-red-400/10 text-red-300'
                : 'bg-emerald-400/10 text-emerald-300'
            }`}
          >
            {vendu ? 'VENDU' : 'DISPONIBLE'}
          </span>
        </td>

        <td className="whitespace-nowrap p-4 text-slate-300">
          {code.created_at ? (
            <>
              <div className="font-medium">
                {new Date(code.created_at).toLocaleDateString('fr-FR')}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {new Date(code.created_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </>
          ) : (
            <span className="text-slate-500">Date indisponible</span>
          )}
        </td>
      </tr>
    )
  })}
</tbody>

          </table>

         {codesFiltresWifi.length === 0 && (
  <p className="p-5 text-sm text-slate-400">
    Aucun code dans cette catégorie.
  </p>
)}
        </div>
      )}

      
      {codesFiltresWifi.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-5">
          <p className="text-sm text-slate-400">
            Page {pageCodesWifi} sur {totalPagesCodesWifi}
            {' · '}
            {codesFiltresWifi.length} code(s)
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={pageCodesWifi === 1}
              onClick={() =>
                setPageCodesWifi((page) => Math.max(1, page - 1))
              }
              className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Précédent
            </button>

            <button
              type="button"
              disabled={pageCodesWifi >= totalPagesCodesWifi}
              onClick={() =>
                setPageCodesWifi((page) =>
                  Math.min(totalPagesCodesWifi, page + 1)
                )
              }
              className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
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
      Cette section sera connectée aux données de PostgreSQL via FastAPI.
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
