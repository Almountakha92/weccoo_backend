export const appMessages = {
  common: {
    ok: 'OK',
    notFound: 'Ressource introuvable.',
    invalidPayload: 'Payload invalide.',
    unauthorized: 'Non autorise.',
    internalError: 'Erreur interne du serveur.',
    databaseUnavailable: 'Base de donnees indisponible.'
  },
  auth: {
    signupSuccess: 'Compte cree avec succes.',
    loginSuccess: 'Connexion reussie.',
    invalidCredentials: 'Email ou mot de passe invalide.',
    emailAlreadyUsed: 'Cet email est deja utilise.'
  },
  items: {
    created: 'Objet cree avec succes.',
    listFetched: 'Liste des objets recuperee.',
    detailFetched: 'Detail objet recupere.',
    archived: 'Objet archive avec succes.',
    photoRequired: 'Au moins une photo est obligatoire.',
    titleRequired: "Le titre de l'objet est obligatoire.",
    categoryRequired: 'La categorie est obligatoire.',
    locationRequired: 'La zone de remise est obligatoire.'
  },
  stats: {
    fetched: 'Statistiques recuperees.'
  }
} as const;
