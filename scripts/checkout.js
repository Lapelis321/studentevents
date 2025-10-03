// ===== CHECKOUT PAGE JAVASCRIPT =====

class Checkout {
    constructor() {
        this.event = null;
        this.ticketQuantity = 1;
        this.attendees = [];
        this.termsAccepted = false;
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.loadEventData();
    }

    loadEventData() {
        // Get event data from sessionStorage
        const storedEvent = sessionStorage.getItem('checkoutEvent');
        
        if (storedEvent) {
            this.event = JSON.parse(storedEvent);
            this.initializeAttendees();
            this.renderCheckout();
        } else {
            this.showErrorState('No event selected for checkout');
        }
    }

    initializeAttendees() {
        this.attendees = [{
            firstName: '',
            lastName: '',
            email: '',
            phone: ''
        }];
    }

    renderCheckout() {
        const container = document.getElementById('checkoutContainer');
        if (!container || !this.event) return;

        const formattedPrice = EventTicketingApp.formatPrice(this.event.price, this.event.currency);
        const formattedDate = this.formatEventDate(this.event.date);

        container.innerHTML = `
            <div class="checkout-progress">
                <div class="progress-step active">
                    <i class="fas fa-user"></i>
                    <span>Details</span>
                </div>
                <div class="progress-separator"></div>
                <div class="progress-step">
                    <i class="fas fa-credit-card"></i>
                    <span>Payment</span>
                </div>
                <div class="progress-separator"></div>
                <div class="progress-step">
                    <i class="fas fa-check"></i>
                    <span>Complete</span>
                </div>
            </div>

            <div class="checkout-grid">
                <div class="checkout-form-section">
                    <div class="section-header">
                        <h1 class="section-title">
                            <i class="fas fa-ticket-alt"></i>
                            Ticket Information
                        </h1>
                        <p class="section-subtitle">Please provide details for all attendees</p>
                    </div>

                    <div class="ticket-quantity">
                        <div class="quantity-selector">
                            <label class="quantity-label">Number of tickets:</label>
                            <div class="quantity-controls">
                                <button class="quantity-btn" onclick="checkout.decreaseQuantity()" ${this.ticketQuantity <= 1 ? 'disabled' : ''}>
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" class="quantity-input" value="${this.ticketQuantity}" min="1" max="10" readonly>
                                <button class="quantity-btn" onclick="checkout.increaseQuantity()" ${this.ticketQuantity >= 10 ? 'disabled' : ''}>
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <form class="checkout-form" id="checkoutForm" novalidate>
                        <div class="attendee-forms" id="attendeeForms">
                            ${this.renderAttendeeForm(0)}
                        </div>

                        <div class="terms-section">
                            <div class="form-checkbox terms-checkbox">
                                <input type="checkbox" id="termsCheckbox" onchange="checkout.toggleTerms(this.checked)">
                                <label for="termsCheckbox">
                                    I have read and agree to the 
                                    <span class="terms-link" onclick="checkout.openTerms()">Rules & Policy</span>
                                </label>
                            </div>
                        </div>

                        <div class="payment-section">
                            <button type="submit" class="payment-btn" id="paymentBtn" disabled>
                                <span class="btn-text">
                                    <i class="fas fa-lock"></i>
                                    Proceed to Payment
                                </span>
                                <div class="spinner" style="display: none;"></div>
                            </button>
                        </div>
                    </form>
                </div>

                <div class="order-summary-section">
                    <div class="section-header">
                        <h2 class="section-title">
                            <i class="fas fa-receipt"></i>
                            Order Summary
                        </h2>
                    </div>

                    <div class="event-summary">
                        <div class="event-summary-image">
                            <i class="fas fa-calendar-star"></i>
                        </div>
                        <h3 class="event-summary-title">${this.event.title}</h3>
                        <div class="event-summary-details">
                            <div class="event-summary-detail">
                                <i class="fas fa-calendar-alt"></i>
                                <span>${formattedDate}</span>
                            </div>
                            <div class="event-summary-detail">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${this.event.location}</span>
                            </div>
                        </div>
                    </div>

                    <div class="price-breakdown">
                        <h3>Price Breakdown</h3>
                        <div class="price-line">
                            <span class="price-label">Ticket price</span>
                            <span class="price-value">${formattedPrice}</span>
                        </div>
                        <div class="price-line">
                            <span class="price-label">Quantity</span>
                            <span class="price-value" id="quantityDisplay">×${this.ticketQuantity}</span>
                        </div>
                        <div class="price-line">
                            <span class="price-label">Service fee</span>
                            <span class="price-value">${EventTicketingApp.formatPrice(2.50, this.event.currency)}</span>
                        </div>
                        <div class="price-line total">
                            <span class="price-label">Total</span>
                            <span class="price-value" id="totalPrice">${this.calculateTotal()}</span>
                        </div>
                    </div>

                    <div class="security-badges">
                        <div class="security-badge">
                            <i class="fas fa-shield-alt"></i>
                            <span>256-bit SSL encryption</span>
                        </div>
                        <div class="security-badge">
                            <i class="fas fa-lock"></i>
                            <span>Secure payment processing</span>
                        </div>
                        <div class="security-badge">
                            <i class="fas fa-undo"></i>
                            <span>Money-back guarantee</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.setupFormValidation();
        this.setupEventListeners();
    }

    renderAttendeeForm(index) {
        const attendee = this.attendees[index] || { firstName: '', lastName: '', email: '', phone: '' };
        
        return `
            <div class="attendee-form" data-attendee="${index}">
                <div class="attendee-form-header">
                    <i class="fas fa-user"></i>
                    <h3 class="attendee-form-title">Attendee ${index + 1}</h3>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="firstName${index}">First Name *</label>
                        <input type="text" 
                               class="form-input" 
                               id="firstName${index}" 
                               name="firstName" 
                               value="${attendee.firstName}"
                               placeholder="Enter first name"
                               required>
                        <span class="form-error" id="firstName${index}Error"></span>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="lastName${index}">Last Name *</label>
                        <input type="text" 
                               class="form-input" 
                               id="lastName${index}" 
                               name="lastName" 
                               value="${attendee.lastName}"
                               placeholder="Enter last name"
                               required>
                        <span class="form-error" id="lastName${index}Error"></span>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="email${index}">Email Address *</label>
                        <input type="email" 
                               class="form-input" 
                               id="email${index}" 
                               name="email" 
                               value="${attendee.email}"
                               placeholder="Enter email address"
                               required>
                        <span class="form-error" id="email${index}Error"></span>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="phone${index}">Phone Number *</label>
                        <input type="tel" 
                               class="form-input" 
                               id="phone${index}" 
                               name="phone" 
                               value="${attendee.phone}"
                               placeholder="Enter phone number"
                               required>
                        <span class="form-error" id="phone${index}Error"></span>
                    </div>
                </div>
            </div>
        `;
    }

    setupFormValidation() {
        const form = document.getElementById('checkoutForm');
        if (!form) return;

        // Real-time validation
        const inputs = form.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });
    }

    setupEventListeners() {
        // Update attendee data when inputs change
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('form-input')) {
                this.updateAttendeeData(e.target);
            }
        });
    }

    increaseQuantity() {
        if (this.ticketQuantity < 10) {
            this.ticketQuantity++;
            this.updateQuantity();
        }
    }

    decreaseQuantity() {
        if (this.ticketQuantity > 1) {
            this.ticketQuantity--;
            this.updateQuantity();
        }
    }

    updateQuantity() {
        // Update attendees array
        while (this.attendees.length < this.ticketQuantity) {
            this.attendees.push({ firstName: '', lastName: '', email: '', phone: '' });
        }
        while (this.attendees.length > this.ticketQuantity) {
            this.attendees.pop();
        }

        // Re-render attendee forms
        const attendeeFormsContainer = document.getElementById('attendeeForms');
        if (attendeeFormsContainer) {
            attendeeFormsContainer.innerHTML = '';
            for (let i = 0; i < this.ticketQuantity; i++) {
                attendeeFormsContainer.innerHTML += this.renderAttendeeForm(i);
            }
            this.setupFormValidation();
        }

        // Update quantity display and total
        const quantityInput = document.querySelector('.quantity-input');
        const quantityDisplay = document.getElementById('quantityDisplay');
        const totalPrice = document.getElementById('totalPrice');
        
        if (quantityInput) quantityInput.value = this.ticketQuantity;
        if (quantityDisplay) quantityDisplay.textContent = `×${this.ticketQuantity}`;
        if (totalPrice) totalPrice.textContent = this.calculateTotal();

        // Update quantity buttons
        const decreaseBtn = document.querySelector('.quantity-btn:first-child');
        const increaseBtn = document.querySelector('.quantity-btn:last-child');
        
        if (decreaseBtn) decreaseBtn.disabled = this.ticketQuantity <= 1;
        if (increaseBtn) increaseBtn.disabled = this.ticketQuantity >= 10;
    }

    updateAttendeeData(input) {
        const attendeeForm = input.closest('.attendee-form');
        if (!attendeeForm) return;

        const attendeeIndex = parseInt(attendeeForm.dataset.attendee);
        const fieldName = input.name;
        
        if (this.attendees[attendeeIndex]) {
            this.attendees[attendeeIndex][fieldName] = input.value;
        }
    }

    validateField(input) {
        const value = input.value.trim();
        const fieldName = input.name;
        const errorElement = document.getElementById(input.id + 'Error');
        
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (!value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else {
            // Specific field validations
            switch (fieldName) {
                case 'firstName':
                case 'lastName':
                    if (value.length < 2) {
                        isValid = false;
                        errorMessage = 'Must be at least 2 characters';
                    } else if (!/^[a-zA-Z\s-']+$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Only letters, spaces, hyphens, and apostrophes allowed';
                    }
                    break;
                    
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                    
                case 'phone':
                    const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
                    if (!phoneRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid phone number';
                    }
                    break;
            }
        }

        // Update UI
        if (isValid) {
            input.classList.remove('error');
            if (errorElement) errorElement.textContent = '';
        } else {
            input.classList.add('error');
            if (errorElement) errorElement.textContent = errorMessage;
        }

        this.updatePaymentButtonState();
        return isValid;
    }

    clearFieldError(input) {
        input.classList.remove('error');
        const errorElement = document.getElementById(input.id + 'Error');
        if (errorElement) errorElement.textContent = '';
    }

    validateAllFields() {
        const inputs = document.querySelectorAll('.form-input');
        let allValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                allValid = false;
            }
        });

        return allValid;
    }

    toggleTerms(checked) {
        this.termsAccepted = checked;
        this.updatePaymentButtonState();
    }

    updatePaymentButtonState() {
        const paymentBtn = document.getElementById('paymentBtn');
        if (!paymentBtn) return;

        const allFieldsValid = this.validateAllFields();
        const canProceed = allFieldsValid && this.termsAccepted && !this.isProcessing;
        
        paymentBtn.disabled = !canProceed;
    }

    openTerms() {
        window.open('rules.html', '_blank');
    }

    async handleFormSubmit() {
        if (this.isProcessing) return;

        if (!this.validateAllFields()) {
            EventTicketingApp.showNotification('Please fill in all required fields correctly', 'error');
            return;
        }

        if (!this.termsAccepted) {
            EventTicketingApp.showNotification('Please accept the terms and conditions', 'error');
            return;
        }

        this.isProcessing = true;
        this.showProcessingState();

        try {
            // Prepare payment data
            const paymentData = {
                eventId: this.event.id,
                quantity: this.ticketQuantity,
                attendeeInfo: this.attendees[0], // Primary attendee
                totalAmount: this.calculateTotalAmount()
            };

            // Create payment intent
            const response = await fetch(`${CONFIG.API_BASE_URL}/tickets/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error('Payment setup failed');
            }

