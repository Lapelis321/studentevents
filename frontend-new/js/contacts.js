// Contacts Page Handler
async function init() {
  await loadContactInfo();
}

async function loadContactInfo() {
  try {
    showLoading();
    
    const settings = await fetchAPI('/api/settings');
    
    // Extract settings by key
    const getSettingValue = (key, defaultValue = 'Not available') => {
      const setting = settings.find(s => s.key === key);
      return setting ? setting.value : defaultValue;
    };
    
    // Support contact info
    document.getElementById('supportEmail').innerHTML = `
      <a href="mailto:${getSettingValue('supportEmail')}">${getSettingValue('supportEmail')}</a>
    `;
    document.getElementById('supportPhone').innerHTML = `
      <a href="tel:${getSettingValue('supportPhone')}">${getSettingValue('supportPhone')}</a>
    `;
    document.getElementById('workingHours').textContent = getSettingValue('workingHours');
    
    // Organization info
    document.getElementById('orgName').textContent = getSettingValue('orgName', 'StudentEvents');
    document.getElementById('orgEmail').innerHTML = `
      <a href="mailto:${getSettingValue('orgEmail')}">${getSettingValue('orgEmail')}</a>
    `;
    document.getElementById('orgPhone').innerHTML = `
      <a href="tel:${getSettingValue('orgPhone')}">${getSettingValue('orgPhone')}</a>
    `;
    
  } catch (error) {
    console.error('Failed to load contact info:', error);
    
    // Load default values
    document.getElementById('supportEmail').innerHTML = '<a href="mailto:support@studentevents.com">support@studentevents.com</a>';
    document.getElementById('supportPhone').innerHTML = '<a href="tel:+370XXXXXXXX">+370 XXX XXXXX</a>';
    document.getElementById('workingHours').textContent = 'Monday - Friday, 9:00 AM - 6:00 PM';
    
    document.getElementById('orgName').textContent = 'StudentEvents';
    document.getElementById('orgEmail').innerHTML = '<a href="mailto:info@studentevents.com">info@studentevents.com</a>';
    document.getElementById('orgPhone').innerHTML = '<a href="tel:+370XXXXXXXX">+370 XXX XXXXX</a>';
    
    showNotification('Using default contact information', 'info');
  } finally {
    hideLoading();
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);

