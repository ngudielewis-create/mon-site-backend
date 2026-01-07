// API Base URL
const API_URL = '/api';

// État de l'application
let currentCarouselIndex = 0;
let carouselItems = [];
let carouselInterval = null;

// ========== Initialisation ==========
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadCarousel();
    loadAbout();
    loadServices();
    loadGallery();
    initContactForm();
    initCarouselControls();
});

// ========== Navigation ==========
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Smooth scroll
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ========== Carousel ==========
async function loadCarousel() {
    try {
        const response = await fetch(`${API_URL}/content/carousel`);
        const items = await response.json();
        carouselItems = items;
        
        if (items.length > 0) {
            renderCarousel(items);
            startCarousel();
        } else {
            // Contenu par défaut si aucune donnée
            renderDefaultCarousel();
        }
    } catch (error) {
        console.error('Erreur lors du chargement du carrousel:', error);
        renderDefaultCarousel();
    }
}

function renderCarousel(items) {
    const carousel = document.getElementById('carousel');
    const dots = document.getElementById('carouselDots');
    
    carousel.innerHTML = '';
    dots.innerHTML = '';
    
    items.forEach((item, index) => {
        const slide = document.createElement('div');
        slide.className = 'carousel-item';
        
        if (item.image) {
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.title;
            slide.appendChild(img);
        }
        
        const content = document.createElement('div');
        content.className = 'carousel-content';
        content.innerHTML = `
            <h1>${item.title || 'Bienvenue'}</h1>
            <p>${item.description || ''}</p>
            ${item.link ? `<a href="${item.link}" class="btn btn-primary">En savoir plus</a>` : ''}
        `;
        slide.appendChild(content);
        carousel.appendChild(slide);
        
        // Dots
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dots.appendChild(dot);
    });
    
    updateCarousel();
}

function renderDefaultCarousel() {
    const defaultItems = [
        { title: 'Bienvenue', description: 'Découvrez nos services exceptionnels' },
        { title: 'Qualité Premium', description: 'Des produits de haute qualité' },
        { title: 'Service Client', description: 'Une équipe à votre écoute' }
    ];
    renderCarousel(defaultItems);
}

function initCarouselControls() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.addEventListener('click', () => prevSlide());
    nextBtn.addEventListener('click', () => nextSlide());
}

function nextSlide() {
    currentCarouselIndex = (currentCarouselIndex + 1) % carouselItems.length;
    updateCarousel();
    resetCarouselInterval();
}

function prevSlide() {
    currentCarouselIndex = (currentCarouselIndex - 1 + carouselItems.length) % carouselItems.length;
    updateCarousel();
    resetCarouselInterval();
}

function goToSlide(index) {
    currentCarouselIndex = index;
    updateCarousel();
    resetCarouselInterval();
}

function updateCarousel() {
    const carousel = document.getElementById('carousel');
    const dots = document.querySelectorAll('.carousel-dot');
    
    carousel.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentCarouselIndex);
    });
}

function startCarousel() {
    if (carouselItems.length > 1) {
        carouselInterval = setInterval(nextSlide, 5000);
    }
}

function resetCarouselInterval() {
    clearInterval(carouselInterval);
    startCarousel();
}

// ========== About Section ==========
async function loadAbout() {
    try {
        const response = await fetch(`${API_URL}/content/about`);
        const items = await response.json();
        
        const aboutContent = document.getElementById('aboutContent');
        
        if (items.length > 0) {
            const item = items[0];
            aboutContent.innerHTML = `
                <h3>${item.title || 'À Propos'}</h3>
                <p>${item.description || ''}</p>
            `;
        } else {
            aboutContent.innerHTML = `
                <h3>À Propos</h3>
                <p>Nous sommes une entreprise passionnée qui offre des services de qualité. Notre mission est de satisfaire nos clients avec excellence et professionnalisme.</p>
            `;
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la section À propos:', error);
    }
}

// ========== Services Section ==========
async function loadServices() {
    try {
        const response = await fetch(`${API_URL}/services`);
        const services = await response.json();
        
        const servicesGrid = document.getElementById('servicesGrid');
        
        if (services.length > 0) {
            servicesGrid.innerHTML = services.map(service => `
                <div class="service-card">
                    ${service.image ? `<img src="${service.image}" alt="${service.title}">` : ''}
                    <h3>${service.title}</h3>
                    <p>${service.description}</p>
                    ${service.price ? `<div class="price">${service.price}</div>` : ''}
                </div>
            `).join('');
        } else {
            servicesGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Aucun service disponible pour le moment.</p>';
        }
    } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
    }
}

// ========== Gallery Section ==========
async function loadGallery() {
    try {
        const response = await fetch(`${API_URL}/gallery`);
        const gallery = await response.json();
        
        const galleryGrid = document.getElementById('galleryGrid');
        
        if (gallery.length > 0) {
            galleryGrid.innerHTML = gallery.map(item => `
                <div class="gallery-item" onclick="openModal('${item.image}', '${item.title || ''}', '${item.description || ''}')">
                    <img src="${item.image}" alt="${item.title || ''}">
                    <div class="gallery-item-overlay">
                        <h4>${item.title || ''}</h4>
                        <p>${item.description || ''}</p>
                    </div>
                </div>
            `).join('');
        } else {
            galleryGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Aucune image dans la galerie pour le moment.</p>';
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la galerie:', error);
    }
}

// ========== Modal Gallery ==========
function openModal(imageSrc, title, description) {
    const modal = document.getElementById('galleryModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    
    modalImage.src = imageSrc;
    modalCaption.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('galleryModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Modal event listeners
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('galleryModal').addEventListener('click', (e) => {
    if (e.target.id === 'galleryModal') {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ========== Contact Form ==========
function initContactForm() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value
        };
        
        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                formMessage.textContent = 'Message envoyé avec succès !';
                formMessage.className = 'form-message success';
                form.reset();
                
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            } else {
                formMessage.textContent = data.error || 'Une erreur est survenue';
                formMessage.className = 'form-message error';
            }
        } catch (error) {
            formMessage.textContent = 'Erreur de connexion. Veuillez réessayer.';
            formMessage.className = 'form-message error';
        }
    });
}
