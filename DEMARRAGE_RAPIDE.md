# 🚀 Guide de Démarrage Rapide

## Installation en 3 étapes

### 1. Installer les dépendances
```bash
npm install
```

### 2. Démarrer le serveur
```bash
npm start
```

Le serveur démarre sur **http://localhost:3000**

### 3. Se connecter à l'administration

1. Accédez à **http://localhost:3000/admin.html**
2. Utilisez les identifiants par défaut :
   - **Email** : admin@example.com
   - **Mot de passe** : admin123

## 📝 Premiers pas

### Visiter le site public
- **URL** : http://localhost:3000
- Le site affiche le contenu par défaut créé automatiquement

### Personnaliser le contenu
1. Connectez-vous à l'espace admin
2. Utilisez les onglets pour gérer :
   - **Carrousel** : Modifier les slides de la page d'accueil
   - **À Propos** : Personnaliser la section à propos
   - **Services** : Ajouter/modifier vos services
   - **Galerie** : Uploader des images
   - **Messages** : Voir les messages de contact
   - **Admins** : Créer d'autres administrateurs

### Ajouter un autre administrateur
1. Allez dans l'onglet **Admins**
2. Cliquez sur **Ajouter un admin**
3. Renseignez le nom, email et mot de passe
4. Le nouvel admin aura tous les droits

## 🔧 Configuration (optionnel)

Pour modifier les paramètres par défaut, créez un fichier `.env` :

```env
PORT=3000
JWT_SECRET=votre_secret_jwt_super_securise
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=admin123

# Configuration Cloudinary (requis pour l'upload d'images)
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

📸 **Pour utiliser l'upload d'images**, vous devez configurer Cloudinary. 
Voir le fichier **CLOUDINARY_SETUP.md** pour les instructions détaillées.

## ⚠️ Important en production

- Changez le `JWT_SECRET` dans `.env`
- Changez les identifiants admin par défaut
- Configurez Cloudinary pour l'upload d'images (voir CLOUDINARY_SETUP.md)
- Utilisez une base de données plus robuste (PostgreSQL, MySQL) si nécessaire

## 📚 Documentation complète

Voir le fichier **README.md** pour plus de détails.
