// ===== THE MIDNIGHT BREW - BOOKING SYSTEM ===== //

document.addEventListener('DOMContentLoaded', function() {
    // ===== BOOKING SYSTEM STATE ===== //
    const bookingState = {
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

    // ===== DOM ELEMENTS ===== //
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

    // ===== INITIALIZE DATE CONSTRAINTS ===== //
    function initializeDatePicker() {
        const today = new Date();
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3); // Allow booking up to 3 months ahead
        
        elements.dateInput.min = today.toISOString().split('T')[0];
        elements.dateInput.max = maxDate.toISOString().split('T')[0];
        
        // Set default to tomorrow
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        elements.dateInput.value = tomorrow.toISOString().split('T')[0];
        bookingState.date = tomorrow.toISOString().split('T')[0];
        updateSummary();
    }

    // ===== TIME SLOT MANAGEMENT ===== //
    function initializeTimeSlots() {
        elements.timeSlots.forEach(slot => {
            slot.addEventListener('click', handleTimeSlotClick);
        });
    }

    function handleTimeSlotClick(e) {
        const slot = e.currentTarget;
        
        // Don't select if unavailable
        if (slot.classList.contains('unavailable')) {
            showNotification('This time slot is not available', 'error');
            return;
        }
        
        // Remove previous selection
        elements.timeSlots.forEach(s => s.classList.remove('selected'));
        
        // Add selection to clicked slot
        slot.classList.add('selected');
        bookingState.time = slot.dataset.time;
        
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
    }

    // ===== TABLE PREFERENCES ===== //
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

    // ===== EVENT LISTENERS ===== //
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

    elements.occasionSelect.addEventListener('change', function() {
        bookingState.occasion = this.value;
    });

    elements.requestsTextarea.addEventListener('input', function() {
        bookingState.requests = this.value;
    });

    // ===== FORM SUBMISSION ===== //
    elements.form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
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
        
        // Simulate API call
        try {
            await simulateBookingSubmission();
            
            // Success!
            showSuccessModal();
            
            // Reset form after delay
            setTimeout(() => {
                resetBookingForm();
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }, 2000);
            
        } catch (error) {
            showNotification('An error occurred. Please try again.', 'error');
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });

    // ===== SIMULATE BOOKING SUBMISSION ===== //
    function simulateBookingSubmission() {
        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                // 95% success rate
                if (Math.random() > 0.05) {
                    resolve();
                } else {
                    reject(new Error('Booking failed'));
                }
            }, 1500);
        });
    }

    // ===== SUCCESS MODAL ===== //
    function showSuccessModal() {
        const modalHTML = `
            <div class="modal fade" id="successModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-body text-center py-5">
                            <i class="fas fa-check-circle text-success mb-3" style="font-size: 4rem;"></i>
                            <h3 class="mb-3">Booking Confirmed!</h3>
                            <p class="mb-4">Thank you for your reservation at The Midnight Brew!</p>
                            <div class="booking-details bg-light p-3 rounded mb-4">
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
        const notificationHTML = `
            <div class="notification notification-${type}">
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

    // ===== INITIALIZE EVERYTHING ===== //
    function init() {
        initializeDatePicker();
        initializeTimeSlots();
        initializePreferences();
        updateTimeSlotAvailability();
        updateStepIndicator(1);
    }

    // Start the booking system
    init();
});

// ===== NOTIFICATION STYLES (Add to your CSS) ===== //
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 100px;
    right: -400px;
    background: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    z-index: 9999;
    transition: right 0.3s ease;
    max-width: 350px;
}

.notification.show {
    right: 20px;
}

.notification-success {
    border-left: 4px solid #28a745;
    color: #28a745;
}

.notification-error {
    border-left: 4px solid #dc3545;
    color: #dc3545;
}

.notification-info {
    border-left: 4px solid #17a2b8;
    color: #17a2b8;
}

.form-control.is-invalid,
.form-select.is-invalid {
    border-color: #dc3545;
    background-image: none;
}

.booking-details {
    text-align: left;
    max-width: 300px;
    margin: 0 auto;
}

@media (max-width: 576px) {
    .notification {
        right: -100%;
        left: 20px;
        max-width: calc(100% - 40px);
    }
    
    .notification.show {
        right: 20px;
    }
}
</style>
`;

// Add notification styles to head
document.head.insertAdjacentHTML('beforeend', notificationStyles);