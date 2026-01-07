const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const { upload, uploadMiddleware, deleteImage } = require('../config/cloudinary');

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'votre_secret_jwt_super_securise_changez_moi_en_production', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// ========== AUTHENTIFICATION ==========

// Connexion admin
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  db.get('SELECT * FROM admins WHERE email = ?', [email], async (err, admin) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (!admin) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'votre_secret_jwt_super_securise_changez_moi_en_production',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });
  });
});

// Vérifier le token
router.get('/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ========== GESTION DES ADMINS ==========

// Créer un nouvel admin
router.post('/admins', authenticateToken, async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    'INSERT INTO admins (email, password, name) VALUES (?, ?, ?)',
    [email, hashedPassword, name],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
        return res.status(500).json({ error: 'Erreur lors de la création' });
      }

      res.status(201).json({
        id: this.lastID,
        email,
        name,
        message: 'Admin créé avec succès'
      });
    }
  );
});

// Lister tous les admins
router.get('/admins', authenticateToken, (req, res) => {
  db.all('SELECT id, email, name, created_at FROM admins ORDER BY created_at DESC', [], (err, admins) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(admins);
  });
});

// ========== CONTENU (CARROUSEL, À PROPOS) ==========

// Obtenir le contenu public
router.get('/content/:type', (req, res) => {
  const { type } = req.params;
  db.all(
    'SELECT * FROM content WHERE type = ? AND visible = 1 ORDER BY order_index ASC',
    [type],
    (err, content) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(content);
    }
  );
});

// Obtenir tout le contenu (admin)
router.get('/admin/content', authenticateToken, (req, res) => {
  db.all('SELECT * FROM content ORDER BY type, order_index ASC', [], (err, content) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(content);
  });
});

// Créer un élément de contenu
router.post('/admin/content', authenticateToken, upload.single('image'), uploadMiddleware, (req, res) => {
  const { type, title, description, link, order_index, visible } = req.body;
  // Cloudinary retourne req.file.path qui est l'URL complète de l'image
  const image = req.file ? req.file.path : '';

  db.run(
    'INSERT INTO content (type, title, description, image, link, order_index, visible) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [type, title, description, image, link || '', parseInt(order_index) || 0, visible === 'true' ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la création' });
      }

      res.status(201).json({
        id: this.lastID,
        type,
        title,
        description,
        image,
        link,
        message: 'Contenu créé avec succès'
      });
    }
  );
});

// Mettre à jour un élément de contenu
router.put('/admin/content/:id', authenticateToken, upload.single('image'), uploadMiddleware, async (req, res) => {
  const { id } = req.params;
  const { type, title, description, link, order_index, visible } = req.body;

  // Si une nouvelle image est uploadée, supprimer l'ancienne de Cloudinary
  db.get('SELECT image FROM content WHERE id = ?', [id], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    let image = row ? row.image : '';
    
    // Si une nouvelle image est uploadée
    if (req.file) {
      // Supprimer l'ancienne image de Cloudinary si elle existe
      if (row && row.image) {
        await deleteImage(row.image);
      }
      image = req.file.path; // URL Cloudinary
    }

    db.run(
      'UPDATE content SET type = ?, title = ?, description = ?, image = ?, link = ?, order_index = ?, visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [type, title, description, image, link || '', parseInt(order_index) || 0, visible === 'true' ? 1 : 0, id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }
        res.json({ message: 'Contenu mis à jour avec succès' });
      }
    );
  });
});

// Supprimer un élément de contenu
router.delete('/admin/content/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  // Supprimer l'image de Cloudinary si elle existe
  db.get('SELECT image FROM content WHERE id = ?', [id], async (err, row) => {
    if (row && row.image) {
      await deleteImage(row.image);
    }

    db.run('DELETE FROM content WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la suppression' });
      }
      res.json({ message: 'Contenu supprimé avec succès' });
    });
  });
});

// ========== SERVICES ==========

// Obtenir les services publics
router.get('/services', (req, res) => {
  db.all(
    'SELECT * FROM services WHERE visible = 1 ORDER BY order_index ASC',
    [],
    (err, services) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(services);
    }
  );
});

