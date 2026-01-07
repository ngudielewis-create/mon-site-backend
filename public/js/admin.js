// API Base URL
const API_URL = '/api';

// État de l'application
let authToken = localStorage.getItem('authToken');
let currentEditingItem = null;

// ========== Initialisation ==========
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        verifyToken();
    } else {
        showLogin();
    }

    initTabs();
    initForms();
    initImagePreviews();
});

// ========== Authentication ==========
async function verifyToken() {
    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            showAdminPanel();
        } else {
            localStorage.removeItem('authToken');
            showLogin();
        }
    } catch (error) {
        console.error('Erreur de vérification:', error);
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadAllData();
}

// Login Form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const messageEl = document.getElementById('loginMessage');

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            showAdminPanel();
        } else {
            messageEl.textContent = data.error || 'Erreur de connexion';
            messageEl.className = 'form-message error';
            messageEl.style.display = 'block';
        }
    } catch (error) {
        messageEl.textContent = 'Erreur de connexion';
        messageEl.className = 'form-message error';
        messageEl.style.display = 'block';
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    authToken = null;
    showLogin();
});

// ========== Tabs ==========
function initTabs() {
    const tabButtons = document.querySelectorAll('.admin-nav-btn');
    const tabs = document.querySelectorAll('.admin-tab');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');

            // Remove active class from all
            tabButtons.forEach(b => b.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));

            // Add active class to selected
            btn.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.add('active');

            // Load data for the tab
            if (tabName === 'carousel') loadCarousel();
            else if (tabName === 'about') loadAbout();
            else if (tabName === 'services') loadServices();
            else if (tabName === 'gallery') loadGallery();
            else if (tabName === 'contact') loadContactMessages();
            else if (tabName === 'admins') loadAdmins();
        });
    });
}

function loadAllData() {
    loadCarousel();
    loadAbout();
    loadServices();
    loadGallery();
    loadContactMessages();
    loadAdmins();
}

// ========== API Helper ==========
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Authorization': `Bearer ${authToken}`,
        ...options.headers
    };

    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        localStorage.removeItem('authToken');
        showLogin();
        throw new Error('Non autorisé');
    }

    return response;
}

