// CONSOLE VIEW PARTICIPANTS SCRIPT
// Copy and paste this entire script into your browser console on any page

(async function viewAllParticipants() {
    console.log('🚀 Starting participant viewer...');
    
    const API_BASE_URL = 'https://studentevents-production.up.railway.app/api';
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
        console.error('❌ Not logged in. Please log in to admin dashboard first.');
        alert('Not logged in. Please log in to admin dashboard first.');
        return;
    }
    
    try {
        console.log('🔍 Fetching participants from API...');
        const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const bookings = await response.json();
        console.log('✅ Loaded bookings:', bookings.length);
        
        // Flatten participants from bookings
        const participants = [];
        bookings.forEach(booking => {
            // If booking has attendees array, use it; otherwise use main contact
            const attendees = Array.isArray(booking.attendees) && booking.attendees.length 
                ? booking.attendees 
                : [{
                    first_name: booking.first_name,
                    last_name: booking.last_name,
                    email: booking.email
                }];

            attendees.forEach(attendee => {
                participants.push({
                    event: booking.event_title || 'Unknown Event',
                    status: booking.payment_status,
                    firstName: attendee.first_name || '',
                    lastName: attendee.last_name || '',
                    email: attendee.email || '',
                    reference: booking.payment_reference || '',
                    amount: booking.total_amount || 0
                });
            });
        });
        
        console.log('👥 Total participants:', participants.length);
        console.table(participants);
        
        // Create downloadable CSV
        const headers = ['Event', 'Status', 'First Name', 'Last Name', 'Email', 'Reference', 'Amount'];
        const csvContent = [
            headers.join(','),
            ...participants.map(p => [
                `"${p.event}"`,
                p.status,
                `"${p.firstName}"`,
                `"${p.lastName}"`,
                `"${p.email}"`,
                `"${p.reference}"`,
                p.amount.toFixed(2)
            ].join(','))
        ].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `participants-${new Date().toISOString().slice(0,10)}.csv`;
        link.textContent = '📥 Download CSV';
        link.style.cssText = 'display: block; margin: 10px 0; padding: 10px; background: #007bff; color: white; text-decoration: none; border-radius: 4px;';
        
        // Add to page
        const container = document.createElement('div');
        container.style.cssText = 'position: fixed; top: 10px; right: 10px; background: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); z-index: 10000; max-width: 300px;';
        container.innerHTML = `
            <h3 style="margin: 0 0 10px; color: #333;">📊 Participants Found</h3>
            <p style="margin: 5px 0; color: #666;">Total: ${participants.length} participants</p>
        `;
        container.appendChild(link);
        document.body.appendChild(container);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 30000);
        
        console.log('✅ Participant viewer complete! Check the download link on the page.');
        
    } catch (error) {
        console.error('❌ Error loading participants:', error);
        alert(`Error: ${error.message}`);
    }
})();
