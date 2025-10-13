// Quick Participants Viewer - Run in Admin Dashboard Console
// Copy and paste this entire script into the browser console (F12 → Console)

(async () => {
  console.log('🔧 Participants Viewer - Starting...');
  
  const API = 'https://studentevents-production.up.railway.app/api';
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    console.error('❌ No admin token found. Please log into admin dashboard first.');
    return;
  }
  
  try {
    console.log('📡 Fetching bookings from API...');
    const res = await fetch(`${API}/admin/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) {
      console.error(`❌ Failed to load bookings: ${res.status} ${res.statusText}`);
      return;
    }
    
    const bookings = await res.json();
    console.log(`✅ Loaded ${bookings.length} bookings`);
    
    // Flatten all participants
    const participants = bookings.flatMap(b => {
      const attendees = Array.isArray(b.attendees) && b.attendees.length 
        ? b.attendees 
        : [{ first_name: b.first_name, last_name: b.last_name, email: b.email }];
      
      return attendees.map(a => ({
        event: b.event_title || 'Unknown',
        status: b.payment_status,
        firstName: a.first_name || '',
        lastName: a.last_name || '',
        email: a.email || '',
        reference: b.payment_reference || ''
      }));
    });
    
    console.log(`👥 Total participants: ${participants.length}`);
    console.table(participants);
    
    // Export to CSV
    const headers = ['Event', 'Status', 'First Name', 'Last Name', 'Email', 'Reference'];
    const csv = [headers.join(',')].concat(participants.map(p => 
      headers.map(h => {
        const key = h.toLowerCase().replace(' ', '');
        const value = p[key] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      }).join(',')
    )).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📊 CSV exported successfully!');
    
    // Show summary by status
    const statusCounts = participants.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📈 Summary by status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} participants`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
