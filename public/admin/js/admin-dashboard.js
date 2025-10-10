class AdminDashboard {
    constructor() {
        this.categories = [];
        this.menuItems = [];
        this.bookings = [];
        this.users = [];
        this.currentEditId = null;
        this.init();
    }

    async init() {
        await this.loadData();
        this.updateStats();
        this.setupEventListeners();
        this.renderCategories();
        this.renderMenuItems();
        this.renderBookings();
        this.renderUsers();
    }

    async loadData() {
        try {
            // Load categories
            const categoriesResponse = await fetch('/api/categories');
            if (categoriesResponse.ok) {
                const categoriesResult = await categoriesResponse.json();
                this.categories = categoriesResult.categories || [];
            }

            // Load menu items
            const itemsResponse = await fetch('/api/menu-items');
            if (itemsResponse.ok) {
                const itemsResult = await itemsResponse.json();
                this.menuItems = itemsResult.items || [];
            }

            // Load bookings
            const bookingsResponse = await fetch('/api/bookings');
            if (bookingsResponse.ok) {
                const bookingsResult = await bookingsResponse.json();
                this.bookings = bookingsResult.bookings || [];
            }

            // Load users
            const usersResponse = await fetch('/api/users');
            if (usersResponse.ok) {
                const usersResult = await usersResponse.json();
                this.users = usersResult.users || [];
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    updateStats() {
        document.getElementById('totalCategories').textContent = this.categories.length;
        document.getElementById('totalItems').textContent = this.menuItems.length;
        document.getElementById('totalBookings').textContent = this.bookings.length;
        document.getElementById('totalUsers').textContent = this.users.length;
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const target = e.target.getAttribute('data-bs-target');
                if (target === '#categories') {
                    this.renderCategories();
                } else if (target === '#menu-items') {
                    this.renderMenuItems();
                    this.populateCategorySelect();
                }
            });
        });
    }

    renderCategories() {
        const container = document.getElementById('categoriesContainer');
        
        if (this.categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-layer-group"></i>
                    <h4>No Categories Created Yet</h4>
                    <p>Start by creating your first category using the "Add New Category" button above</p>
                </div>
            `;
        } else {
            const categoriesHTML = this.categories.map(category => `
                <div class="category-card" data-category-id="${category._id}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-2" style="color: var(--dash-accent);">${category.name}</h6>
                            <p class="mb-3 text-muted">${category.description || 'No description available'}</p>
                            <small class="text-muted">Items can only be added from Menu Items tab</small>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="editCategory('${category._id}')">
                                    <i class="fas fa-edit me-2"></i>Edit
                                </a></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="deleteCategory('${category._id}')">
                                    <i class="fas fa-trash me-2"></i>Delete
                                </a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            `).join('');
            
            container.innerHTML = categoriesHTML;
        }
    }

    renderMenuItems() {
        const container = document.getElementById('menuItemsContainer');
        
        if (this.menuItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <h4>No Menu Items Found</h4>
                    <p>Ready to create something amazing? Add your first delicious item using the "Add Menu Item" button above</p>
                </div>
            `;
        } else {
            const itemsHTML = this.menuItems.map(item => {
                const category = this.categories.find(c => c._id === item.category);
                return `
                    <div class="item-card" data-item-id="${item._id}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <div class="d-flex align-items-center mb-2">
                                    <h6 class="mb-0 me-3" style="color: var(--dash-accent);">${item.name}</h6>
                                    <span class="badge bg-secondary">${category ? category.name : 'Unknown Category'}</span>
                                </div>
                                <p class="mb-2 text-muted">${item.description || 'No description available'}</p>
                                <div class="d-flex align-items-center">
                                    <span class="fw-bold text-success me-3">$${item.price}</span>
                                    ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">` : '<div class="bg-secondary rounded d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;"><i class="fas fa-image text-white"></i></div>'}
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="editMenuItem('${item._id}')">
                                        <i class="fas fa-edit me-2"></i>Edit
                                    </a></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="deleteMenuItem('${item._id}')">
                                        <i class="fas fa-trash me-2"></i>Delete
                                    </a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            container.innerHTML = itemsHTML;
        }
    }

    renderBookings() {
        const tbody = document.getElementById('bookingsTableBody');
        
        if (this.bookings.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5">
                        <div class="stat-icon mx-auto mb-3" style="width: 50px; height: 50px; font-size: 1.25rem;">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <h6 style="color: var(--text-primary);">No Bookings Found</h6>
                        <p style="color: var(--text-secondary); margin: 0;">Bookings will appear here once customers make reservations</p>
                    </td>
                </tr>
            `;
        } else {
            const bookingsHTML = this.bookings.map(booking => `
                <tr>
                    <td>
                        <div>
                            <strong>${booking.name}</strong><br>
                            <small class="text-muted">${booking.email}</small>
                        </div>
                    </td>
                    <td>
                        <div>
                            ${new Date(booking.date).toLocaleDateString()}<br>
                            <small class="text-muted">${booking.time}</small>
                        </div>
                    </td>
                    <td><span class="badge bg-info">${booking.guests} guests</span></td>
                    <td><span class="badge bg-${booking.status === 'confirmed' ? 'success' : 'warning'}">${booking.status}</span></td>
                    <td>
                        <div class="dropdown">
                            <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                Actions
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="updateBookingStatus('${booking._id}', 'confirmed')">
                                    <i class="fas fa-check me-2"></i>Confirm
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="updateBookingStatus('${booking._id}', 'cancelled')">
                                    <i class="fas fa-times me-2"></i>Cancel
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="deleteBooking('${booking._id}')">
                                    <i class="fas fa-trash me-2"></i>Delete
                                </a></li>
                            </ul>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            tbody.innerHTML = bookingsHTML;
        }
    }

    renderUsers() {
        const tbody = document.getElementById('usersTableBody');
        
        if (this.users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5">
                        <div class="stat-icon mx-auto mb-3" style="width: 50px; height: 50px; font-size: 1.25rem;">
                            <i class="fas fa-user-friends"></i>
                        </div>
                        <h6 style="color: var(--text-primary);">No Users Found</h6>
                        <p style="color: var(--text-secondary); margin: 0;">Registered users will appear here</p>
                    </td>
                </tr>
            `;
        } else {
            const usersHTML = this.users.map(user => `
                <tr>
                    <td>
                        <div>
                            <strong>${user.firstName} ${user.lastName}</strong><br>
                            ${user.phone ? `<small class="text-muted">${user.phone}</small>` : ''}
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td><span class="badge bg-${user.role === 'admin' ? 'danger' : 'primary'}">${user.role}</span></td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                        <div class="dropdown">
                            <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                Actions
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="showUserInfo('${user._id}')">
                                    <i class="fas fa-info-circle me-2"></i>Info
                                </a></li>
                            </ul>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            tbody.innerHTML = usersHTML;
        }
    }

    populateCategorySelect() {
        const select = document.getElementById('itemCategory');
        select.innerHTML = '<option value="">Select a category</option>';
        
        this.categories.forEach(category => {
            select.innerHTML += `<option value="${category._id}">${category.name}</option>`;
        });
    }
}

