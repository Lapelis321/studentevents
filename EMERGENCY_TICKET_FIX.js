// EMERGENCY TICKET QUANTITY FIX
// Run this in the browser console on the admin dashboard to fix ticket quantities

console.log('🚨 EMERGENCY TICKET FIX - Starting...');

async function fixTicketQuantities() {
    try {
        // Get authentication token
        const token = localStorage.getItem('adminToken');
        if (!token) {
            console.error('❌ No authentication token found. Please login first.');
            return;
        }

        console.log('🔑 Authentication token found');

        // Get API base URL
        const API_BASE_URL = window.API_BASE_URL || 'https://studentevents-production.up.railway.app/api';
        console.log('🔗 API Base URL:', API_BASE_URL);

        // First, get all events
        console.log('📋 Fetching all events...');
        const eventsResponse = await fetch(`${API_BASE_URL}/events`);
        if (!eventsResponse.ok) {
            throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
        }

        const events = await eventsResponse.json();
        console.log(`📦 Found ${events.length} events`);

        // Update each event to have 600 tickets
        for (const event of events) {
            console.log(`🔄 Updating event: ${event.title} (ID: ${event.id})`);
            
            const updateData = {
                title: event.title,
                date: event.date,
                location: event.location,
                price: event.price,
                currency: event.currency || 'EUR',
                minAge: event.min_age,
                dressCode: event.dress_code,
                description: event.description,
                additionalInfo: event.additional_info,
                totalTickets: 600,
                availableTickets: 600,
                is_active: event.is_active,
                status: event.status || 'active'
            };

            console.log('📤 Sending update data:', updateData);

            const response = await fetch(`${API_BASE_URL}/events/${event.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const updatedEvent = await response.json();
                console.log(`✅ Updated ${event.title} - total_tickets: ${updatedEvent.total_tickets}`);
            } else {
                const errorData = await response.json();
                console.error(`❌ Failed to update ${event.title}:`, errorData);
            }
        }

        console.log('🎉 All events updated successfully!');
        console.log('🔄 Refreshing page to see changes...');
        
        // Refresh the page
        window.location.reload();

    } catch (error) {
        console.error('❌ Emergency fix failed:', error);
    }
}

// Run the fix
fixTicketQuantities();
