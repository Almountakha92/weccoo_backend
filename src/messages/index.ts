export const appMessages = {
  common: {
    ok: 'OK',
    notFound: 'Ressource introuvable.',
    invalidPayload: 'Payload invalide.',
    unauthorized: 'Non autorise.',
    internalError: 'Erreur interne du serveur.'
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
    photoRequired: 'Au moins une photo est obligatoire.'
  },
  stats: {
    fetched: 'Statistiques recuperees.'
  },
  messages: {
    conversationListFetched: 'Conversations recuperees.',
    messageListFetched: 'Messages recuperes.',
    sent: 'Message envoye.'
  }
} as const;
