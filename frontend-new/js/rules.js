// Rules & Policy Page Handler
let policyData = [];

async function init() {
  await loadPolicies();
  displayPolicies();
}

async function loadPolicies() {
  try {
    showLoading();
    const response = await fetchAPI('/policies');
    policyData = response;
  } catch (error) {
    showNotification('Failed to load policies', 'error');
    console.error('Error:', error);
    
    // Load default content if API fails
    policyData = getDefaultPolicies();
  } finally {
    hideLoading();
  }
}

function getDefaultPolicies() {
  return [
    {
      type: 'terms_of_service',
      title: 'Terms of Service',
      content: `
        <h3>1. Ticket Purchase and Use</h3>
        <p>By purchasing a ticket, you agree to comply with all event rules and regulations. Tickets are non-transferable and valid only for the specified event date.</p>
        
        <h3>2. Entry Requirements</h3>
        <p>Valid ID may be required for entry. Minimum age restrictions apply as specified for each event.</p>
        
        <h3>3. Prohibited Items</h3>
        <ul>
          <li>Weapons or dangerous objects</li>
          <li>Illegal substances</li>
          <li>Professional recording equipment</li>
          <li>Outside food and beverages</li>
        </ul>
        
        <h3>4. Photography and Recording</h3>
        <p>By attending our events, you consent to being photographed or recorded for promotional purposes.</p>
      `
    },
    {
      type: 'privacy_policy',
      title: 'Privacy Policy',
      content: `
        <h3>Data Collection</h3>
        <p>We collect personal information including name, email, phone number, and payment details for ticket processing and event management.</p>
        
        <h3>Data Usage</h3>
        <p>Your data is used solely for event management, ticket delivery, and communication about your booking.</p>
        
        <h3>Data Protection</h3>
        <p>We implement industry-standard security measures to protect your personal information.</p>
        
        <h3>Third-Party Services</h3>
        <p>We use trusted third-party services for payment processing (Stripe) and email delivery (SendGrid).</p>
      `
    },
    {
      type: 'event_guidelines',
      title: 'Event Guidelines',
      content: `
        <h3>Respectful Behavior</h3>
        <p>All attendees must treat staff, volunteers, and other guests with respect. Harassment, discrimination, or abusive behavior will not be tolerated.</p>
        
        <h3>Dress Code</h3>
        <p>Event-specific dress codes apply. Please check your event details before attending.</p>
        
        <h3>Safety and Security</h3>
        <p>Follow all instructions from event staff and security personnel. Emergency exits must remain clear at all times.</p>
        
        <h3>Alcohol and Substances</h3>
        <p>Alcohol may be served at some events (18+ only). Drug use is strictly prohibited.</p>
      `
    },
    {
      type: 'refund_policy',
      title: 'Refund Policy',
      content: `
        <h3>Cancellation by Organizer</h3>
        <p>If an event is cancelled by the organizer, full refunds will be issued within 14 business days.</p>
        
        <h3>Ticket Exchanges</h3>
        <p>Ticket exchanges may be possible up to 48 hours before the event, subject to availability.</p>
        
        <h3>No-Show Policy</h3>
        <p>No refunds will be issued for no-shows or late arrivals after event start time.</p>
        
        <h3>Force Majeure</h3>
        <p>In cases of force majeure (natural disasters, pandemics, etc.), refund policies will be handled on a case-by-case basis.</p>
      `
    },
    {
      type: 'code_of_conduct',
      title: 'Code of Conduct',
      content: `
        <h3>Expected Behavior</h3>
        <ul>
          <li>Be respectful and considerate of others</li>
          <li>Follow venue rules and staff instructions</li>
          <li>Keep the venue clean</li>
          <li>Report any suspicious activity to staff</li>
        </ul>
        
        <h3>Unacceptable Behavior</h3>
        <ul>
          <li>Violence or threats of violence</li>
          <li>Harassment or discrimination</li>
          <li>Intoxication or disruptive behavior</li>
          <li>Theft or property damage</li>
        </ul>
        
        <h3>Consequences</h3>
        <p>Violation of this code of conduct may result in immediate removal from the event without refund and potential ban from future events.</p>
      `
    }
  ];
}

function displayPolicies() {
  const container = document.getElementById('policyContent');
  
  const policiesHTML = policyData.map(policy => `
    <div class="policy-section">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h2 style="margin: 0;">${policy.title || formatPolicyType(policy.type)}</h2>
        <button onclick="downloadPolicyPDF('${policy.type}')" class="btn btn-secondary btn-sm">
          <i class="fas fa-download"></i> Download PDF
        </button>
      </div>
      ${policy.content}
    </div>
  `).join('');
  
  container.innerHTML = policiesHTML;
}

function formatPolicyType(type) {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

async function downloadPolicyPDF(policyType) {
  try {
    showLoading();
    
    const response = await fetch(`${window.CONFIG.API_BASE_URL}/policies/${policyType}/pdf`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${policyType}-policy.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('PDF downloaded successfully', 'success');
    
  } catch (error) {
    showNotification('Failed to download PDF', 'error');
    console.error('Error:', error);
  } finally {
    hideLoading();
  }
}

// Keep backward compatibility
async function downloadPDF() {
  // Download the first policy as default
  if (policyData.length > 0) {
    await downloadPolicyPDF(policyData[0].type);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

