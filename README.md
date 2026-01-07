# Site Vitrine avec Espace Administrateur

Un site vitrine moderne et professionnel avec un système d'administration complet pour gérer le contenu.

## 🚀 Fonctionnalités

### Frontend
- **Page d'accueil** avec carrousel (slider) horizontal
- **Section À propos** présentant l'activité
- **Section Services/Produits** avec images et descriptions
- **Section Galerie** avec photos dynamiques et modal
- **Section Contact** avec formulaire fonctionnel
- **Design responsive** (mobile, tablette, ordinateur)
- **Navigation fluide** avec défilement doux
- **Animations légères** et modernes

### Backend & Administration
- **Espace administrateur sécurisé** avec authentification JWT
- **Gestion du carrousel** : ajouter, modifier, supprimer des slides
- **Gestion de la section À propos** : modifier le contenu
- **Gestion des services** : CRUD complet avec images
- **Gestion de la galerie** : ajouter/supprimer des images
- **Gestion des messages de contact** : voir et marquer comme lus
- **Gestion des administrateurs** : créer de nouveaux admins avec tous les droits
- **Modifications en temps réel** : les changements sont immédiatement visibles
- **Upload d'images** avec validation et prévisualisation

## 📋 Prérequis

- Node.js (version 14 ou supérieure)
- npm (généralement inclus avec Node.js)

## 🔧 Installation

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer les variables d'environnement** (optionnel)
   
   Créez un fichier `.env` à la racine du projet avec les variables suivantes :
   
   ```env
   PORT=3000
   JWT_SECRET=votre_secret_jwt_super_securise_changez_moi_en_production
   INITIAL_ADMIN_EMAIL=admin@example.com
   INITIAL_ADMIN_PASSWORD=admin123
   
   # Configuration Cloudinary (requis pour l'upload d'images)
   CLOUDINARY_CLOUD_NAME=votre_cloud_name
   CLOUDINARY_API_KEY=votre_api_key
   CLOUDINARY_API_SECRET=votre_api_secret
   ```
   
   ⚠️ **Important** : Pour utiliser l'upload d'images, vous devez configurer Cloudinary. 
   Voir le fichier `CLOUDINARY_SETUP.md` pour les instructions détaillées.

3. **Démarrer le serveur**
   ```bash
   npm start
   ```
   
   Pour le développement avec rechargement automatique :
   ```bash
   npm run dev
   ```

4. **Accéder au site**
   - Site public : http://localhost:3000
   - Espace admin : http://localhost:3000/admin.html

## 🔐 Identifiants par défaut

- **Email** : admin@example.com
- **Mot de passe** : admin123

⚠️ **Important** : Changez ces identifiants après la première connexion en production !

## 📁 Structure du projet

```
.
├── server.js              # Serveur Express principal
├── database.js            # Configuration de la base de données SQLite
├── routes/
│   └── api.js            # Routes API (authentification, CRUD)
├── public/
│   ├── index.html        # Page d'accueil
│   ├── admin.html        # Page d'administration
│   ├── css/
│   │   ├── style.css     # Styles du site public
│   │   └── admin.css     # Styles de l'interface admin
│   ├── js/
│   │   ├── app.js        # JavaScript du site public
│   │   └── admin.js      # JavaScript de l'interface admin
│   └── uploads/          # Dossier des images uploadées (créé automatiquement)
├── database.sqlite       # Base de données SQLite (créée automatiquement)
└── package.json          # Dépendances et scripts
```

## 🗄️ Base de données

Le projet utilise SQLite pour faciliter le déploiement. La base de données est créée automatiquement au premier démarrage avec les tables suivantes :

- `admins` : Administrateurs
- `content` : Contenu du carrousel et sections
- `services` : Services/Produits
- `gallery` : Images de la galerie
- `contact_messages` : Messages du formulaire de contact

## 🎨 Personnalisation

### Couleurs
Les couleurs sont définies dans `public/css/style.css` via les variables CSS :
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --accent-color: #ec4899;
    /* ... */
}
```

### Contenu par défaut
Le système crée automatiquement du contenu par défaut au premier démarrage. Vous pouvez le modifier via l'interface d'administration.

## 📱 Responsive Design

Le site est entièrement responsive et s'adapte à :
- **Mobile** (< 480px)
- **Tablette** (481px - 768px)
- **Desktop** (> 768px)

## 🔒 Sécurité

- Authentification JWT avec expiration (24h)
- Hash des mots de passe avec bcrypt
- Validation des fichiers uploadés (type et taille)
- Protection CORS configurée
- Sanitisation des entrées utilisateur

## 🚀 Déploiement

### Sur un serveur Node.js

1. Transférez tous les fichiers sur votre serveur
2. Installez les dépendances : `npm install --production`
3. Configurez les variables d'environnement
4. Démarrez avec PM2 ou un gestionnaire de processus :
   ```bash
   pm2 start server.js --name site-vitrine
   ```

### Sur Heroku / Vercel / etc.

- Configurez les variables d'environnement dans le panneau de contrôle
- Le serveur écoute sur le port fourni par la variable `PORT`
- Assurez-vous que le dossier `public/uploads` est persisté (utilisez un service de stockage cloud en production)

## 📝 Notes

- Les images sont stockées dans `public/uploads/`
- La base de données SQLite est créée automatiquement
- En production, utilisez une base de données plus robuste (PostgreSQL, MySQL) si nécessaire
- Changez le `JWT_SECRET` et les identifiants admin en production !

## 🤝 Support

Pour toute question ou problème, consultez la documentation ou ouvrez une issue.

## 📄 Licence

Ce projet est fourni tel quel pour usage personnel ou commercial.
