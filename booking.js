// ===== THE MIDNIGHT BREW - BOOKING SYSTEM ===== //

// ===== GLOBAL STATE & ELEMENTS (DEFINED BEFORE DOMContentLoaded) ===== //
let bookingState = {
    date: null,
    time: null,
    partySize: null,
    preferences: [],
    occasion: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    requests: ''
};

let elements = {
    form: null,
    dateInput: null,
    partySizeSelect: null,
    timeSlots: null,
    featureTags: null,
    firstNameInput: null,
    lastNameInput: null,
    emailInput: null,
    phoneInput: null,
    occasionSelect: null,
    requestsTextarea: null,
    bookingSummary: null,
    summaryDate: null,
    summaryTime: null,
    summaryParty: null,
    summaryName: null,
    step1: null,
    step2: null,
    step3: null
};

document.addEventListener('DOMContentLoaded', function() {
    // ===== CHECK AUTHENTICATION ===== //
    checkAuthenticationStatus();
    
    // ===== START TOKEN EXPIRY MONITORING ===== //
    // Only start monitoring if user is authenticated
    if (Auth.isAuthenticated()) {
        Auth.checkTokenOnLoad(); // Check immediately
        Auth.startTokenExpiryMonitor(true); // Start periodic checks
    }
    
    // ===== APPLY THEME ON LOAD ===== //
    applyCurrentTheme();
    
    // ===== INITIALIZE ELEMENTS OBJECT ===== //
    elements = {
        form: document.getElementById('bookingForm'),
        dateInput: document.getElementById('bookingDate'),
        partySizeSelect: document.getElementById('partySize'),
        timeSlots: document.querySelectorAll('.time-slot'),
        featureTags: document.querySelectorAll('.feature-tag'),
        firstNameInput: document.getElementById('firstName'),
        lastNameInput: document.getElementById('lastName'),
        emailInput: document.getElementById('email'),
        phoneInput: document.getElementById('phone'),
        occasionSelect: document.getElementById('occasion'),
        requestsTextarea: document.getElementById('requests'),
        bookingSummary: document.getElementById('bookingSummary'),
        summaryDate: document.getElementById('summaryDate'),
        summaryTime: document.getElementById('summaryTime'),
        summaryParty: document.getElementById('summaryParty'),
        summaryName: document.getElementById('summaryName'),
        step1: document.getElementById('step1'),
        step2: document.getElementById('step2'),
        step3: document.getElementById('step3')
    };

    // ===== THEME TOGGLE HANDLER ===== //
    // Theme toggle is handled by theme.js - we just need to listen for changes
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            // Small delay to let theme.js update the data-theme attribute
            setTimeout(() => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                applyThemeToBookingPage(currentTheme);
            }, 10);
        });
    }

    // ===== INITIALIZE DATE CONSTRAINTS ===== //
    function initializeDatePicker() {
        console.log('📅 Initializing date picker...');
        const dateInput = document.getElementById('bookingDate');
        
        if (!dateInput) {
            console.error('❌ Date input not found!');
            return;
        }
        
        const today = new Date();
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3); // Allow booking up to 3 months ahead
        
        dateInput.min = today.toISOString().split('T')[0];
        dateInput.max = maxDate.toISOString().split('T')[0];
        
        // Set default to tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
        bookingState.date = tomorrow.toISOString().split('T')[0];
        
        // Update elements reference
        elements.dateInput = dateInput;
        console.log('✅ Date picker initialized');
        updateSummary();
    }

    // ===== TIME SLOT MANAGEMENT ===== //
    function initializeTimeSlots() {
        console.log('🕐 Initializing time slots...');
        // Re-query time slots to ensure they're visible
        const timeSlots = document.querySelectorAll('.time-slot');
        console.log(`   Found ${timeSlots.length} time slot elements`);
        
        timeSlots.forEach((slot, index) => {
            console.log(`   Attaching click handler to slot ${index + 1}: ${slot.textContent.trim()}`);
            slot.addEventListener('click', handleTimeSlotClick);
        });
        
        // Update elements reference
        elements.timeSlots = timeSlots;
        console.log('✅ Time slots initialized');
    }

    function handleTimeSlotClick(e) {
        console.log('🖱️ Time slot clicked!', e.currentTarget.textContent.trim());
        const slot = e.currentTarget;
        
        // Don't select if unavailable
        if (slot.classList.contains('unavailable')) {
            console.log('   ⛔ Slot unavailable');
            showNotification('This time slot is not available', 'error');
            return;
        }
        
        console.log('   ✅ Selecting time slot');
        // Remove previous selection
        elements.timeSlots.forEach(s => s.classList.remove('selected'));
        
        // Add selection to clicked slot
        slot.classList.add('selected');
        bookingState.time = slot.dataset.time;
        console.log('   📅 Time set to:', bookingState.time);
        
        // Update step indicator
        updateStepIndicator(2);
        updateSummary();
        
        // Smooth scroll to contact info if on mobile
        if (window.innerWidth < 768) {
            setTimeout(() => {
                elements.firstNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }

    // ===== SIMULATE TIME SLOT AVAILABILITY ===== //
    function updateTimeSlotAvailability() {
        const selectedDate = new Date(elements.dateInput.value);
        const dayOfWeek = selectedDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        elements.timeSlots.forEach(slot => {
            const time = parseInt(slot.dataset.time.split(':')[0]);
            
            // Reset classes
            slot.classList.remove('unavailable', 'selected');
            
            // Simulate some slots being unavailable
            if (isWeekend && (time === 12 || time === 13 || time === 19)) {
                slot.classList.add('unavailable');
            } else if (!isWeekend && Math.random() > 0.85) {
                // Random 15% unavailability on weekdays
                slot.classList.add('unavailable');
            }
        });
        
        // Clear time selection if previously selected time is now unavailable
        if (bookingState.time) {
            const selectedSlot = document.querySelector(`[data-time="${bookingState.time}"]`);
            if (selectedSlot && selectedSlot.classList.contains('unavailable')) {
                bookingState.time = null;
                updateSummary();
            } else if (selectedSlot) {
                selectedSlot.classList.add('selected');
            }
        }
        
        // Reapply theme to new slots
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        applyThemeToBookingPage(currentTheme);
    }

    // ===== TABLE PREFERENCES ===== //
    function initializePreferences() {
        console.log('💝 Initializing table preferences...');
        // Re-query feature tags to ensure they're visible
        const featureTags = document.querySelectorAll('.feature-tag');
        console.log(`   Found ${featureTags.length} preference elements`);
        
        featureTags.forEach((tag, index) => {
            const feature = tag.dataset.feature;
            console.log(`   Attaching click handler to preference ${index + 1}: ${feature}`);
            tag.addEventListener('click', handlePreferenceClick);
        });
        
        // Update elements reference
        elements.featureTags = featureTags;
        console.log('✅ Table preferences initialized');
    }

    function handlePreferenceClick(e) {
        console.log('🖱️ Preference clicked!', e.currentTarget.dataset.feature);
        const tag = e.currentTarget;
        const feature = tag.dataset.feature;
        
        tag.classList.toggle('selected');
        console.log('   Toggle result:', tag.classList.contains('selected') ? 'SELECTED' : 'DESELECTED');
        
        if (tag.classList.contains('selected')) {
            if (!bookingState.preferences.includes(feature)) {
                bookingState.preferences.push(feature);
                console.log('   ✅ Added to preferences:', feature);
            }
        } else {
            bookingState.preferences = bookingState.preferences.filter(p => p !== feature);
            console.log('   ❌ Removed from preferences:', feature);
        }
        console.log('   Current preferences:', bookingState.preferences);
    }

    // ===== STEP INDICATOR ===== //
    function updateStepIndicator(currentStep) {
        // Reset all steps
        [elements.step1, elements.step2, elements.step3].forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        // Mark completed and active steps
        if (currentStep >= 1) {
            elements.step1.classList.add(currentStep === 1 ? 'active' : 'completed');
        }
        if (currentStep >= 2) {
            elements.step2.classList.add(currentStep === 2 ? 'active' : 'completed');
        }
        if (currentStep >= 3) {
            elements.step3.classList.add('active');
            if (currentStep > 3) elements.step3.classList.add('completed');
        }
    }

    // ===== BOOKING SUMMARY ===== //
    function updateSummary() {
        const hasBasicInfo = bookingState.date && bookingState.partySize;
        
        if (!hasBasicInfo) {
            elements.bookingSummary.style.display = 'none';
            return;
        }
        
        elements.bookingSummary.style.display = 'block';
        
        // Format date
        if (bookingState.date) {
            const date = new Date(bookingState.date + 'T00:00:00');
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            elements.summaryDate.textContent = date.toLocaleDateString('en-US', options);
        }
        
        // Format time
        if (bookingState.time) {
            const [hours, minutes] = bookingState.time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            elements.summaryTime.textContent = `${displayHour}:${minutes} ${ampm}`;
        } else {
            elements.summaryTime.textContent = '-';
        }
        
        // Party size
        elements.summaryParty.textContent = bookingState.partySize ? 
            `${bookingState.partySize} ${bookingState.partySize === '1' ? 'Guest' : 'Guests'}` : '-';
        
        // Name
        const fullName = `${bookingState.firstName} ${bookingState.lastName}`.trim();
        elements.summaryName.textContent = fullName || '-';
    }

    // ===== FORM VALIDATION ===== //
    function validateStep1() {
        return bookingState.date && bookingState.partySize;
    }

    function validateStep2() {
        return bookingState.time;
    }

    function validateStep3() {
        return bookingState.firstName && 
               bookingState.lastName && 
               bookingState.email && 
               bookingState.phone;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        const re = /^[\d\s\-\+\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    }

    // ===== EVENT LISTENERS SETUP ===== //
    function setupEventListeners() {
        console.log('📡 Setting up event listeners...');
        
        const dateInput = document.getElementById('bookingDate');
        const partySizeSelect = document.getElementById('partySize');
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const occasionSelect = document.getElementById('occasion');
        const requestsTextarea = document.getElementById('requests');
        
        if (dateInput) {
            dateInput.addEventListener('change', function() {
                bookingState.date = this.value;
                updateTimeSlotAvailability();
                updateSummary();
                updateStepIndicator(1);
            });
            elements.dateInput = dateInput;
        }

        if (partySizeSelect) {
            partySizeSelect.addEventListener('change', function() {
                bookingState.partySize = this.value;
                updateSummary();
                
                if (this.value === '8') {
                    showNotification('For parties of 8 or more, please call us at +1 (555) 123-4567', 'info');
                }
            });
            elements.partySizeSelect = partySizeSelect;
        }

        if (firstNameInput) {
            firstNameInput.addEventListener('input', function() {
                bookingState.firstName = this.value;
                updateSummary();
                if (validateStep3()) updateStepIndicator(3);
            });
            elements.firstNameInput = firstNameInput;
        }

        if (lastNameInput) {
            lastNameInput.addEventListener('input', function() {
                bookingState.lastName = this.value;
                updateSummary();
                if (validateStep3()) updateStepIndicator(3);
            });
            elements.lastNameInput = lastNameInput;
        }

        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                if (this.value && !validateEmail(this.value)) {
                    this.classList.add('is-invalid');
                    showNotification('Please enter a valid email address', 'error');
                } else {
                    this.classList.remove('is-invalid');
                    bookingState.email = this.value;
                }
            });
            elements.emailInput = emailInput;
        }

        if (phoneInput) {
            phoneInput.addEventListener('blur', function() {
                if (this.value && !validatePhone(this.value)) {
                    this.classList.add('is-invalid');
                    showNotification('Please enter a valid phone number', 'error');
                } else {
                    this.classList.remove('is-invalid');
                    bookingState.phone = this.value;
                }
            });
            elements.phoneInput = phoneInput;
        }

        if (occasionSelect) {
            occasionSelect.addEventListener('change', function() {
                bookingState.occasion = this.value;
            });
            elements.occasionSelect = occasionSelect;
        }

        if (requestsTextarea) {
            requestsTextarea.addEventListener('input', function() {
                bookingState.requests = this.value;
            });
            elements.requestsTextarea = requestsTextarea;
        }
        
        console.log('✅ Event listeners set up');
    }

    // ===== FORM SUBMISSION SETUP ===== //
    function setupFormSubmission() {
        console.log('📤 Setting up form submission...');
        const form = document.getElementById('bookingForm');
        
        if (!form) {
            console.error('❌ Booking form not found!');
            return;
        }
        
        form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Double-check authentication before submission
        if (!Auth.isAuthenticated()) {
            showNotification('You must be logged in to make a booking', 'error');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
            return;
        }
        
        // Validate all steps
        if (!validateStep1()) {
            showNotification('Please select a date and party size', 'error');
            return;
        }
        
        if (!validateStep2()) {
            showNotification('Please select a time slot', 'error');
            return;
        }
        
        if (!validateStep3()) {
            showNotification('Please fill in all required contact information', 'error');
            return;
        }
        
        if (!validateEmail(bookingState.email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        if (!validatePhone(bookingState.phone)) {
            showNotification('Please enter a valid phone number', 'error');
            return;
        }
        
        // Show loading state
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        submitButton.disabled = true;
        
        // Prepare booking data
        const bookingData = {
            date: bookingState.date,
            time: bookingState.time,
            partySize: parseInt(bookingState.partySize),
            firstName: bookingState.firstName,
            lastName: bookingState.lastName,
            email: bookingState.email,
            phone: bookingState.phone,
            occasion: bookingState.occasion || 'General Dining',
            preferences: bookingState.preferences,
            specialRequests: bookingState.requests
        };
        
        // Submit booking with JWT authentication
        try {
            const response = await Auth.authPost('/api/booking', bookingData);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Booking failed');
            }
            
            const result = await response.json();
            
            // Success!
            showSuccessModal();
            
            // Reset form after delay
            setTimeout(() => {
                resetBookingForm();
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }, 2000);
            
        } catch (error) {
            console.error('Booking error:', error);
            showNotification(error.message || 'An error occurred. Please try again.', 'error');
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
        });
        
        elements.form = form;
        console.log('✅ Form submission set up');
    }

    // ===== AUTHENTICATION CHECK ===== //
    function checkAuthenticationStatus() {
        const authGate = document.getElementById('authGate');
        const bookingForm = document.getElementById('bookingForm');
        const stepIndicators = document.getElementById('stepIndicators');
        const userStatus = document.getElementById('userStatus');
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        
        if (!Auth.isAuthenticated()) {
            // User is not logged in - show auth gate, hide form
            if (authGate) authGate.style.display = 'block';
            if (bookingForm) bookingForm.style.display = 'none';
            if (stepIndicators) stepIndicators.style.display = 'none';
            if (userStatus) userStatus.style.display = 'none';
        } else {
            // User is logged in - hide auth gate, show form
            if (authGate) authGate.style.display = 'none';
            if (bookingForm) bookingForm.style.display = 'block';
            if (stepIndicators) stepIndicators.style.display = 'flex';
            if (userStatus) userStatus.style.display = 'block';
            
            // Initialize booking system AFTER form is visible
            setTimeout(() => {
                init();
            }, 100);
            
            // Display user information
            const user = Auth.getUser();
            if (user && userName && userEmail) {
                userName.textContent = user.name || 'User';
                userEmail.textContent = user.email || '';
                
                // Pre-fill form with user data
                if (elements.firstNameInput && user.name) {
                    const nameParts = user.name.split(' ');
                    elements.firstNameInput.value = nameParts[0] || '';
                    if (elements.lastNameInput) {
                        elements.lastNameInput.value = nameParts.slice(1).join(' ') || '';
                    }
                }
                if (elements.emailInput && user.email) {
                    elements.emailInput.value = user.email;
                    bookingState.email = user.email;
                }
            }
        }
    }

    // ===== SUCCESS MODAL ===== //
    function showSuccessModal() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const modalBgClass = currentTheme === 'dark' ? 'bg-dark text-white' : 'bg-light';
        const modalContentClass = currentTheme === 'dark' ? 'bg-dark text-white' : '';
        
        const modalHTML = `
            <div class="modal fade" id="successModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content ${modalContentClass}">
                        <div class="modal-body text-center py-5">
                            <i class="fas fa-check-circle text-success mb-3" style="font-size: 4rem;"></i>
                            <h3 class="mb-3">Booking Confirmed!</h3>
                            <p class="mb-4">Thank you for your reservation at The Midnight Brew!</p>
                            <div class="booking-details ${modalBgClass} p-3 rounded mb-4">
                                <p class="mb-2"><strong>Date:</strong> ${elements.summaryDate.textContent}</p>
                                <p class="mb-2"><strong>Time:</strong> ${elements.summaryTime.textContent}</p>
                                <p class="mb-0"><strong>Party Size:</strong> ${elements.summaryParty.textContent}</p>
                            </div>
                            <p class="text-muted">A confirmation email has been sent to ${bookingState.email}</p>
                            <button type="button" class="btn btn-primary mt-3" data-bs-dismiss="modal">
                                <i class="fas fa-coffee me-2"></i>See You Soon!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove any existing modal
        const existingModal = document.getElementById('successModal');
        if (existingModal) existingModal.remove();
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
        
        // Remove modal from DOM after hidden
        document.getElementById('successModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }

    // ===== RESET FORM ===== //
    function resetBookingForm() {
        // Reset state
        bookingState.date = null;
        bookingState.time = null;
        bookingState.partySize = null;
        bookingState.preferences = [];
        bookingState.occasion = null;
        bookingState.firstName = '';
        bookingState.lastName = '';
        bookingState.email = '';
        bookingState.phone = '';
        bookingState.requests = '';
        
        // Reset form
        elements.form.reset();
        
        // Reset UI elements
        elements.timeSlots.forEach(slot => slot.classList.remove('selected'));
        elements.featureTags.forEach(tag => tag.classList.remove('selected'));
        
        // Reset step indicator
        updateStepIndicator(1);
        
        // Hide summary
        elements.bookingSummary.style.display = 'none';
        
        // Re-initialize date
        initializeDatePicker();
    }

    // ===== NOTIFICATION SYSTEM ===== //
    function showNotification(message, type = 'info') {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const bgClass = currentTheme === 'dark' ? 'bg-dark text-white' : 'bg-white';
        
        const notificationHTML = `
            <div class="notification notification-${type} ${bgClass}">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                ${message}
            </div>
        `;
        
        // Remove any existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        // Add notification to body
        document.body.insertAdjacentHTML('beforeend', notificationHTML);
        
        // Animate in
        const notification = document.querySelector('.notification');
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // ===== THEME APPLICATION ===== //
    function applyCurrentTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update body class for consistency
        document.body.className = document.body.className.replace(/light-theme|dark-theme/g, '');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
        }
        
        applyThemeToBookingPage(savedTheme);
    }

    function applyThemeToBookingPage(theme) {
        // The theme switching is now handled by CSS custom properties
        // We just need to ensure the data-theme attribute is set correctly
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update the body theme class for consistency with other pages
        document.body.className = document.body.className.replace(/light-theme|dark-theme/g, '');
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        }
        
        // Apply theme to notification backgrounds
        const currentTheme = theme;
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.className = notification.className.replace(/bg-dark|bg-light/g, '');
            if (currentTheme === 'dark') {
                notification.classList.add('bg-dark', 'text-white');
            } else {
                notification.classList.add('bg-white');
            }
        });
    }

    // ===== INITIALIZE EVERYTHING ===== //
    function init() {
        console.log('🎯 Initializing booking system...');
        
        // Set up all event listeners first
        setupEventListeners();
        setupFormSubmission();
        
        // Initialize components
        initializeDatePicker();
        initializeTimeSlots();
        initializePreferences();
        
        // Debug: Check if elements were found
        const timeSlots = document.querySelectorAll('.time-slot');
        const featureTags = document.querySelectorAll('.feature-tag');
        console.log(`✅ Found ${timeSlots.length} time slots`);
        console.log(`✅ Found ${featureTags.length} feature tags`);
        
        updateTimeSlotAvailability();
        updateStepIndicator(1);
        
        console.log('✅ Booking system fully initialized!');
    }

    // Note: init() is now called inside checkAuthenticationStatus() 
    // after the form is visible (for authenticated users only)
    
    // For unauthenticated users, init() won't run (form is hidden anyway)
});
