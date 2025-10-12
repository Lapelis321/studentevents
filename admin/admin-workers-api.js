// ===== WORKER API CONNECTOR =====
// This file connects the admin dashboard to the worker management backend API

console.log('🔌 Worker API Connector initializing...');

const WORKER_API_URL = window.API_BASE_URL || 'https://studentevents-production.up.railway.app';

// Load workers from API
async function loadWorkersFromAPI() {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            console.log('⚠️ No admin token found');
            return [];
        }

        console.log('🔄 Loading workers from API...');
        const response = await fetch(`${WORKER_API_URL}/api/admin/workers`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const workers = await response.json();
        console.log(`✅ Loaded ${workers.length} workers from API`);
        return workers;
    } catch (error) {
        console.error('Error loading workers:', error);
        return [];
    }
}

// Create worker via API
async function createWorkerViaAPI(workerData) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${WORKER_API_URL}/api/admin/workers`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workerData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create worker');
        }

        const worker = await response.json();
        console.log(`✅ Worker created: ${worker.email}`);
        return worker;
    } catch (error) {
        console.error('Error creating worker:', error);
        throw error;
    }
}

// Update worker via API
async function updateWorkerViaAPI(workerId, workerData) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${WORKER_API_URL}/api/admin/workers/${workerId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workerData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update worker');
        }

        const worker = await response.json();
        console.log(`✅ Worker updated: ${workerId}`);
        return worker;
    } catch (error) {
        console.error('Error updating worker:', error);
        throw error;
    }
}

// Delete worker via API
async function deleteWorkerViaAPI(workerId) {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${WORKER_API_URL}/api/admin/workers/${workerId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete worker');
        }

        console.log(`✅ Worker deleted: ${workerId}`);
        return true;
    } catch (error) {
        console.error('Error deleting worker:', error);
        throw error;
    }
}

// Override AdminDashboard worker methods to use API
if (typeof AdminDashboard !== 'undefined' && AdminDashboard.prototype) {
    console.log('✅ Connecting worker API to AdminDashboard...');

    // Override loadWorkersFromStorage to use API
    const originalLoadWorkersFromStorage = AdminDashboard.prototype.loadWorkersFromStorage;
    AdminDashboard.prototype.loadWorkersFromStorage = async function() {
        try {
            const workers = await loadWorkersFromAPI();
            if (workers && workers.length > 0) {
                return workers;
            }
        } catch (error) {
            console.error('Error loading workers from API:', error);
        }
        // Fallback to original method
        return originalLoadWorkersFromStorage.call(this);
    };

    // Override renderWorkersTab to load from API
    const originalRenderWorkersTab = AdminDashboard.prototype.renderWorkersTab;
    AdminDashboard.prototype.renderWorkersTab = async function() {
        console.log('🔄 Loading workers...');
        try {
            this.workers = await loadWorkersFromAPI();
        } catch (error) {
            console.error('Failed to load workers:', error);
            this.workers = this.loadWorkersFromStorage();
        }
        this.renderWorkersTable();
    };

    console.log('✅ Worker API connector ready');
}

console.log('✅ Worker API module loaded');

