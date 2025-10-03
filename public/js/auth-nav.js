// Universal navigation authentication handler
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
});

async function initializeNavigation() {
    // Check if this is an auth page (login/register) - skip auth check
    const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
    
    if (!isAuthPage) {
        await checkAuthStateAndUpdateNav();
    } else {
        // For auth pages, just show the basic navigation without auth elements
        showUnauthenticatedNav();
    }
    
    setupLogout();
}

async function checkAuthStateAndUpdateNav() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showUnauthenticatedNav();
            return;
        }

        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            showAuthenticatedNav(result.user);
        } else {
            localStorage.clear();
            showUnauthenticatedNav();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.clear();
        showUnauthenticatedNav();
    }
}

function showAuthenticatedNav(user) {
    // Hide login/register links
    const loginNavItem = document.getElementById('loginNavItem');
    const registerNavItem = document.getElementById('registerNavItem');
    
    if (loginNavItem) loginNavItem.style.display = 'none';
    if (registerNavItem) registerNavItem.style.display = 'none';
    
    // Show dashboard and logout
    const dashboardNavItem = document.getElementById('dashboardNavItem');
    const logoutNavItem = document.getElementById('logoutNavItem');
    
    if (dashboardNavItem) dashboardNavItem.style.display = 'block';
    if (logoutNavItem) logoutNavItem.style.display = 'block';
    
    // Update booking link to go directly to booking (no auth check needed)
    const bookingLink = document.querySelector('#bookingNavItem a');
    if (bookingLink) {
        bookingLink.href = '/booking';
        bookingLink.title = '';
    }
    
    // Add user name to a welcome element if it exists
    const userNameElement = document.getElementById('navUserName');
    if (userNameElement && user) {
        userNameElement.textContent = user.firstName;
    }
}

function showUnauthenticatedNav() {
    // Show login/register links
    const loginNavItem = document.getElementById('loginNavItem');
    const registerNavItem = document.getElementById('registerNavItem');
    
    if (loginNavItem) loginNavItem.style.display = 'block';
    if (registerNavItem) registerNavItem.style.display = 'block';
    
    // Hide dashboard and logout
    const dashboardNavItem = document.getElementById('dashboardNavItem');
    const logoutNavItem = document.getElementById('logoutNavItem');
    
    if (dashboardNavItem) dashboardNavItem.style.display = 'none';
    if (logoutNavItem) logoutNavItem.style.display = 'none';
    
    // Update booking link to redirect to login
    const bookingLink = document.querySelector('#bookingNavItem a');
    if (bookingLink) {
        bookingLink.href = '/login';
        bookingLink.title = 'Login required to make bookings';
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                localStorage.clear();
                
                // Redirect based on current page
                const currentPath = window.location.pathname;
                if (currentPath === '/dashboard' || currentPath === '/booking') {
                    window.location.href = '/';
                } else {
                    window.location.reload();
                }
            } catch (error) {
                console.error('Logout error:', error);
                localStorage.clear();
                window.location.href = '/';
            }
        });
    }
}

// Export functions for use in other scripts
window.AuthNavigation = {
    checkAuthStateAndUpdateNav,
    showAuthenticatedNav,
    showUnauthenticatedNav
};