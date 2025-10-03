document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and load user info
    checkAuthAndLoadUser();
    
    applyCurrentTheme();
    
    const bookingState = {
        date: null, time: null, partySize: null, preferences: [], occasion: null,
        firstName: '', lastName: '', email: '', phone: '', requests: ''
    };

    const elements = {
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

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            setTimeout(() => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                applyThemeToBookingPage(currentTheme);
            }, 10);
        });
    }

    function initializeDatePicker() {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        
        elements.dateInput.min = today.toISOString().split('T')[0];
        elements.dateInput.max = maxDate.toISOString().split('T')[0];
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        elements.dateInput.value = tomorrow.toISOString().split('T')[0];
        bookingState.date = tomorrow.toISOString().split('T')[0];
        updateSummary();
    }

    function initializeTimeSlots() {
        elements.timeSlots.forEach(slot => {
            slot.addEventListener('click', handleTimeSlotClick);
        });
    }

    function handleTimeSlotClick(e) {
        const slot = e.currentTarget;
        if (slot.classList.contains('unavailable')) {
            showNotification('This time slot is not available', 'error');
            return;
        }
        elements.timeSlots.forEach(s => s.classList.remove('selected'));
        slot.classList.add('selected');
        bookingState.time = slot.dataset.time;
        updateStepIndicator(2);
        updateSummary();
        if (window.innerWidth < 768) {
            setTimeout(() => {
                elements.firstNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }

    function updateTimeSlotAvailability() {
        const selectedDate = new Date(elements.dateInput.value);
        const dayOfWeek = selectedDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        elements.timeSlots.forEach(slot => {
            const time = parseInt(slot.dataset.time.split(':')[0]);
            slot.classList.remove('unavailable', 'selected');
            if (isWeekend && (time === 12 || time === 13 || time === 19)) {
                slot.classList.add('unavailable');
            } else if (!isWeekend && Math.random() > 0.85) {
                slot.classList.add('unavailable');
            }
        });
        
        if (bookingState.time) {
            const selectedSlot = document.querySelector(`[data-time="${bookingState.time}"]`);
            if (selectedSlot && selectedSlot.classList.contains('unavailable')) {
                bookingState.time = null;
                updateSummary();
            } else if (selectedSlot) {
                selectedSlot.classList.add('selected');
            }
        }
        
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        applyThemeToBookingPage(currentTheme);
    }

    function initializePreferences() {
        elements.featureTags.forEach(tag => {
            tag.addEventListener('click', handlePreferenceClick);
        });
    }

    function handlePreferenceClick(e) {
        const tag = e.currentTarget;
        const feature = tag.dataset.feature;
        tag.classList.toggle('selected');
        if (tag.classList.contains('selected')) {
            if (!bookingState.preferences.includes(feature)) {
                bookingState.preferences.push(feature);
            }
        } else {
            bookingState.preferences = bookingState.preferences.filter(p => p !== feature);
        }
    }

    function updateStepIndicator(currentStep) {
        [elements.step1, elements.step2, elements.step3].forEach(step => {
            step.classList.remove('active', 'completed');
        });
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

    function updateSummary() {
        const hasBasicInfo = bookingState.date && bookingState.partySize;
        if (!hasBasicInfo) {
            elements.bookingSummary.style.display = 'none';
            return;
        }
        elements.bookingSummary.style.display = 'block';
        
        if (bookingState.date) {
            const date = new Date(bookingState.date + 'T00:00:00');
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            elements.summaryDate.textContent = date.toLocaleDateString('en-US', options);
        }
        
        if (bookingState.time) {
            const [hours, minutes] = bookingState.time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            elements.summaryTime.textContent = `${displayHour}:${minutes} ${ampm}`;
        } else {
            elements.summaryTime.textContent = '-';
        }
        
        elements.summaryParty.textContent = bookingState.partySize ? 
            `${bookingState.partySize} ${bookingState.partySize === '1' ? 'Guest' : 'Guests'}` : '-';
        
        const fullName = `${bookingState.firstName} ${bookingState.lastName}`.trim();
        elements.summaryName.textContent = fullName || '-';
    }

    function validateStep1() { return bookingState.date && bookingState.partySize; }
    function validateStep2() { return bookingState.time; }
    function validateStep3() { return bookingState.firstName && bookingState.lastName && bookingState.email && bookingState.phone; }
    function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
    function validatePhone(phone) { return /^[\d\s\-\+\(\)]+$/.test(phone) && phone.replace(/\D/g, '').length >= 10; }

    elements.dateInput.addEventListener('change', function() {
        bookingState.date = this.value;
        updateTimeSlotAvailability();
        updateSummary();
        updateStepIndicator(1);
    });

    elements.partySizeSelect.addEventListener('change', function() {
        bookingState.partySize = this.value;
        updateSummary();
        if (this.value === '8') {
            showNotification('For parties of 8 or more, please call us at +1 (555) 123-4567', 'info');
        }
    });

    elements.firstNameInput.addEventListener('input', function() {
        bookingState.firstName = this.value;
        updateSummary();
        if (validateStep3()) updateStepIndicator(3);
    });

    elements.lastNameInput.addEventListener('input', function() {
        bookingState.lastName = this.value;
        updateSummary();
        if (validateStep3()) updateStepIndicator(3);
    });

    elements.emailInput.addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            this.classList.add('is-invalid');
            showNotification('Please enter a valid email address', 'error');
        } else {
            this.classList.remove('is-invalid');
            bookingState.email = this.value;
        }
    });

    elements.phoneInput.addEventListener('blur', function() {
        if (this.value && !validatePhone(this.value)) {
            this.classList.add('is-invalid');
            showNotification('Please enter a valid phone number', 'error');
        } else {
            this.classList.remove('is-invalid');
            bookingState.phone = this.value;
        }
    });

    elements.occasionSelect.addEventListener('change', function() { bookingState.occasion = this.value; });
    elements.requestsTextarea.addEventListener('input', function() { bookingState.requests = this.value; });

    elements.form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateStep1()) { showNotification('Please select a date and party size', 'error'); return; }
        if (!validateStep2()) { showNotification('Please select a time slot', 'error'); return; }
        if (!validateStep3()) { showNotification('Please fill in all required contact information', 'error'); return; }
        if (!validateEmail(bookingState.email)) { showNotification('Please enter a valid email address', 'error'); return; }
        if (!validatePhone(bookingState.phone)) { showNotification('Please enter a valid phone number', 'error'); return; }
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        submitButton.disabled = true;
        
        try {
            await submitBookingToAPI();
            showSuccessModal();
            setTimeout(() => {
                resetBookingForm();
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
                // Redirect to dashboard after successful booking
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            }, 2000);
        } catch (error) {
            console.error('Booking submission error:', error);
            showNotification(error.message || 'An error occurred. Please try again.', 'error');
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });

    async function submitBookingToAPI() {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required. Please log in.');
        }

        // Convert time from HH:MM format to readable format
        const [hours, minutes] = bookingState.time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const timeString = `${displayHour}:${minutes} ${ampm}`;

        const bookingData = {
            bookingDate: bookingState.date,
            bookingTime: timeString,
            partySize: parseInt(bookingState.partySize),
            occasion: bookingState.occasion || '',
            preferences: bookingState.preferences,
            specialRequests: bookingState.requests || ''
        };

        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to create booking');
        }

        return result;
    }

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
        
        const existingModal = document.getElementById('successModal');
        if (existingModal) existingModal.remove();
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
        document.getElementById('successModal').addEventListener('hidden.bs.modal', function() { this.remove(); });
    }

    function resetBookingForm() {
        Object.keys(bookingState).forEach(key => {
            if (Array.isArray(bookingState[key])) bookingState[key] = [];
            else bookingState[key] = null;
        });
        bookingState.firstName = ''; bookingState.lastName = ''; bookingState.email = ''; bookingState.phone = ''; bookingState.requests = '';
        elements.form.reset();
        elements.timeSlots.forEach(slot => slot.classList.remove('selected'));
        elements.featureTags.forEach(tag => tag.classList.remove('selected'));
        updateStepIndicator(1);
        elements.bookingSummary.style.display = 'none';
        initializeDatePicker();
    }

    function showNotification(message, type = 'info') {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const bgClass = currentTheme === 'dark' ? 'bg-dark text-white' : 'bg-white';
        const notificationHTML = `
            <div class="notification notification-${type} ${bgClass}">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                ${message}
            </div>
        `;
        document.querySelectorAll('.notification').forEach(n => n.remove());
        document.body.insertAdjacentHTML('beforeend', notificationHTML);
        const notification = document.querySelector('.notification');
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    function applyCurrentTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.className = document.body.className.replace(/light-theme|dark-theme/g, '');
        if (savedTheme === 'light') { document.body.classList.add('light-theme'); }
        applyThemeToBookingPage(savedTheme);
    }

    function applyThemeToBookingPage(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.className = document.body.className.replace(/light-theme|dark-theme/g, '');
        if (theme === 'light') { document.body.classList.add('light-theme'); }
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.className = notification.className.replace(/bg-dark|bg-light/g, '');
            if (theme === 'dark') {
                notification.classList.add('bg-dark', 'text-white');
            } else {
                notification.classList.add('bg-white');
            }
        });
    }

    async function checkAuthAndLoadUser() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                localStorage.clear();
                window.location.href = '/login';
                return;
            }

            const result = await response.json();
            const user = result.user;

            // Pre-fill user information in the form
            if (user) {
                elements.firstNameInput.value = user.firstName;
                elements.lastNameInput.value = user.lastName;
                elements.emailInput.value = user.email;
                if (user.phone) {
                    elements.phoneInput.value = user.phone;
                }

                // Update booking state
                bookingState.firstName = user.firstName;
                bookingState.lastName = user.lastName;
                bookingState.email = user.email;
                bookingState.phone = user.phone || '';

                updateSummary();
            }

        } catch (error) {
            console.error('Authentication check failed:', error);
            localStorage.clear();
            window.location.href = '/login';
        }
    }

    function init() {
        initializeDatePicker();
        initializeTimeSlots();
        initializePreferences();
        updateTimeSlotAvailability();
        updateStepIndicator(1);
    }

    init();
});