// Modal functions
function showAddCategoryModal() {
    document.getElementById('categoryModalTitle').textContent = 'Add Category';
    document.getElementById('categoryForm').reset();
    adminDashboard.currentEditId = null;
    new bootstrap.Modal(document.getElementById('categoryModal')).show();
}

function showAddItemModal() {
    document.getElementById('itemModalTitle').textContent = 'Add Item to Category';
    document.getElementById('itemForm').reset();
    adminDashboard.currentEditId = null;
    adminDashboard.populateCategorySelect();
    new bootstrap.Modal(document.getElementById('itemModal')).show();
}

function editCategory(id) {
    const category = adminDashboard.categories.find(c => c._id === id);
    if (category) {
        document.getElementById('categoryModalTitle').textContent = 'Edit Category';
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';
        adminDashboard.currentEditId = id;
        new bootstrap.Modal(document.getElementById('categoryModal')).show();
    }
}

function editMenuItem(id) {
    const item = adminDashboard.menuItems.find(i => i._id === id);
    if (item) {
        document.getElementById('itemModalTitle').textContent = 'Edit Menu Item';
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemDescription').value = item.description || '';
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemImage').value = item.imageUrl || '';
        document.getElementById('itemCategory').value = item.category;
        adminDashboard.currentEditId = id;
        adminDashboard.populateCategorySelect();
        new bootstrap.Modal(document.getElementById('itemModal')).show();
    }
}

async function saveCategory() {
    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDescription').value;
    
    if (!name.trim()) {
        alert('Please enter a category name');
        return;
    }
    
    const data = { name: name.trim(), description: description.trim() };
    
    try {
        const url = adminDashboard.currentEditId 
            ? `/api/categories/${adminDashboard.currentEditId}`
            : '/api/categories';
        const method = adminDashboard.currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            await adminDashboard.loadData();
            adminDashboard.updateStats();
            adminDashboard.renderCategories();
            bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
        } else {
            alert(result.message || 'Error saving category');
        }
    } catch (error) {
        console.error('Error saving category:', error);
        alert('Error saving category');
    }
}

async function saveMenuItem() {
    const name = document.getElementById('itemName').value;
    const description = document.getElementById('itemDescription').value;
    const price = document.getElementById('itemPrice').value;
    const imageUrl = document.getElementById('itemImage').value;
    const categoryId = document.getElementById('itemCategory').value;
    
    if (!name.trim() || !price || !categoryId) {
        alert('Please fill in all required fields');
        return;
    }
    
    const data = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        imageUrl: imageUrl.trim(),
        categoryId: categoryId
    };
    
    try {
        const url = adminDashboard.currentEditId 
            ? `/api/menu-items/${adminDashboard.currentEditId}`
            : '/api/menu-items';
        const method = adminDashboard.currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            await adminDashboard.loadData();
            adminDashboard.updateStats();
            adminDashboard.renderMenuItems();
            bootstrap.Modal.getInstance(document.getElementById('itemModal')).hide();
        } else {
            alert(result.message || 'Error saving menu item');
        }
    } catch (error) {
        console.error('Error saving menu item:', error);
        alert('Error saving menu item');
    }
}

async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category? This will also delete all menu items in this category.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
            await adminDashboard.loadData();
            adminDashboard.updateStats();
            adminDashboard.renderCategories();
            adminDashboard.renderMenuItems();
        } else {
            alert(result.message || 'Error deleting category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category');
    }
}

async function deleteMenuItem(id) {
    if (!confirm('Are you sure you want to delete this menu item?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' });
        const result = await response.json();
        
        if (result.success) {
            await adminDashboard.loadData();
            adminDashboard.updateStats();
            adminDashboard.renderMenuItems();
        } else {
            alert(result.message || 'Error deleting menu item');
        }
    } catch (error) {
        console.error('Error deleting menu item:', error);
        alert('Error deleting menu item');
    }
}

// Show user information
function showUserInfo(userId) {
    const user = adminDashboard.users.find(u => u._id === userId);
    if (user) {
        const userInfo = `
User Information:

Name: ${user.firstName} ${user.lastName}
Email: ${user.email}
Role: ${user.role}
Phone: ${user.phone || 'Not provided'}
Joined: ${new Date(user.createdAt).toLocaleDateString()}
Status: Active
        `;
        alert(userInfo);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});
