const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Stockage en mémoire pour Multer (les fichiers seront uploadés directement vers Cloudinary)
const storage = multer.memoryStorage();

// Middleware Multer avec stockage en mémoire
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers images sont autorisés'));
    }
  }
});

// Fonction pour uploader vers Cloudinary
const uploadToCloudinary = (buffer, folder = 'site-vitrine') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1920, height: 1080, crop: 'limit' },
        { quality: 'auto' }
      ]
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Créer un stream depuis le buffer et l'envoyer vers Cloudinary
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null); // Indique la fin du stream
    bufferStream.pipe(uploadStream);
  });
};

// Middleware personnalisé pour uploader vers Cloudinary après Multer
const uploadMiddleware = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  uploadToCloudinary(req.file.buffer, 'site-vitrine')
    .then((result) => {
      // Remplacer le fichier Multer par l'URL Cloudinary
      req.file.path = result.secure_url;
      req.file.public_id = result.public_id;
      next();
    })
    .catch((error) => {
      console.error('Erreur upload Cloudinary:', error);
      return res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
    });
};

// Fonction pour supprimer une image de Cloudinary
const deleteImage = async (imageUrl, publicId = null) => {
  try {
    if (!imageUrl) return;
    
    // Si on a déjà le public_id, l'utiliser directement
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      return;
    }
    
    // Si ce n'est pas une URL Cloudinary (commence par http:// ou https://), on ne fait rien
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      // C'est probablement une ancienne image locale, on ignore
      return;
    }
    
    // Extraire le public_id de l'URL Cloudinary
    // Format d'URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
    // ou: https://res.cloudinary.com/cloud_name/image/upload/folder/filename.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      // Si ce n'est pas une URL Cloudinary valide, on ne fait rien
      return;
    }
    
    // Récupérer le public_id (tout après /upload/)
    let publicIdParts = urlParts.slice(uploadIndex + 1);
    
    // Si le premier élément commence par 'v' (version), on le saute
    if (publicIdParts.length > 0 && publicIdParts[0].startsWith('v')) {
      publicIdParts = publicIdParts.slice(1);
    }
    
    // Joindre les parties et retirer l'extension
    const extractedPublicId = publicIdParts.join('/').replace(/\.[^/.]+$/, '');
    
    if (extractedPublicId) {
      await cloudinary.uploader.destroy(extractedPublicId);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image Cloudinary:', error);
    // On ne fait pas échouer la requête si la suppression échoue
  }
};

module.exports = {
  cloudinary,
  upload,
  uploadMiddleware,
  deleteImage
};