// ========== Carousel Management ==========
async function loadCarousel() {
    try {
        const response = await apiCall('/admin/content?type=carousel');
        const items = await response.json();
        const carouselItems = items.filter(item => item.type === 'carousel');

        const list = document.getElementById('carouselList');
        if (carouselItems.length === 0) {
            list.innerHTML = '<p>Aucun slide dans le carrousel.</p>';
            return;
        }

        list.innerHTML = carouselItems.map(item => `
            <div class="admin-item">
                <div class="admin-item-header">
                    <h3 class="admin-item-title">${item.title || 'Sans titre'}</h3>
                    <div class="admin-item-actions">
                        <span class="admin-item-badge ${item.visible ? 'visible' : 'hidden'}">
                            ${item.visible ? 'Visible' : 'Masqué'}
                        </span>
                        <button class="btn btn-primary btn-small" onclick="editCarousel(${item.id})">Modifier</button>
                        <button class="btn btn-danger btn-small" onclick="deleteCarousel(${item.id})">Supprimer</button>
                    </div>
                </div>
                ${item.image ? `<img src="${item.image}" alt="${item.title}" class="admin-item-image">` : ''}
                <p class="admin-item-description">${item.description || ''}</p>
                <div class="admin-item-meta">
                    <span>Ordre: ${item.order_index}</span>
                    ${item.link ? `<span>Lien: <a href="${item.link}" target="_blank">${item.link}</a></span>` : ''}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function openCarouselModal(id = null) {
    currentEditingItem = id;
    const modal = document.getElementById('carouselModal');
    const form = document.getElementById('carouselForm');
    const title = document.getElementById('carouselModalTitle');

    if (id) {
        title.textContent = 'Modifier le slide';
        // Load existing data
        apiCall('/admin/content').then(r => r.json()).then(items => {
            const item = items.find(i => i.id === id && i.type === 'carousel');
            if (item) {
                document.getElementById('carouselId').value = item.id;
                document.getElementById('carouselTitle').value = item.title || '';
                document.getElementById('carouselDescription').value = item.description || '';
                document.getElementById('carouselLink').value = item.link || '';
                document.getElementById('carouselOrder').value = item.order_index || 0;
                document.getElementById('carouselVisible').checked = item.visible === 1;
                if (item.image) {
                    document.getElementById('carouselImagePreview').innerHTML = `<img src="${item.image}" alt="Preview">`;
                }
            }
        });
    } else {
        title.textContent = 'Ajouter un slide';
        form.reset();
        document.getElementById('carouselImagePreview').innerHTML = '';
    }

    modal.classList.add('active');
}

function editCarousel(id) {
    openCarouselModal(id);
}

async function deleteCarousel(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce slide ?')) return;

    try {
        await apiCall(`/admin/content/${id}`, { method: 'DELETE' });
        loadCarousel();
    } catch (error) {
        alert('Erreur lors de la suppression');
    }
}

document.getElementById('carouselForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const id = document.getElementById('carouselId').value;

    formData.append('type', 'carousel');
    formData.append('title', document.getElementById('carouselTitle').value);
    formData.append('description', document.getElementById('carouselDescription').value);
    formData.append('link', document.getElementById('carouselLink').value);
    formData.append('order_index', document.getElementById('carouselOrder').value);
    formData.append('visible', document.getElementById('carouselVisible').checked);

    const imageFile = document.getElementById('carouselImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        if (id) {
            await apiCall(`/admin/content/${id}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            await apiCall('/admin/content', {
                method: 'POST',
                body: formData
            });
        }
        closeModal('carouselModal');
        loadCarousel();
    } catch (error) {
        alert('Erreur lors de l\'enregistrement');
    }
});

