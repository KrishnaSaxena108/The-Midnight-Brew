class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'dark';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupToggleButton();
        this.setupAuthNavigation();
        this.watchForSystemChanges();
    }

    getStoredTheme() {
        // Check for admin theme first, then regular theme
        return localStorage.getItem('admin-theme') || 
               localStorage.getItem('theme') || 
               (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        
        // Update meta theme color
        let metaThemeColor = document.querySelector("meta[name=theme-color]");
        if (!metaThemeColor) {
            metaThemeColor = document.createElement("meta");
            metaThemeColor.setAttribute("name", "theme-color");
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.setAttribute("content", theme === 'dark' ? '#1e293b' : '#ffffff');
        
        // Store theme preference
        localStorage.setItem('theme', theme);
        if (window.location.pathname.includes('admin')) {
            localStorage.setItem('admin-theme', theme);
        }
        
        this.updateToggleButton(theme);
        this.currentTheme = theme;
    }

    updateToggleButton(theme) {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    setupToggleButton() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
                this.applyTheme(newTheme);
                
                // Add click animation
                toggleBtn.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    toggleBtn.style.transform = '';
                }, 150);
            });
        }
    }

    async setupAuthNavigation() {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.user) {
                    this.updateNavForAuthenticatedUser(result.user);
                }
            }
        } catch (error) {
            console.log('User not authenticated');
        }
    }

    updateNavForAuthenticatedUser(user) {
        // Update dashboard link based on user role
        const dashboardLink = document.querySelector('a[href="/dashboard"]');
        if (dashboardLink && user.role === 'admin') {
            dashboardLink.href = '/admin/dashboard';
            dashboardLink.innerHTML = '<i class="fas fa-crown me-2"></i>Admin Dashboard';
        }
        
        // Update navbar for authenticated users
        this.showAuthenticatedNav(user);
    }

    showAuthenticatedNav(user) {
        const authLinks = document.querySelector('.auth-links');
        if (authLinks) {
            const dashboardUrl = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
            const dashboardText = user.role === 'admin' ? '👑 Admin Dashboard' : '📊 Dashboard';
            
            authLinks.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="${dashboardUrl}">
                        ${dashboardText}
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" onclick="logout()">
                        <i class="fas fa-sign-out-alt me-2"></i>Logout
                    </a>
                </li>
            `;
        }
    }

    watchForSystemChanges() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin-theme');
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        // Force logout locally
        localStorage.clear();
        window.location.href = '/';
    }
}

// Auto-hide navbar on scroll
function setupNavbarAutoHide() {
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    if (navbar && !navbar.classList.contains('navbar-static')) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
    setupNavbarAutoHide();
});

document.addEventListener("DOMContentLoaded", () => {
    const faders = document.querySelectorAll(".fade-in");
    const appearOptions = { threshold: 0.2 };
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("appear");
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);
    faders.forEach(fader => appearOnScroll.observe(fader));
});

function animateCounter(el, duration, startTime) {
  const target = parseFloat(el.getAttribute('data-target'));

  function update(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    let value = target * progress;

    if (el.id === 'satisfactionRate') {
      el.textContent = Math.floor(value) + '%';
    } else if (el.id === 'averageRating') {
      el.textContent = value.toFixed(1);
    } else {
      el.textContent = Math.floor(value);
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      // This ensures that it ends exactly at target
      if (el.id === 'satisfactionRate') el.textContent = target + '%';
      else if (el.id === 'averageRating') el.textContent = target.toFixed(1);
      else el.textContent = target;
    }
  }

  requestAnimationFrame(update);
}

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top <= window.innerHeight && rect.bottom >= 0;
}

let animated = false;
window.addEventListener('scroll', () => {
  if (!animated && isInViewport(document.querySelector('.review-stats'))) {
    animated = true;
    const duration = 800; // 0.8 seconds
    document.querySelectorAll('.review-stats h3').forEach(el => animateCounter(el, duration));
  }
});