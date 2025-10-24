// Contacts Page Handler
async function init() {
  await loadContactInfo();
}

async function loadContactInfo() {
  try {
    showLoading();
    
    const settings = await fetchAPI('/settings');
    
    // Extract settings by key (settings is an object with key-value pairs)
    const getSettingValue = (key, defaultValue = 'Not available') => {
      return settings[key] || defaultValue;
    };
    
    // Support contact info
    document.getElementById('supportEmail').innerHTML = `
      <a href="mailto:${getSettingValue('support_email')}">${getSettingValue('support_email')}</a>
    `;
    document.getElementById('supportPhone').innerHTML = `
      <a href="tel:${getSettingValue('support_phone')}">${getSettingValue('support_phone')}</a>
    `;
    document.getElementById('workingHours').textContent = getSettingValue('support_hours');
    
    // Organization info
    document.getElementById('orgName').textContent = getSettingValue('organization_name', 'Afterstate Events');
    document.getElementById('orgEmail').innerHTML = `
      <a href="mailto:${getSettingValue('organization_email')}">${getSettingValue('organization_email')}</a>
    `;
    document.getElementById('orgPhone').innerHTML = `
      <a href="tel:${getSettingValue('organization_phone')}">${getSettingValue('organization_phone')}</a>
    `;
    
  } catch (error) {
    console.error('Failed to load contact info:', error);
    
    // Load default values
    document.getElementById('supportEmail').innerHTML = '<a href="mailto:support@afterstate.events">support@afterstate.events</a>';
    document.getElementById('supportPhone').innerHTML = '<a href="tel:+37060000000">+370 600 00000</a>';
    document.getElementById('workingHours').textContent = 'Monday - Friday, 9:00 AM - 6:00 PM';
    
    document.getElementById('orgName').textContent = 'Afterstate Events';
    document.getElementById('orgEmail').innerHTML = '<a href="mailto:info@afterstate.events">info@afterstate.events</a>';
    document.getElementById('orgPhone').innerHTML = '<a href="tel:+37060000000">+370 600 00000</a>';
    
    showNotification('Using default contact information', 'info');
  } finally {
    hideLoading();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

