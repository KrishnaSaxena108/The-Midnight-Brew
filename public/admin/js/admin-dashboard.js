class AdminDashboard {
    constructor() {
        this.categories = [];
        this.menuItems = [];
        this.bookings = [];
        this.users = [];
        this.images = [];
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
    const imageFile = document.getElementById('itemImage').files[0];
    const categoryId = document.getElementById('itemCategory').value;
    
    if (!name.trim() || !price || !categoryId) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        let imageId = null;
        
        // Upload image first if a file is selected
        if (imageFile) {
            const imageFormData = new FormData();
            imageFormData.append('image', imageFile);
            imageFormData.append('category', 'menu-item');
            imageFormData.append('alt', name.trim());
            imageFormData.append('description', `Image for ${name.trim()}`);
            
            const imageResponse = await fetch('/api/images/upload', {
                method: 'POST',
                body: imageFormData
            });
            
            if (imageResponse.ok) {
                const imageResult = await imageResponse.json();
                imageId = imageResult.image.id;
            } else {
                alert('Failed to upload image');
                return;
            }
        }
        
        const data = {
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            categoryId: categoryId,
            ...(imageId && { imageId: imageId })
        };
        
        const url = window.adminDashboard.currentEditId 
            ? `/api/menu-items/${window.adminDashboard.currentEditId}`
            : '/api/menu-items';
        const method = window.adminDashboard.currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            await window.adminDashboard.loadData();
            window.adminDashboard.updateStats();
            window.adminDashboard.renderMenuItems();
            bootstrap.Modal.getInstance(document.getElementById('itemModal')).hide();
            showNotification('Menu item saved successfully!', 'success');
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

// ============ IMAGE MANAGEMENT FUNCTIONS ============

async function loadImages() {
    try {
        const response = await fetch('/api/images');
        if (response.ok) {
            const result = await response.json();
            window.adminDashboard.images = result.images || [];
            renderImages();
        }
    } catch (error) {
        console.error('Error loading images:', error);
        showNotification('Failed to load images', 'error');
    }
}

function renderImages() {
    const container = document.getElementById('imagesContainer');
    if (!container) return;

    const images = window.adminDashboard.images || [];

    if (images.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-images fa-3x text-muted mb-3"></i>
                <h4>No Images Found</h4>
                <p>Start building your image library by uploading your first image!</p>
            </div>
        `;
        return;
    }

    const imagesHTML = images.map(image => `
        <div class="col-lg-2 col-md-3 col-sm-4 col-6 mb-3">
            <div class="image-card" style="
                background: var(--bg-surface);
                border: 1px solid var(--border-primary);
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            " onclick="showImageDetails('${image.id}')">
                <div style="aspect-ratio: 1; overflow: hidden;">
                    <img src="${image.url}" alt="${image.alt}" style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    ">
                </div>
                <div style="padding: 0.5rem;">
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
                        <span class="badge bg-secondary">${image.category}</span>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-primary); font-weight: 500; 
                               white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${image.originalName}
                    </div>
                    <div style="font-size: 0.7rem; color: var(--text-secondary);">
                        ${formatFileSize(image.size)}
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = `<div class="row">${imagesHTML}</div>`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function showImageDetails(imageId) {
    try {
        const response = await fetch(`/api/images/${imageId}`);
        if (response.ok) {
            const result = await response.json();
            const image = result.image;
            
            document.getElementById('detailImageId').value = image.id;
            document.getElementById('detailImagePreview').src = image.url;
            document.getElementById('detailImagePreview').alt = image.alt;
            document.getElementById('detailImageAlt').value = image.alt || '';
            document.getElementById('detailImageDescription').value = image.description || '';
            document.getElementById('detailImageCategory').value = image.category || 'general';
            document.getElementById('detailImageSize').textContent = formatFileSize(image.size);
            document.getElementById('detailImageType').textContent = image.mimetype;
            document.getElementById('detailImageUrl').value = window.location.origin + image.url;
            
            const modal = new bootstrap.Modal(document.getElementById('imageDetailModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Error loading image details:', error);
        showNotification('Failed to load image details', 'error');
    }
}

async function updateImageDetails() {
    try {
        const imageId = document.getElementById('detailImageId').value;
        const alt = document.getElementById('detailImageAlt').value;
        const description = document.getElementById('detailImageDescription').value;
        const category = document.getElementById('detailImageCategory').value;

        const response = await fetch(`/api/images/${imageId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                alt: alt,
                description: description,
                category: category
            })
        });

        if (response.ok) {
            showNotification('Image updated successfully', 'success');
            await loadImages();
            bootstrap.Modal.getInstance(document.getElementById('imageDetailModal')).hide();
        } else {
            const errorData = await response.json();
            showNotification(errorData.message || 'Failed to update image', 'error');
        }
    } catch (error) {
        console.error('Error updating image:', error);
        showNotification('Failed to update image', 'error');
    }
}

async function deleteImage() {
    const imageId = document.getElementById('detailImageId').value;
    
    if (confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
        try {
            const response = await fetch(`/api/images/${imageId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showNotification('Image deleted successfully', 'success');
                await loadImages();
                bootstrap.Modal.getInstance(document.getElementById('imageDetailModal')).hide();
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || 'Failed to delete image', 'error');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            showNotification('Failed to delete image', 'error');
        }
    }
}

function filterImages() {
    // Implement client-side filtering if needed
    loadImages();
}

// Image upload functions
function previewItemImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            const img = document.getElementById('imagePreviewImg');
            img.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function clearImagePreview() {
    const preview = document.getElementById('imagePreview');
    const input = document.getElementById('itemImage');
    preview.style.display = 'none';
    input.value = '';
}

function previewUploadImages(input) {
    const files = Array.from(input.files);
    const container = document.getElementById('uploadPreviewContainer');
    const list = document.getElementById('uploadPreviewList');
    const btn = document.getElementById('uploadImagesBtn');
    
    if (files.length > 0) {
        container.style.display = 'block';
        list.innerHTML = '';
        
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.createElement('div');
                preview.style.cssText = 'position: relative; display: inline-block; margin-right: 10px;';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}" style="
                        width: 80px; 
                        height: 80px; 
                        object-fit: cover; 
                        border-radius: 4px; 
                        border: 1px solid var(--border-primary);
                    ">
                    <div style="
                        position: absolute; 
                        bottom: 0; 
                        left: 0; 
                        right: 0; 
                        background: rgba(0,0,0,0.7); 
                        color: white; 
                        padding: 2px 4px; 
                        font-size: 10px; 
                        border-radius: 0 0 4px 4px;
                    ">
                        ${file.name.length > 12 ? file.name.substring(0, 12) + '...' : file.name}
                    </div>
                `;
                list.appendChild(preview);
            };
            reader.readAsDataURL(file);
        });
        
        btn.disabled = false;
    } else {
        container.style.display = 'none';
        btn.disabled = true;
    }
}

function clearUploadForm() {
    document.getElementById('uploadImages').value = '';
    document.getElementById('uploadCategory').value = 'general';
    document.getElementById('uploadPreviewContainer').style.display = 'none';
    document.getElementById('uploadImagesBtn').disabled = true;
    document.getElementById('uploadProgress').style.display = 'none';
}

async function uploadImages() {
    const fileInput = document.getElementById('uploadImages');
    const category = document.getElementById('uploadCategory').value;
    const files = fileInput.files;
    
    if (files.length === 0) {
        showNotification('Please select images to upload', 'error');
        return;
    }
    
    const progressDiv = document.getElementById('uploadProgress');
    const progressBar = progressDiv.querySelector('.progress-bar');
    const uploadBtn = document.getElementById('uploadImagesBtn');
    
    progressDiv.style.display = 'block';
    uploadBtn.disabled = true;
    
    let uploadedCount = 0;
    let totalCount = files.length;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('image', file);
        formData.append('category', category);
        formData.append('alt', file.name.replace(/\.[^/.]+$/, ""));
        formData.append('description', `Uploaded image: ${file.name}`);
        
        try {
            const response = await fetch('/api/images/upload', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                uploadedCount++;
            } else {
                console.error(`Failed to upload ${file.name}`);
            }
            
            // Update progress
            const progress = (i + 1) / totalCount * 100;
            progressBar.style.width = progress + '%';
            
        } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
        }
    }
    
    progressDiv.style.display = 'none';
    uploadBtn.disabled = false;
    
    if (uploadedCount > 0) {
        showNotification(`Successfully uploaded ${uploadedCount} image(s)`, 'success');
        await loadImages();
        bootstrap.Modal.getInstance(document.getElementById('imageUploadModal')).hide();
        clearUploadForm();
    } else {
        showNotification('Failed to upload images', 'error');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
    
    // Load images when the images tab is clicked
    const imagesTab = document.getElementById('images-tab');
    if (imagesTab) {
        imagesTab.addEventListener('click', () => {
            loadImages();
        });
    }
});
