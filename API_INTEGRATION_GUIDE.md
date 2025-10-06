# 🔧 API Integration Guide

## ✅ **COMPLETED:**

### 1. Backend API - DONE ✅
**File:** `backend/production-server.js` (replaced with enhanced version)

**Added:**
- ✅ In-memory storage for mock data persistence
- ✅ Authentication middleware (`authenticateToken`, `requireAdmin`)
- ✅ CREATE endpoint: `POST /api/events` (Admin only)
- ✅ UPDATE endpoint: `PUT /api/events/:id` (Admin only)
- ✅ DELETE endpoint: `DELETE /api/events/:id` (Admin only)
- ✅ GET workers: `GET /api/workers` (Admin only)
- ✅ CREATE worker: `POST /api/workers` (Admin only)
- ✅ Validate ticket: `POST /api/tickets/validate` (Worker only)
- ✅ Enhanced auth with JWT tokens
- ✅ Worker login support

**Features:**
- Changes to events persist across all users
- Admin changes immediately affect main page
- In-memory storage survives until server restart
- Falls back to database if available

---

## 🔨 **TO COMPLETE:**

### 2. Admin Dashboard Integration
**File:** `admin/admin-dashboard.js` - Needs modification

**Created helper:** `admin/admin-api-integration.js` (ready to use)

**What to do:**
1. Add to `admin/index.html` before `admin-dashboard.js`:
```html
<script src="/scripts/config.js"></script>
<script src="/admin/admin-api-integration.js"></script>
<script src="/admin/admin-dashboard.js"></script>
```

2. Modify `admin-dashboard.js`:

**Change `loadMockData()` to:**
```javascript
async loadMockData() {
    try {
        this.events = await AdminAPI.getEvents();
        this.workers = await AdminAPI.getWorkers();
        this.updateEventsStatistics();
    } catch (error) {
        console.error('Error loading data:', error);
        this.showNotification('Failed to load data', 'error');
    }
}
```

**Change `deleteEvent(eventId)` to:**
```javascript
async deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        try {
            await AdminAPI.deleteEvent(eventId);
            this.events = this.events.filter(e => e.id !== eventId);
            this.showNotification('Event deleted successfully', 'success');
            this.renderCurrentTab();
        } catch (error) {
            this.showNotification('Failed to delete event', 'error');
        }
    }
}
```

**Change `saveEditedEvent()` to:**
```javascript
async saveEditedEvent() {
    const form = document.getElementById('editEventForm');
    const formData = new FormData(form);
    
    const eventData = {
        title: formData.get('name'),
        date: formData.get('date'),
        location: formData.get('location'),
        price: parseFloat(formData.get('price')),
        currency: 'EUR',
        minAge: parseInt(formData.get('minAge')) || 16,
        dressCode: formData.get('dressCode') || 'Casual',
        description: formData.get('description'),
        additionalInfo: formData.get('additionalInfo') || '',
        availableTickets: parseInt(formData.get('availableTickets')),
        totalTickets: parseInt(formData.get('totalTickets'))
    };
    
    try {
        if (this.editingEventId) {
            await AdminAPI.updateEvent(this.editingEventId, eventData);
            this.showNotification('Event updated successfully', 'success');
        } else {
            await AdminAPI.createEvent(eventData);
            this.showNotification('Event created successfully', 'success');
        }
        
        this.events = await AdminAPI.getEvents();
        this.closeEditEventModal();
        this.renderCurrentTab();
    } catch (error) {
        this.showNotification('Failed to save event', 'error');
    }
}
```

---

### 3. Worker Portal Integration
**File:** `worker/worker-scan.js` - Needs modification

**Add to top of file:**
```javascript
const API_BASE_URL = window.CONFIG ? window.CONFIG.API_BASE_URL.replace('/api', '') : 'https://studentevents-production.up.railway.app';

function getWorkerToken() {
    return localStorage.getItem('workerToken');
}
```

**Change ticket validation (line ~187):**
```javascript
async validateTicket(ticketCode) {
    try {
        const token = getWorkerToken();
        const response = await fetch(`${API_BASE_URL}/api/tickets/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ticketId: ticketCode })
        });
        
        const result = await response.json();
        
        if (result.success && result.valid) {
            this.showValidTicket(result.ticket);
        } else {
            this.showInvalidTicket();
        }
    } catch (error) {
        console.error('Error validating ticket:', error);
        this.showError('Failed to validate ticket');
    }
}
```

---

### 4. Admin Login - Save Token
**File:** `admin/login.html` or the login script

**After successful login, save token:**
```javascript
// When login successful
const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});

const data = await response.json();

if (data.success) {
    localStorage.setItem('adminToken', data.token);
    window.location.href = '/admin/index.html';
}
```

---

### 5. Worker Login - Save Token
**File:** `worker/login.html` or the login script

**After successful login:**
```javascript
// When login successful
const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
});

const data = await response.json();

if (data.success && data.user.role === 'worker') {
    localStorage.setItem('workerToken', data.token);
    localStorage.setItem('workerInfo', JSON.stringify(data.user));
    window.location.href = '/worker/index.html';
}
```

---

## 🧪 **TESTING:**

### Test Credentials:
- **Admin:** admin@studentevents.com / admin123
- **Worker:** john.worker@studentevents.com / worker123

### Test Flow:
1. **Admin creates event** → Should appear on main page immediately
2. **Admin edits event** → Changes should reflect on main page
3. **Admin deletes event** → Should disappear from main page
4. **Worker validates ticket** → Should work with API
5. **Refresh pages** → Data should persist (in-memory)

---

## 📝 **DEPLOYMENT:**

After making changes:
```bash
# Commit changes
git add .
git commit -m "Add full API integration - Admin changes now affect all pages"

# Push to GitHub
git push origin main

# Deploy backend to Railway
cd backend
railway up

# Frontend will auto-deploy on Netlify (if connected to GitHub)
```

---

## ✅ **BENEFITS:**

- ✅ Admin changes immediately affect main page
- ✅ Worker portal connected to API
- ✅ Data persists across sessions (until server restart)
- ✅ Professional authentication with JWT
- ✅ Ready for real database integration
- ✅ All pages synchronized

---

## 🎯 **CURRENT STATUS:**

| Component | Status |
|-----------|--------|
| Backend API | ✅ Complete & Deployed |
| Auth System | ✅ Complete |
| In-memory Storage | ✅ Complete |
| Admin API Helper | ✅ Created |
| Admin Dashboard Update | ⏳ Guide provided |
| Worker Portal Update | ⏳ Guide provided |
| Login Token Saving | ⏳ Guide provided |

**Next:** Follow the guides above to complete the integration!

