// Script to force save event name to "AFTERSTATE x OPIUM" to the database
// Run this in the admin dashboard console

async function forceSaveEventName() {
    try {
        console.log('🔄 Forcing event name change to "AFTERSTATE x OPIUM" to database...');
        
        // Get admin token
        const token = localStorage.getItem('adminToken');
        if (!token) {
            console.error('❌ No admin token found. Please run this in the admin dashboard.');
            return;
        }
        
        const API_BASE_URL = 'https://studentevents-production.up.railway.app/api';
        
        // First, check if server is available
        console.log('📡 Checking server connectivity...');
        try {
            const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
            console.log('🏥 Server health check:', healthResponse.status);
        } catch (healthError) {
            console.warn('⚠️ Health check failed, but continuing with API call...');
        }
        
        // Get current events
        console.log('📡 Fetching current events...');
        const eventsResponse = await fetch(`${API_BASE_URL}/events`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!eventsResponse.ok) {
            throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
        }
        
        const events = await eventsResponse.json();
        console.log('📋 Found events:', events.length);
        
        // Find the event that needs to be updated
        let targetEvent = events.find(e => 
            e.title === 'undefined' || 
            e.title === null || 
            e.title === '' ||
            e.title === 'AFTERSTATE x OPIUM'  // In case it was partially saved
        );
        
        if (!targetEvent) {
            console.error('❌ Target event not found');
            console.log('Available events:', events.map(e => ({ id: e.id, title: e.title })));
            return;
        }
        
        console.log('🎯 Found target event:', targetEvent.title, 'ID:', targetEvent.id);
        
        // Update the event name
        const newName = 'AFTERSTATE x OPIUM';
        console.log('📝 Updating event name to:', newName);
        
        const updateData = {
            title: newName,
            date: targetEvent.date,
            location: targetEvent.location,
            price: targetEvent.price,
            currency: targetEvent.currency || 'EUR',
            minAge: targetEvent.min_age,
            dressCode: targetEvent.dress_code,
            description: targetEvent.description,
            additionalInfo: targetEvent.additional_info,
            totalTickets: targetEvent.total_tickets,
            availableTickets: targetEvent.available_tickets,
            is_active: targetEvent.is_active,
            status: targetEvent.status,
            ticketsAvailableDate: targetEvent.tickets_available_date
        };
        
        console.log('🚀 Sending update request:', updateData);
        
        const updateResponse = await fetch(`${API_BASE_URL}/events/${targetEvent.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });
        
        console.log('📡 Update response status:', updateResponse.status);
        
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Failed to update event: ${updateResponse.status} - ${errorText}`);
        }
        
        const updatedEvent = await updateResponse.json();
        console.log('✅ Event updated successfully in database!');
        console.log('📊 Updated event:', updatedEvent);
        console.log('📝 New name:', updatedEvent.title);
        
        // Show success notification
        if (window.adminDashboard && window.adminDashboard.showNotification) {
            window.adminDashboard.showNotification('Event name "AFTERSTATE x OPIUM" saved to database!', 'success');
        }
        
        // Refresh the page to show the updated data
        console.log('🔄 Refreshing page to show updated data...');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
        return updatedEvent;
        
    } catch (error) {
        console.error('❌ Error forcing event name save:', error);
        if (window.adminDashboard && window.adminDashboard.showNotification) {
            window.adminDashboard.showNotification('Failed to save event name: ' + error.message, 'error');
        }
        throw error;
    }
}

// Run the force save
console.log('🚀 Starting force save of event name...');
forceSaveEventName()
    .then(result => {
        console.log('🎉 Success! Event name "AFTERSTATE x OPIUM" saved to database');
        console.log('Result:', result);
    })
    .catch(error => {
        console.error('💥 Failed to force save event name:', error);
    });


