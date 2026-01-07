const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialiser la base de données
db.serialize(() => {
  // Table des administrateurs
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table du contenu (carrousel, sections)
  db.run(`CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT,
    description TEXT,
    image TEXT,
    link TEXT,
    order_index INTEGER DEFAULT 0,
    visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table des services/produits
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT,
    price TEXT,
    order_index INTEGER DEFAULT 0,
    visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table de la galerie
  db.run(`CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    image TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table des messages de contact
  db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Créer l'admin initial si aucun admin n'existe
  db.get('SELECT COUNT(*) as count FROM admins', (err, row) => {
    if (err) {
      console.error('Erreur lors de la vérification des admins:', err);
      return;
    }
    
    if (row.count === 0) {
      const defaultEmail = process.env.INITIAL_ADMIN_EMAIL || 'ngudielewis@gmail.com';
      const defaultPassword = process.env.INITIAL_ADMIN_PASSWORD || 'lele1122';
      
      bcrypt.hash(defaultPassword, 10, (err, hash) => {
        if (err) {
          console.error('Erreur lors du hash du mot de passe:', err);
          return;
        }
        
        db.run(
          'INSERT INTO admins (email, password, name) VALUES (?, ?, ?)',
          [defaultEmail, hash, 'Administrateur'],
          (err) => {
            if (err) {
              console.error('Erreur lors de la création de l\'admin:', err);
            } else {
              console.log(`✅ Admin initial créé: ${defaultEmail} / ${defaultPassword}`);
            }
          }
        );
      });
    }
  });

  // Contenu par défaut
  db.get('SELECT COUNT(*) as count FROM content WHERE type = ?', ['carousel'], (err, row) => {
    if (!err && row.count === 0) {
      const defaultCarousel = [
        { type: 'carousel', title: 'Bienvenue', description: 'Découvrez nos services exceptionnels', image: '', order_index: 0 },
        { type: 'carousel', title: 'Qualité Premium', description: 'Des produits de haute qualité', image: '', order_index: 1 },
        { type: 'carousel', title: 'Service Client', description: 'Une équipe à votre écoute', image: '', order_index: 2 }
      ];
      
      const stmt = db.prepare('INSERT INTO content (type, title, description, image, order_index) VALUES (?, ?, ?, ?, ?)');
      defaultCarousel.forEach(item => {
        stmt.run(item.type, item.title, item.description, item.image, item.order_index);
      });
      stmt.finalize();
    }
  });

  // Section À propos par défaut
  db.get('SELECT COUNT(*) as count FROM content WHERE type = ?', ['about'], (err, row) => {
    if (!err && row.count === 0) {
      db.run(
        'INSERT INTO content (type, title, description) VALUES (?, ?, ?)',
        ['about', 'À Propos', 'Nous sommes une entreprise passionnée qui offre des services de qualité. Notre mission est de satisfaire nos clients avec excellence et professionnalisme.']
      );
    }
  });

  // Services par défaut
  db.get('SELECT COUNT(*) as count FROM services', (err, row) => {
    if (!err && row.count === 0) {
      const defaultServices = [
        { title: 'Service 1', description: 'Description du service 1', price: 'À partir de 99€', order_index: 0 },
        { title: 'Service 2', description: 'Description du service 2', price: 'À partir de 149€', order_index: 1 },
        { title: 'Service 3', description: 'Description du service 3', price: 'À partir de 199€', order_index: 2 }
      ];
      
      const stmt = db.prepare('INSERT INTO services (title, description, price, order_index) VALUES (?, ?, ?, ?)');
      defaultServices.forEach(service => {
        stmt.run(service.title, service.description, service.price, service.order_index);
      });
      stmt.finalize();
    }
  });
});

module.exports = db;
