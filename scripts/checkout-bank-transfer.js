// ===== CHECKOUT PAGE - BANK TRANSFER VERSION =====

class Checkout {
    constructor() {
        this.event = null;
        this.ticketQuantity = 1;
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.loadEventData();
    }

    loadEventData() {
        const storedEvent = sessionStorage.getItem('checkoutEvent');
        
        if (storedEvent) {
            this.event = JSON.parse(storedEvent);
            this.renderCheckout();
            this.renderAdditionalAttendees();
        } else {
            this.showErrorState('No event selected for checkout');
        }
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
                    <i class="fas fa-university"></i>
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
                            <svg class="globe-logo" viewBox="0 0 24 24" width="20" height="20">
                                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                                <ellipse cx="12" cy="12" rx="10" ry="5" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                                <ellipse cx="12" cy="12" rx="10" ry="3" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                                <ellipse cx="12" cy="12" rx="10" ry="7" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                                <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                                <line x1="2" y1="8" x2="22" y2="8" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                                <line x1="2" y1="16" x2="22" y2="16" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                                <line x1="2" y1="6" x2="22" y2="6" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                                <line x1="2" y1="18" x2="22" y2="18" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                                <line x1="2" y1="4" x2="22" y2="4" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                                <line x1="2" y1="20" x2="22" y2="20" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                            </svg>
                            Booking Information
                        </h1>
                        <p class="section-subtitle">Complete your ticket booking</p>
                    </div>

                    <form class="checkout-form" id="checkoutForm" novalidate>
                        <div class="form-group">
                            <label for="firstName" class="form-label">First Name *</label>
                            <input type="text" id="firstName" class="form-input" required>
                            <span class="form-error" id="firstName-error"></span>
                        </div>

                        <div class="form-group">
                            <label for="lastName" class="form-label">Last Name *</label>
                            <input type="text" id="lastName" class="form-input" required>
                            <span class="form-error" id="lastName-error"></span>
                        </div>

                        <div class="form-group">
                            <label for="email" class="form-label">Email Address *</label>
                            <input type="email" id="email" class="form-input" required>
                            <span class="form-error" id="email-error"></span>
                            <span class="form-hint">Your ticket will be sent to this email</span>
                        </div>

                        <div class="form-group">
                            <label for="phone" class="form-label">Phone Number *</label>
                            <input type="tel" id="phone" class="form-input" required>
                            <span class="form-error" id="phone-error"></span>
                        </div>

                        <div class="form-group">
                            <div class="checkbox-wrapper">
                                <input type="checkbox" id="ismStudent" class="form-checkbox">
                                <label for="ismStudent" class="checkbox-label">
                                    <span class="checkbox-text">I am an ISM University of Management and Economics student</span>
                                    <span class="checkbox-hint">Non-ISM students pay an additional fee</span>
                                </label>
                            </div>
                        </div>

                        <div class="quantity-section">
                            <label class="quantity-label">Number of Tickets:</label>
                            <div class="quantity-controls">
                                <button type="button" class="quantity-btn" onclick="checkout.decreaseQuantity()">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity-display">${this.ticketQuantity}</span>
                                <button type="button" class="quantity-btn" onclick="checkout.increaseQuantity()">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>

                        <div id="additionalAttendeesContainer"></div>

                        <div class="terms-section">
                            <div class="checkbox-wrapper">
                                <input type="checkbox" id="termsCheckbox" class="form-checkbox" required>
                                <label for="termsCheckbox" class="checkbox-label">
                                    <span class="checkbox-text">
                                        I agree to the <a href="rules.html" target="_blank">Rules & Policy</a>
                                    </span>
                                </label>
                            </div>
                            <span class="form-error" id="terms-error"></span>
                        </div>

                        <button type="submit" class="btn btn-primary btn-large btn-submit" id="submitBtn">
                            <i class="fas fa-arrow-right"></i>
                            Continue to Payment Instructions
                        </button>
                    </form>
                </div>

                <div class="checkout-summary-section">
                    <div class="summary-card">
                        <h2 class="summary-title">Booking Summary</h2>
                        
                        <div class="event-info">
                            <h3 class="event-name">${this.event.title}</h3>
                            <div class="event-details">
                                <div class="detail-item">
                                    <i class="fas fa-calendar-alt"></i>
                                    <span>${formattedDate}</span>
                                </div>
                                <div class="detail-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>${this.event.location}</span>
                                </div>
                            </div>
                        </div>

                        <div class="price-breakdown" id="priceBreakdown">
                            ${this.renderPriceBreakdown()}
                        </div>

                        <div class="payment-info">
                            <div class="info-box">
                                <i class="fas fa-info-circle"></i>
                                <div class="info-content">
                                    <strong>Payment Method: Bank Transfer</strong>
                                    <p>After booking, you'll receive payment instructions. Transfer within 24 hours to secure your tickets.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderPriceBreakdown() {
        const basePrice = parseFloat(this.event.price);
        const quantity = this.ticketQuantity;
        const isISMStudent = document.getElementById('ismStudent')?.checked || false;
        const extraFee = isISMStudent ? 0 : 1; // €1 extra for non-ISM
        
        const subtotal = basePrice * quantity;
        const fees = extraFee * quantity;
        const total = subtotal + fees;

        return `
            <div class="price-row">
                <span>Ticket Price</span>
                <span>€${basePrice.toFixed(2)}</span>
            </div>
            <div class="price-row">
                <span>Quantity</span>
                <span>×${quantity}</span>
            </div>
            <div class="price-row">
                <span>Subtotal</span>
                <span>€${subtotal.toFixed(2)}</span>
            </div>
            ${fees > 0 ? `
            <div class="price-row fee-row">
                <span>Non-ISM Student Fee</span>
                <span>€${fees.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="price-row total-row">
                <span>Total</span>
                <span class="total-amount">€${total.toFixed(2)}</span>
            </div>
        `;
    }

    attachEventListeners() {
        const form = document.getElementById('checkoutForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // Update price when ISM checkbox changes
        const ismCheckbox = document.getElementById('ismStudent');
        if (ismCheckbox) {
            ismCheckbox.addEventListener('change', () => {
                this.updatePriceBreakdown();
            });
        }
    }

    updatePriceBreakdown() {
        const priceBreakdown = document.getElementById('priceBreakdown');
        if (priceBreakdown) {
            priceBreakdown.innerHTML = this.renderPriceBreakdown();
        }
    }

    increaseQuantity() {
        if (this.ticketQuantity < 10) {
            this.ticketQuantity++;
            this.renderCheckout();
            this.renderAdditionalAttendees();
        }
    }

    decreaseQuantity() {
        if (this.ticketQuantity > 1) {
            this.ticketQuantity--;
            this.renderCheckout();
            this.renderAdditionalAttendees();
        }
    }

    renderAdditionalAttendees() {
        const container = document.getElementById('additionalAttendeesContainer');
        if (!container) return;

        const additionalCount = this.ticketQuantity - 1; // -1 for primary contact
        
        if (additionalCount === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <div class="form-section">
                <h3 class="form-section-title">
                    <i class="fas fa-users"></i>
                    Additional Attendee Information (${additionalCount} ${additionalCount === 1 ? 'person' : 'people'})
                </h3>
                <p class="form-hint" style="margin-bottom: 20px;">Please provide information for each additional attendee.</p>
                ${Array.from({length: additionalCount}, (_, i) => `
                    <div class="attendee-card">
                        <h4 class="attendee-title">Attendee ${i + 1}</h4>
                        <div class="attendee-form">
                            <div class="form-group">
                                <label for="attendee${i}_firstName" class="form-label">First Name *</label>
                                <input type="text" id="attendee${i}_firstName" class="form-input" required>
                                <span class="form-error" id="attendee${i}_firstName-error"></span>
                            </div>
                            <div class="form-group">
                                <label for="attendee${i}_lastName" class="form-label">Last Name *</label>
                                <input type="text" id="attendee${i}_lastName" class="form-input" required>
                                <span class="form-error" id="attendee${i}_lastName-error"></span>
                            </div>
                            <div class="form-group">
                                <label for="attendee${i}_email" class="form-label">Email Address</label>
                                <input type="email" id="attendee${i}_email" class="form-input">
                                <span class="form-error" id="attendee${i}_email-error"></span>
                                <span class="form-hint">Optional - ticket will be sent to primary contact email</span>
                            </div>
                            <div class="form-group">
                                <label for="attendee${i}_phone" class="form-label">Phone Number</label>
                                <input type="tel" id="attendee${i}_phone" class="form-input">
                                <span class="form-error" id="attendee${i}_phone-error"></span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    async handleSubmit() {
        if (this.isProcessing) return;

        // Validate form
        if (!this.validateForm()) {
            return;
        }

        this.isProcessing = true;
        this.showProcessingState();

        try {
            // Collect primary contact data
            const primaryContact = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim()
            };

            // Collect additional attendees data
            const additionalAttendees = [];
            const additionalCount = this.ticketQuantity - 1;
            for (let i = 0; i < additionalCount; i++) {
                const firstName = document.getElementById(`attendee${i}_firstName`)?.value.trim() || '';
                const lastName = document.getElementById(`attendee${i}_lastName`)?.value.trim() || '';
                const email = document.getElementById(`attendee${i}_email`)?.value.trim() || '';
                const phone = document.getElementById(`attendee${i}_phone`)?.value.trim() || '';
                
                if (firstName && lastName) {
                    additionalAttendees.push({ firstName, lastName, email, phone });
                }
            }

            const bookingData = {
                eventId: this.event.id,
                firstName: primaryContact.firstName,
                lastName: primaryContact.lastName,
                email: primaryContact.email,
                phone: primaryContact.phone,
                isISMStudent: document.getElementById('ismStudent').checked,
                quantity: this.ticketQuantity,
                additionalAttendees: additionalAttendees
            };

            const response = await fetch(`${CONFIG.API_BASE_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                throw new Error('Booking failed');
            }

            const result = await response.json();

            // Store booking data for next page
            sessionStorage.setItem('pendingBooking', JSON.stringify(result));

            // Redirect to payment instructions
            window.location.href = 'payment-instructions.html';

        } catch (error) {
            console.error('Booking error:', error);
            this.showError('Failed to create booking. Please try again.');
            this.isProcessing = false;
            this.hideProcessingState();
        }
    }

    validateForm() {
        let isValid = true;

        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

        // Validate first name
        const firstName = document.getElementById('firstName').value.trim();
        if (!firstName) {
            this.showFieldError('firstName', 'First name is required');
            isValid = false;
        }

        // Validate last name
        const lastName = document.getElementById('lastName').value.trim();
        if (!lastName) {
            this.showFieldError('lastName', 'Last name is required');
            isValid = false;
        }

        // Validate email
        const email = document.getElementById('email').value.trim();
        if (!email) {
            this.showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate phone
        const phone = document.getElementById('phone').value.trim();
        if (!phone) {
            this.showFieldError('phone', 'Phone number is required');
            isValid = false;
        }

        // Validate terms
        const termsChecked = document.getElementById('termsCheckbox').checked;
        if (!termsChecked) {
            this.showFieldError('terms', 'You must agree to the terms');
            isValid = false;
        }

        return isValid;
    }

    showFieldError(fieldId, message) {
        const errorEl = document.getElementById(`${fieldId}-error`);
        if (errorEl) {
            errorEl.textContent = message;
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showProcessingState() {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }
    }

    hideProcessingState() {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-arrow-right"></i> Continue to Payment Instructions';
        }
    }

    showError(message) {
        EventTicketingApp.showNotification(message, 'error');
    }

    showErrorState(message) {
        const container = document.getElementById('checkoutContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Error</h2>
                    <p>${message}</p>
                    <button onclick="history.back()" class="btn btn-primary">
                        <i class="fas fa-arrow-left"></i>
                        Go Back
                    </button>
                </div>
            `;
        }
    }

    formatEventDate(dateString) {
        const date = new Date(dateString);
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }
}

// Initialize checkout when DOM is ready
let checkout;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkout = new Checkout();
    });
} else {
    checkout = new Checkout();
}

