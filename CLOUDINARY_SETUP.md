# 📸 Configuration Cloudinary

Ce guide vous explique comment configurer Cloudinary pour le stockage des images de votre site vitrine.

## 🔑 Étapes de Configuration

### 1. Créer un compte Cloudinary

1. Allez sur [cloudinary.com](https://cloudinary.com/)
2. Créez un compte gratuit (offre généreuse pour débuter)
3. Une fois connecté, accédez à votre **Dashboard**

### 2. Récupérer vos clés d'API

Dans le Dashboard Cloudinary, vous trouverez vos informations d'identification :

- **Cloud Name** : Nom de votre cloud
- **API Key** : Votre clé API
- **API Secret** : Votre secret API (⚠️ à garder confidentiel)

### 3. Configurer les variables d'environnement

Créez ou modifiez le fichier `.env` à la racine du projet et ajoutez :

```env
# Configuration Cloudinary
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret

# Autres variables existantes
PORT=3000
JWT_SECRET=votre_secret_jwt_super_securise_changez_moi_en_production
INITIAL_ADMIN_EMAIL=admin@example.com
INITIAL_ADMIN_PASSWORD=admin123
```

⚠️ **Important** : Remplacez `votre_cloud_name`, `votre_api_key`, et `votre_api_secret` par vos vraies valeurs Cloudinary.

### 4. Installer les dépendances

Assurez-vous que toutes les dépendances sont installées :

```bash
npm install
```

Les packages Cloudinary sont déjà inclus dans le `package.json` :
- `cloudinary` : SDK Cloudinary
- `multer-storage-cloudinary` : Intégration Multer avec Cloudinary

### 5. Redémarrer le serveur

Après avoir configuré les variables d'environnement, redémarrez le serveur :

```bash
npm start
```

## ✅ Vérification

Une fois configuré :

1. Connectez-vous à l'interface admin : http://localhost:3000/admin.html
2. Essayez d'uploader une image (carrousel, service, ou galerie)
3. Vérifiez dans votre Dashboard Cloudinary que l'image apparaît dans le dossier `site-vitrine`

## 🎨 Avantages de Cloudinary

- **Stockage cloud** : Pas besoin de gérer les fichiers localement
- **Optimisation automatique** : Images optimisées pour le web
- **CDN intégré** : Chargement rapide des images
- **Transformations** : Possibilité de redimensionner, recadrer, etc.
- **Scalabilité** : Pas de limite de stockage sur le serveur

## 🔧 Personnalisation

Vous pouvez modifier la configuration Cloudinary dans `config/cloudinary.js` :

- **Dossier** : Changez `folder: 'site-vitrine'` pour organiser vos images différemment
- **Transformations** : Ajoutez des transformations automatiques (redimensionnement, qualité, etc.)
- **Formats** : Modifiez les formats autorisés

### Exemple de transformation avancée

```javascript
transformation: [
  { width: 1920, height: 1080, crop: 'limit' },
  { quality: 'auto:good' }, // Qualité optimisée
  { format: 'auto' } // Format automatique (WebP si supporté)
]
```

## 🐛 Dépannage

### Les images ne s'uploadent pas

1. Vérifiez que les variables d'environnement sont correctement définies
2. Vérifiez que vous avez bien installé les dépendances : `npm install`
3. Redémarrez le serveur après avoir modifié le `.env`
4. Vérifiez les logs du serveur pour voir les erreurs

### Erreur "Invalid API credentials"

- Vérifiez que `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, et `CLOUDINARY_API_SECRET` sont corrects
- Assurez-vous qu'il n'y a pas d'espaces avant/après les valeurs dans le `.env`

### Les anciennes images locales ne s'affichent plus

- Les images déjà uploadées localement resteront accessibles si elles sont dans `public/uploads/`
- Les nouvelles images seront stockées sur Cloudinary
- Pour migrer les anciennes images, ré-uploadez-les via l'interface admin

## 📚 Ressources

- [Documentation Cloudinary](https://cloudinary.com/documentation)
- [API Reference](https://cloudinary.com/documentation/image_upload_api_reference)
- [Transformation Guide](https://cloudinary.com/documentation/image_transformations)
