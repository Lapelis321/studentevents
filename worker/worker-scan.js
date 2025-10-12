// ===== WORKER SCAN PAGE JAVASCRIPT =====

class WorkerScan {
    constructor() {
        this.camera = null;
        this.isScanning = false;
        this.currentStream = null;
        this.cameras = [];
        this.currentCameraIndex = 0;
        this.stats = {
            validScans: 0,
            invalidScans: 0,
            totalScans: 0
        };
        this.scannedTickets = new Set(); // Track already scanned tickets
        this.init();
    }

    init() {
        this.loadStats();
        this.setupEventListeners();
        this.checkCameraSupport();
    }

    setupEventListeners() {
        // Manual form submission
        const manualForm = document.getElementById('manualForm');
        if (manualForm) {
            manualForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleManualEntry();
            });
        }

        // Auto-focus on ticket ID input when page loads
        const ticketIdInput = document.getElementById('ticketId');
        if (ticketIdInput) {
            ticketIdInput.focus();
            
            // Clear input on focus for better UX
            ticketIdInput.addEventListener('focus', () => {
                ticketIdInput.select();
            });
        }
    }

    async checkCameraSupport() {
        try {
            // Check if mediaDevices API is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                this.showCameraError('Camera API not supported in this browser');
                return;
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            this.cameras = devices.filter(device => device.kind === 'videoinput');
            
            if (this.cameras.length === 0) {
                this.showCameraError('No cameras found on this device');
            } else {
                console.log(`Found ${this.cameras.length} camera(s)`);
            }
        } catch (error) {
            console.error('Error checking camera support:', error);
            this.showCameraError('Camera access not supported or blocked');
        }
    }

    async startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: 'environment', // Prefer back camera
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            };

            // If we have multiple cameras, use the selected one
            if (this.cameras.length > 0 && this.cameras[this.currentCameraIndex]) {
                constraints.video.deviceId = this.cameras[this.currentCameraIndex].deviceId;
            }

            this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            const video = document.getElementById('cameraVideo');
            if (video) {
                video.srcObject = this.currentStream;
                video.play();
                
                // Update UI
                this.updateCameraControls(true);
                this.isScanning = true;
                
                // Start scanning loop
                this.startScanningLoop();
            }
        } catch (error) {
            console.error('Error starting camera:', error);
            this.showCameraError('Unable to access camera. Please check permissions.');
        }
    }

    stopCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
        
        const video = document.getElementById('cameraVideo');
        if (video) {
            video.srcObject = null;
        }
        
        this.isScanning = false;
        this.updateCameraControls(false);
    }

    async switchCamera() {
        if (this.cameras.length <= 1) return;
        
        this.stopCamera();
        this.currentCameraIndex = (this.currentCameraIndex + 1) % this.cameras.length;
        
        // Small delay to ensure camera is properly released
        setTimeout(() => {
            this.startCamera();
        }, 500);
    }

    updateCameraControls(isActive) {
        const startBtn = document.getElementById('startCameraBtn');
        const stopBtn = document.getElementById('stopCameraBtn');
        const switchBtn = document.getElementById('switchCameraBtn');
        
        if (startBtn) startBtn.style.display = isActive ? 'none' : 'inline-flex';
        if (stopBtn) stopBtn.style.display = isActive ? 'inline-flex' : 'none';
        if (switchBtn) {
            switchBtn.style.display = (isActive && this.cameras.length > 1) ? 'inline-flex' : 'none';
        }
    }

    startScanningLoop() {
        if (!this.isScanning) return;
        
        // Simulate QR code scanning (in real implementation, you'd use a QR code library)
        setTimeout(() => {
            if (this.isScanning) {
                // Randomly simulate finding a QR code for demo purposes
                if (Math.random() < 0.1) { // 10% chance per scan cycle
                    const mockTicketId = this.generateMockTicketId();
                    this.processTicket(mockTicketId, 'camera');
                }
                this.startScanningLoop();
            }
        }, 1000);
    }

    generateMockTicketId() {
        // Generate mock ticket IDs for demo
        const prefixes = ['SE', 'ST', 'EV'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
        return `${prefix}${number}`;
    }

    handleManualEntry() {
        const ticketIdInput = document.getElementById('ticketId');
        if (!ticketIdInput) return;
        
        const ticketId = ticketIdInput.value.trim();
        if (!ticketId) {
            EventTicketingApp.showNotification('Please enter a ticket ID', 'error');
            return;
        }
        
        this.processTicket(ticketId, 'manual');
        ticketIdInput.value = '';
        ticketIdInput.focus();
    }

    async processTicket(ticketId, source) {
        try {
            // Show processing state
            this.showProcessingResult();
            
            // Simulate API call to verify ticket
            await this.delay(800);
            
            const result = await this.verifyTicket(ticketId);
            this.showScanResult(result, source);
            this.updateStats(result.status);
            
        } catch (error) {
            console.error('Error processing ticket:', error);
            EventTicketingApp.showNotification('Error processing ticket', 'error');
        }
    }

    async verifyTicket(ticketId) {
        try {
            // Get worker token for authentication
            const workerToken = localStorage.getItem('workerToken') || sessionStorage.getItem('workerToken');
            
            if (!workerToken) {
                return {
                    status: 'error',
                    ticketId: ticketId,
                    message: 'Worker not authenticated. Please login again.',
                    timestamp: new Date()
                };
            }
            
            const API_BASE_URL = window.API_BASE_URL || 'https://studentevents-production.up.railway.app';
            
            console.log('🔍 Validating ticket via API:', ticketId);
            
            const response = await fetch(`${API_BASE_URL}/api/workers/validate-ticket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${workerToken}`
                },
                body: JSON.stringify({ ticketNumber: ticketId })
            });
            
            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.valid && data.status === 'valid') {
                // Mark as scanned to prevent duplicates
                this.scannedTickets.add(ticketId);
                
                return {
                    status: 'valid',
                    ticketId: ticketId,
                    name: data.attendeeName || 'Unknown',
                    event: data.eventTitle || 'Unknown Event',
                    message: data.message || 'Ticket verified successfully',
                    timestamp: new Date()
                };
            } else {
                return {
                    status: data.status === 'already_used' ? 'duplicate' : 'invalid',
                    ticketId: ticketId,
                    message: data.message || 'Ticket validation failed',
                    timestamp: new Date()
                };
            }
            
        } catch (error) {
            console.error('❌ Ticket validation error:', error);
            
            // Fallback to mock data if API fails
            const mockTickets = {
                'SE123456': { name: 'John Doe', event: 'Spring Music Festival', valid: true },
                'SE789012': { name: 'Jane Smith', event: 'Tech Innovation Summit', valid: true },
                'ST345678': { name: 'Bob Johnson', event: 'Art & Culture Night', valid: true }
            };
            
            const ticket = mockTickets[ticketId];
            
            if (!ticket) {
                return {
                    status: 'invalid',
                    ticketId: ticketId,
                    message: 'Ticket not found (API unavailable)',
                    timestamp: new Date()
                };
            }
            
            if (this.scannedTickets.has(ticketId)) {
                return {
                    status: 'duplicate',
                    ticketId: ticketId,
                    name: ticket.name,
                    event: ticket.event,
                    message: 'Ticket already scanned',
                    timestamp: new Date()
                };
            }
            
            this.scannedTickets.add(ticketId);
            
            return {
                status: 'valid',
                ticketId: ticketId,
                name: ticket.name,
                event: ticket.event,
                message: 'Ticket verified (offline mode)',
                timestamp: new Date()
            };
        }
    }

    showProcessingResult() {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;
        
        resultsSection.style.display = 'block';
        resultsSection.innerHTML = `
            <div class="result-card">
                <div class="result-icon">
                    <div class="spinner"></div>
                </div>
                <div class="result-content">
                    <div class="result-status">Processing...</div>
                    <div class="result-details">
                        <div class="result-detail">Verifying ticket information</div>
                    </div>
                </div>
            </div>
        `;
    }

    showScanResult(result, source) {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;
        
        resultsSection.style.display = 'block';
        
        let statusText, iconClass, detailsHtml;
        
        switch (result.status) {
            case 'valid':
                statusText = 'VALID TICKET';
                iconClass = 'fas fa-check-circle';
                detailsHtml = `
                    <div class="result-detail"><strong>Name:</strong> ${result.name}</div>
                    <div class="result-detail"><strong>Event:</strong> ${result.event}</div>
                    <div class="result-detail"><strong>Ticket ID:</strong> ${result.ticketId}</div>
                `;
                break;
            case 'invalid':
                statusText = 'INVALID TICKET';
                iconClass = 'fas fa-times-circle';
                detailsHtml = `
                    <div class="result-detail"><strong>Ticket ID:</strong> ${result.ticketId}</div>
                    <div class="result-detail"><strong>Reason:</strong> ${result.message}</div>
                `;
                break;
            case 'duplicate':
                statusText = 'ALREADY SCANNED';
                iconClass = 'fas fa-exclamation-triangle';
                detailsHtml = `
                    <div class="result-detail"><strong>Name:</strong> ${result.name}</div>
                    <div class="result-detail"><strong>Event:</strong> ${result.event}</div>
                    <div class="result-detail"><strong>Ticket ID:</strong> ${result.ticketId}</div>
                    <div class="result-detail"><strong>Warning:</strong> ${result.message}</div>
                `;
                break;
        }
        
        const sourceText = source === 'camera' ? 'Camera Scan' : 'Manual Entry';
        const timestamp = result.timestamp.toLocaleTimeString();
        
        resultsSection.innerHTML = `
            <div class="result-card ${result.status}">
                <div class="result-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="result-content">
                    <div class="result-status">${statusText}</div>
                    <div class="result-details">
                        ${detailsHtml}
                    </div>
                    <div class="result-timestamp">
                        ${sourceText} at ${timestamp}
                    </div>
                </div>
            </div>
        `;
        
        // Play sound feedback (if supported)
        this.playFeedbackSound(result.status);
        
        // Auto-hide result after 10 seconds
        setTimeout(() => {
            if (resultsSection.innerHTML.includes(result.ticketId)) {
                resultsSection.style.display = 'none';
            }
        }, 10000);
    }

    playFeedbackSound(status) {
        // Create audio feedback for scan results
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Different tones for different results
            switch (status) {
                case 'valid':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
                    break;
                case 'invalid':
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                    break;
                case 'duplicate':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);
                    break;
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            // Audio feedback not supported or failed
            console.log('Audio feedback not available');
        }
    }

    updateStats(status) {
        this.stats.totalScans++;
        
        if (status === 'valid') {
            this.stats.validScans++;
        } else {
            this.stats.invalidScans++;
        }
        
        this.saveStats();
        this.displayStats();
    }

    displayStats() {
        const validScansEl = document.getElementById('validScans');
        const invalidScansEl = document.getElementById('invalidScans');
        const totalScansEl = document.getElementById('totalScans');
        
        if (validScansEl) validScansEl.textContent = this.stats.validScans;
        if (invalidScansEl) invalidScansEl.textContent = this.stats.invalidScans;
        if (totalScansEl) totalScansEl.textContent = this.stats.totalScans;
    }

    saveStats() {
        const today = new Date().toDateString();
        const statsKey = `workerStats_${today}`;
        localStorage.setItem(statsKey, JSON.stringify(this.stats));
    }

    loadStats() {
        const today = new Date().toDateString();
        const statsKey = `workerStats_${today}`;
        const savedStats = localStorage.getItem(statsKey);
        
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        }
        
        this.displayStats();
    }

    showCameraError(message) {
        const cameraContainer = document.querySelector('.camera-container');
        if (!cameraContainer) return;
        
        cameraContainer.innerHTML = `
            <div class="camera-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Camera Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize worker scan page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.workerScan = new WorkerScan();
});