            const paymentResult = await response.json();
            
            // For demo purposes, simulate successful payment
            // In production, you would integrate with Stripe Elements here
            await this.delay(2000);
            
            // Store order data for confirmation page
            const orderData = {
                event: this.event,
                attendees: this.attendees,
                quantity: this.ticketQuantity,
                totalAmount: this.calculateTotalAmount(),
                orderNumber: paymentResult.orderNumber,
                orderDate: new Date().toISOString()
            };
            
            sessionStorage.setItem('orderData', JSON.stringify(orderData));
            
            // Redirect to confirmation page
            window.location.href = 'post-payment.html';
            
        } catch (error) {
            console.error('Payment processing error:', error);
            EventTicketingApp.showNotification('Payment failed. Please try again.', 'error');
            this.hideProcessingState();
        }
    }

    showProcessingState() {
        const paymentBtn = document.getElementById('paymentBtn');
        if (!paymentBtn) return;

        paymentBtn.classList.add('loading');
        paymentBtn.disabled = true;
        
        const btnText = paymentBtn.querySelector('.btn-text');
        const spinner = paymentBtn.querySelector('.spinner');
        
        if (btnText) btnText.style.opacity = '0';
        if (spinner) spinner.style.display = 'block';
    }

    hideProcessingState() {
        const paymentBtn = document.getElementById('paymentBtn');
        if (!paymentBtn) return;

        paymentBtn.classList.remove('loading');
        
        const btnText = paymentBtn.querySelector('.btn-text');
        const spinner = paymentBtn.querySelector('.spinner');
        
        if (btnText) btnText.style.opacity = '1';
        if (spinner) spinner.style.display = 'none';
        
        this.isProcessing = false;
        this.updatePaymentButtonState();
    }

    calculateTotal() {
        const ticketPrice = this.event.price * this.ticketQuantity;
        const serviceFee = 2.50;
        const total = ticketPrice + serviceFee;
        return EventTicketingApp.formatPrice(total, this.event.currency);
    }

    calculateTotalAmount() {
        const ticketPrice = this.event.price * this.ticketQuantity;
        const serviceFee = 2.50;
        return ticketPrice + serviceFee;
    }

    generateOrderNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `SE${timestamp}${random}`.slice(-12);
    }

    formatEventDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }

    showErrorState(message) {
        const container = document.getElementById('checkoutContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="checkout-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Checkout Error</h2>
                <p>${message}</p>
                <a href="index.html" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Back to Events
                </a>
            </div>
        `;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize checkout page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.checkout = new Checkout();
});