// Obtenir tous les services (admin)
router.get('/admin/services', authenticateToken, (req, res) => {
  db.all('SELECT * FROM services ORDER BY order_index ASC', [], (err, services) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(services);
  });
});

// Créer un service
router.post('/admin/services', authenticateToken, upload.single('image'), uploadMiddleware, (req, res) => {
  const { title, description, price, order_index, visible } = req.body;
  const image = req.file ? req.file.path : '';

  db.run(
    'INSERT INTO services (title, description, image, price, order_index, visible) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, image, price || '', parseInt(order_index) || 0, visible === 'true' ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la création' });
      }

      res.status(201).json({
        id: this.lastID,
        title,
        description,
        image,
        price,
        message: 'Service créé avec succès'
      });
    }
  );
});

// Mettre à jour un service
router.put('/admin/services/:id', authenticateToken, upload.single('image'), uploadMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, description, price, order_index, visible } = req.body;

  db.get('SELECT image FROM services WHERE id = ?', [id], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    let image = row ? row.image : '';
    
    // Si une nouvelle image est uploadée
    if (req.file) {
      // Supprimer l'ancienne image de Cloudinary si elle existe
      if (row && row.image) {
        await deleteImage(row.image);
      }
      image = req.file.path; // URL Cloudinary
    }

    db.run(
      'UPDATE services SET title = ?, description = ?, image = ?, price = ?, order_index = ?, visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, image, price || '', parseInt(order_index) || 0, visible === 'true' ? 1 : 0, id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la mise à jour' });
        }
        res.json({ message: 'Service mis à jour avec succès' });
      }
    );
  });
});

// Supprimer un service
router.delete('/admin/services/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  // Supprimer l'image de Cloudinary si elle existe
  db.get('SELECT image FROM services WHERE id = ?', [id], async (err, row) => {
    if (row && row.image) {
      await deleteImage(row.image);
    }

    db.run('DELETE FROM services WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la suppression' });
      }
      res.json({ message: 'Service supprimé avec succès' });
    });
  });
});

// ========== GALERIE ==========

// Obtenir la galerie publique
router.get('/gallery', (req, res) => {
  db.all(
    'SELECT * FROM gallery WHERE visible = 1 ORDER BY order_index ASC',
    [],
    (err, gallery) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(gallery);
    }
  );
});

// Obtenir toute la galerie (admin)
router.get('/admin/gallery', authenticateToken, (req, res) => {
  db.all('SELECT * FROM gallery ORDER BY order_index ASC', [], (err, gallery) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(gallery);
  });
});

// Ajouter une image à la galerie
router.post('/admin/gallery', authenticateToken, upload.single('image'), uploadMiddleware, (req, res) => {
  const { title, description, order_index, visible } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'Image requise' });
  }

  const image = req.file.path; // URL Cloudinary

  db.run(
    'INSERT INTO gallery (title, description, image, order_index, visible) VALUES (?, ?, ?, ?, ?)',
    [title || '', description || '', image, parseInt(order_index) || 0, visible === 'true' ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de l\'ajout' });
      }

      res.status(201).json({
        id: this.lastID,
        title,
        description,
        image,
        message: 'Image ajoutée avec succès'
      });
    }
  );
});

// Supprimer une image de la galerie
router.delete('/admin/gallery/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  // Supprimer l'image de Cloudinary si elle existe
  db.get('SELECT image FROM gallery WHERE id = ?', [id], async (err, row) => {
    if (row && row.image) {
      await deleteImage(row.image);
    }

    db.run('DELETE FROM gallery WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la suppression' });
      }
      res.json({ message: 'Image supprimée avec succès' });
    });
  });
});

// ========== CONTACT ==========

// Envoyer un message de contact
router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  db.run(
    'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
    [name, email, message],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de l\'envoi' });
      }

      res.status(201).json({ message: 'Message envoyé avec succès' });
    }
  );
});

// Obtenir les messages de contact (admin)
router.get('/admin/contact', authenticateToken, (req, res) => {
  db.all('SELECT * FROM contact_messages ORDER BY created_at DESC', [], (err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(messages);
  });
});

// Marquer un message comme lu
router.put('/admin/contact/:id/read', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('UPDATE contact_messages SET read = 1 WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json({ message: 'Message marqué comme lu' });
  });
});

module.exports = router;
