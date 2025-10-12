// Update existing events with proper min_age and dress_code data
// This script will update the events in the database

const API_BASE_URL = 'https://studentevents-production.up.railway.app';

async function updateEventData() {
    const token = 'YOUR_ADMIN_TOKEN_HERE'; // You'll need to get this from admin login
    
    const events = [
        {
            id: '778b1766-4842-48c4-a423-74b9faa27891',
            title: 'Fux After Party',
            min_age: 18,
            dress_code: 'Studio 54'
        },
        {
            id: 'bb9ad0bb-f38e-4722-bea6-39faedd0d3b9', 
            title: 'AFTERSTATE x OPIUM',
            min_age: 18,
            dress_code: 'Smart Casual'
        }
    ];
    
    for (const event of events) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/${event.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    minAge: event.min_age,
                    dressCode: event.dress_code
                })
            });
            
            if (response.ok) {
                console.log(`✅ Updated ${event.title}: min_age=${event.min_age}, dress_code=${event.dress_code}`);
            } else {
                console.error(`❌ Failed to update ${event.title}:`, await response.text());
            }
        } catch (error) {
            console.error(`❌ Error updating ${event.title}:`, error);
        }
    }
}

// Run the update
updateEventData();
