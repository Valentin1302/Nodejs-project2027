
# Nodejs-project2027 – Guide d’accès aux API

## Présentation
Ce projet Node.js propose une API REST pour la gestion de cours, utilisateurs, paiements et intégration Google Calendar. L’interface web permet de tester les fonctionnalités, mais l’essentiel du projet repose sur les endpoints API.


## Configuration
Certains fichiers sensibles ne sont pas versionnés :
- `src/config/google-credentials.json` (OAuth2 Google)
- `src/config/token.json` (généré au premier lancement)
- `.env` (variables d’environnement, si besoin)

Pour Google Calendar :
1. Créer un projet Google Cloud
2. Activer l’API Google Calendar
3. Créer des identifiants OAuth2 et télécharger `google-credentials.json` dans `src/config/`
4. Lancer le serveur une première fois pour générer `token.json`

## Lancement du projet
### En local
```powershell
npx ts-node src/server.ts
```
Le serveur démarre par défaut sur [http://localhost:3005](http://localhost:3005)


## Accès au site
Ouvrir [http://localhost:3000](http://localhost:3000) dans un navigateur.

## Documentation des API principales

### Authentification
- `POST /auth/register` : Inscription d’un utilisateur
- `POST /auth/login` : Connexion, retourne un token JWT

### Utilisateurs
- `GET /users` : Liste des utilisateurs (auth requis)

### Cours
- `GET /courses` : Liste des cours
- `POST /courses` : Création d’un cours (auth requis)

### Catégories
- `GET /categories` : Liste des catégories

### Paiements
- `GET /payments` : Historique des paiements (auth requis)
- `POST /payments` : Effectuer un paiement (Stripe)

### Google Calendar
- `GET /calendar/events` : Liste des événements (auth requis)
- `POST /calendar/events` : Création d’un événement

> Pour chaque requête nécessitant une authentification, ajouter l’en-tête : `Authorization: Bearer <token>`

## Identifiants de test
Des identifiants de démonstration peuvent être fournis séparément si besoin.

## Remarques
- Les fichiers sensibles sont à demander séparément.
- Pour toute question, contacter l’auteur du projet.
