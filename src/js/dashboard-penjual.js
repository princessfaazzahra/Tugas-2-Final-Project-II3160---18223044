const SUPABASE_URL = 'https://sakbhdzgsoazaihlzyov.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNha2JoZHpnc29hemFpaGx6eW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NDc0MjgsImV4cCI6MjA4MzAyMzQyOH0.wzSp12JyGP5AkwRg5gahK61Kso_yRKgagxcF2nIr1QI';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check authentication
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
});

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('platoo_user') || '{}');
    const userId = user.id || user.id_penjual; // Check for both 'id' and 'id_penjual'
    
    // Check if user exists and is penjual
    if (!user || !userId || user.role !== 'penjual') {
        console.log('Auth check failed:', user);
        window.location.href = '/login.html';
        return;
    }
    
    console.log('Auth success:', user);
    
    // Set user info
    const restoName = user.nama_restoran || user.username || 'Restoran';
    document.getElementById('userName').textContent = restoName;
    document.getElementById('welcomeName').textContent = restoName;
    document.getElementById('userInitial').textContent = restoName.charAt(0).toUpperCase();
}

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Activate Ads button
    const activateAdsBtn = document.getElementById('activateAdsBtn');
    if (activateAdsBtn) {
        activateAdsBtn.addEventListener('click', function() {
            showNotification('Fitur masih dalam pengembangan');
        });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-alert';
    notification.innerHTML = `
        ${message}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function handleLogout() {
    localStorage.removeItem('platoo_user');
    localStorage.removeItem('resto_id');
    window.location.href = '/login.html';
}

console.log('Dashboard Penjual loaded successfully!');
