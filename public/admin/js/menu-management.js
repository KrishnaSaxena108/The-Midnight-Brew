class MenuManager {
    constructor(token) {
        this.headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    showSuccessMessage(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(34, 197, 94, 0.9);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            animation: slideInRight 0.3s ease;
        `;
        notification.innerHTML = `<i class="fas fa-check-circle" style="margin-right:0.5rem;"></i>${message}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showErrorMessage(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(239, 68, 68, 0.9);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            animation: slideInRight 0.3s ease;
        `;
        notification.innerHTML = `<i class="fas fa-exclamation-triangle" style="margin-right:0.5rem;"></i>${message}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    validateMenuItem(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Item name must be at least 2 characters long');
        }
        
        if (!data.category) {
            errors.push('Category is required');
        }
        
        if (!data.price || data.price <= 0) {
            errors.push('Price must be greater than 0');
        }
        
        if (data.price > 1000) {
            errors.push('Price seems too high (max $1000)');
        }
        
        if (data.description && data.description.length > 500) {
            errors.push('Description too long (max 500 characters)');
        }
        
        return errors;
    }

    validateCategory(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length < 2) {
            errors.push('Category name must be at least 2 characters long');
        }
        
        if (data.name && data.name.length > 50) {
            errors.push('Category name too long (max 50 characters)');
        }
        
        if (data.description && data.description.length > 200) {
            errors.push('Description too long (max 200 characters)');
        }
        
        return errors;
    }

    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }

    getAvailabilityBadge(available) {
        return available 
            ? '<span style="background:rgba(34,197,94,0.2);color:#10b981;padding:0.25rem 0.5rem;border-radius:12px;font-size:0.75rem;font-weight:600;">Available</span>'
            : '<span style="background:rgba(239,68,68,0.2);color:#ff6b6b;padding:0.25rem 0.5rem;border-radius:12px;font-size:0.75rem;font-weight:600;">Unavailable</span>';
    }

    exportMenuItemsToCSV(items) {
        const headers = ['Name', 'Category', 'Price', 'Description', 'Available', 'Image'];
        const csvContent = [
            headers.join(','),
            ...items.map(item => [
                `"${item.name}"`,
                `"${item.category}"`,
                item.price,
                `"${(item.description || '').replace(/"/g, '""')}"`,
                item.available,
                `"${item.image || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `menu-items-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    async bulkUpdateAvailability(itemIds, available) {
        const results = [];
        for (const id of itemIds) {
            try {
                const res = await fetch(`/api/admin/menu-items/${id}/availability`, {
                    method: 'PATCH',
                    headers: this.headers,
                    body: JSON.stringify({ available })
                });
                results.push({ id, success: res.ok });
            } catch (error) {
                results.push({ id, success: false, error: error.message });
            }
        }
        return results;
    }
}

const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

if (typeof window !== 'undefined') {
    window.MenuManager = MenuManager;
}