// ========== About Management ==========
async function loadAbout() {
    try {
        const response = await apiCall('/admin/content');
        const items = await response.json();
        const about = items.find(item => item.type === 'about');

        const content = document.getElementById('aboutContent');
        if (about) {
            content.innerHTML = `
                <div class="admin-item">
                    <h3>${about.title || 'À Propos'}</h3>
                    <p>${about.description || ''}</p>
                </div>
            `;
        } else {
            content.innerHTML = '<p>Aucun contenu pour cette section.</p>';
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function openAboutModal() {
    apiCall('/admin/content').then(r => r.json()).then(items => {
        const about = items.find(item => item.type === 'about');
        if (about) {
            document.getElementById('aboutId').value = about.id;
            document.getElementById('aboutTitle').value = about.title || '';
            document.getElementById('aboutDescription').value = about.description || '';
        }
        document.getElementById('aboutModal').classList.add('active');
    });
}

document.getElementById('aboutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('aboutId').value;
    const data = {
        type: 'about',
        title: document.getElementById('aboutTitle').value,
        description: document.getElementById('aboutDescription').value
    };

    try {
        if (id) {
            await apiCall(`/admin/content/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            await apiCall('/admin/content', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
        }
        closeModal('aboutModal');
        loadAbout();
    } catch (error) {
        alert('Erreur lors de l\'enregistrement');
    }
});

// ========== Services Management ==========
async function loadServices() {
    try {
        const response = await apiCall('/admin/services');
        const services = await response.json();

        const list = document.getElementById('servicesList');
        if (services.length === 0) {
            list.innerHTML = '<p>Aucun service disponible.</p>';
            return;
        }

        list.innerHTML = services.map(service => `
            <div class="admin-item">
                <div class="admin-item-header">
                    <h3 class="admin-item-title">${service.title}</h3>
                    <div class="admin-item-actions">
                        <span class="admin-item-badge ${service.visible ? 'visible' : 'hidden'}">
                            ${service.visible ? 'Visible' : 'Masqué'}
                        </span>
                        <button class="btn btn-primary btn-small" onclick="editService(${service.id})">Modifier</button>
                        <button class="btn btn-danger btn-small" onclick="deleteService(${service.id})">Supprimer</button>
                    </div>
                </div>
                ${service.image ? `<img src="${service.image}" alt="${service.title}" class="admin-item-image">` : ''}
                <p class="admin-item-description">${service.description}</p>
                <div class="admin-item-meta">
                    ${service.price ? `<span><strong>Prix:</strong> ${service.price}</span>` : ''}
                    <span>Ordre: ${service.order_index}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function openServiceModal(id = null) {
    currentEditingItem = id;
    const modal = document.getElementById('serviceModal');
    const title = document.getElementById('serviceModalTitle');

    if (id) {
        title.textContent = 'Modifier le service';
        apiCall(`/admin/services`).then(r => r.json()).then(services => {
            const service = services.find(s => s.id === id);
            if (service) {
                document.getElementById('serviceId').value = service.id;
                document.getElementById('serviceTitle').value = service.title || '';
                document.getElementById('serviceDescription').value = service.description || '';
                document.getElementById('servicePrice').value = service.price || '';
                document.getElementById('serviceOrder').value = service.order_index || 0;
                document.getElementById('serviceVisible').checked = service.visible === 1;
                if (service.image) {
                    document.getElementById('serviceImagePreview').innerHTML = `<img src="${service.image}" alt="Preview">`;
                }
            }
        });
    } else {
        title.textContent = 'Ajouter un service';
        document.getElementById('serviceForm').reset();
        document.getElementById('serviceImagePreview').innerHTML = '';
    }

    modal.classList.add('active');
}

function editService(id) {
    openServiceModal(id);
}

async function deleteService(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    try {
        await apiCall(`/admin/services/${id}`, { method: 'DELETE' });
        loadServices();
    } catch (error) {
        alert('Erreur lors de la suppression');
    }
}

document.getElementById('serviceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const id = document.getElementById('serviceId').value;

    formData.append('title', document.getElementById('serviceTitle').value);
    formData.append('description', document.getElementById('serviceDescription').value);
    formData.append('price', document.getElementById('servicePrice').value);
    formData.append('order_index', document.getElementById('serviceOrder').value);
    formData.append('visible', document.getElementById('serviceVisible').checked);

    const imageFile = document.getElementById('serviceImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        if (id) {
            await apiCall(`/admin/services/${id}`, {
                method: 'PUT',
                body: formData
            });
        } else {
            await apiCall('/admin/services', {
                method: 'POST',
                body: formData
            });
        }
        closeModal('serviceModal');
        loadServices();
    } catch (error) {
        alert('Erreur lors de l\'enregistrement');
    }
});

// ========== Gallery Management ==========
async function loadGallery() {
    try {
        const response = await apiCall('/admin/gallery');
        const gallery = await response.json();

        const grid = document.getElementById('galleryList');
        if (gallery.length === 0) {
            grid.innerHTML = '<p>Aucune image dans la galerie.</p>';
            return;
        }

        grid.innerHTML = gallery.map(item => `
            <div class="gallery-admin-item">
                <img src="${item.image}" alt="${item.title || ''}">
                <div class="gallery-admin-overlay">
                    <h4>${item.title || 'Sans titre'}</h4>
                    <p>${item.description || ''}</p>
                    <div class="gallery-admin-actions">
                        <span class="admin-item-badge ${item.visible ? 'visible' : 'hidden'}">
                            ${item.visible ? 'Visible' : 'Masqué'}
                        </span>
                        <button class="btn btn-danger btn-small" onclick="deleteGalleryItem(${item.id})">Supprimer</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function openGalleryModal() {
    document.getElementById('galleryForm').reset();
    document.getElementById('galleryImagePreview').innerHTML = '';
    document.getElementById('galleryModal').classList.add('active');
}

async function deleteGalleryItem(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

    try {
        await apiCall(`/admin/gallery/${id}`, { method: 'DELETE' });
        loadGallery();
    } catch (error) {
        alert('Erreur lors de la suppression');
    }
}

document.getElementById('galleryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('title', document.getElementById('galleryTitle').value);
    formData.append('description', document.getElementById('galleryDescription').value);
    formData.append('order_index', document.getElementById('galleryOrder').value);
    formData.append('visible', document.getElementById('galleryVisible').checked);

    const imageFile = document.getElementById('galleryImage').files[0];
    if (!imageFile) {
        alert('Veuillez sélectionner une image');
        return;
    }

    formData.append('image', imageFile);

    try {
        await apiCall('/admin/gallery', {
            method: 'POST',
            body: formData
        });
        closeModal('galleryModal');
        loadGallery();
    } catch (error) {
        alert('Erreur lors de l\'ajout');
    }
});

// ========== Contact Messages ==========
async function loadContactMessages() {
    try {
        const response = await apiCall('/admin/contact');
        const messages = await response.json();

        const list = document.getElementById('contactMessages');
        if (messages.length === 0) {
            list.innerHTML = '<p>Aucun message pour le moment.</p>';
            return;
        }

        list.innerHTML = messages.map(msg => `
            <div class="message-item ${msg.read ? '' : 'unread'}">
                <div class="message-header">
                    <div>
                        <span class="message-sender">${msg.name}</span>
                        <a href="mailto:${msg.email}" class="message-email">${msg.email}</a>
                    </div>
                    <span class="message-date">${new Date(msg.created_at).toLocaleString('fr-FR')}</span>
                </div>
                <div class="message-content">${msg.message}</div>
                ${!msg.read ? `
                    <div class="message-actions">
                        <button class="btn btn-primary btn-small" onclick="markAsRead(${msg.id})">Marquer comme lu</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function markAsRead(id) {
    try {
        await apiCall(`/admin/contact/${id}/read`, { method: 'PUT' });
        loadContactMessages();
    } catch (error) {
        alert('Erreur');
    }
}

// ========== Admins Management ==========
async function loadAdmins() {
    try {
        const response = await apiCall('/admins');
        const admins = await response.json();

        const list = document.getElementById('adminsList');
        if (admins.length === 0) {
            list.innerHTML = '<p>Aucun administrateur.</p>';
            return;
        }

        list.innerHTML = admins.map(admin => `
            <div class="admin-item">
                <div class="admin-item-header">
                    <h3 class="admin-item-title">${admin.name}</h3>
                </div>
                <div class="admin-item-meta">
                    <span><strong>Email:</strong> ${admin.email}</span>
                    <span><strong>Créé le:</strong> ${new Date(admin.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erreur:', error);
    }
}

function openAdminModal() {
    document.getElementById('adminForm').reset();
    document.getElementById('adminModal').classList.add('active');
}

document.getElementById('adminForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('adminName').value,
        email: document.getElementById('adminEmail').value,
        password: document.getElementById('adminPassword').value
    };

    try {
        const response = await apiCall('/admins', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            closeModal('adminModal');
            loadAdmins();
            alert('Administrateur créé avec succès !');
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Erreur lors de la création');
        }
    } catch (error) {
        alert('Erreur lors de la création');
        console.error(error);
    }
});

// ========== Image Previews ==========
function initImagePreviews() {
    ['carouselImage', 'serviceImage', 'galleryImage'].forEach(inputId => {
        const input = document.getElementById(inputId);
        const previewId = inputId.replace('Image', 'ImagePreview');
        const preview = document.getElementById(previewId);

        if (input && preview) {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });
}

// ========== Modal Utils ==========
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal on outside click
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});
