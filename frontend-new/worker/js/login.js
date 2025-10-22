// Worker Login Handler
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    showLoading();
    
    const response = await fetchAPI('/api/worker/login', 'POST', {
      email,
      password
    });
    
    // Store token
    localStorage.setItem('workerToken', response.token);
    localStorage.setItem('workerRole', response.role);
    localStorage.setItem('workerName', response.name);
    
    showNotification('Login successful!', 'success');
    
    // Redirect based on role
    setTimeout(() => {
      if (response.role === 'supervisor') {
        window.location.href = 'supervisor.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    }, 500);
    
  } catch (error) {
    showNotification(error.message || 'Login failed. Please check your credentials.', 'error');
  } finally {
    hideLoading();
  }
});

