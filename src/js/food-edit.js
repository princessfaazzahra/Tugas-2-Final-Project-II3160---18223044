const SUPABASE_URL = 'https://sakbhdzgsoazaihlzyov.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNha2JoZHpnc29hemFpaGx6eW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NDc0MjgsImV4cCI6MjA4MzAyMzQyOH0.wzSp12JyGP5AkwRg5gahK61Kso_yRKgagxcF2nIr1QI';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MICROSERVICE_URL = 'http://182.10.129.52:3000'; 

function showModal(title, message, type = 'success', showCancel = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalIcon = document.getElementById('modalIcon');
        const modalConfirm = document.getElementById('modalConfirm');
        const modalCancel = document.getElementById('modalCancel');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        modalIcon.className = 'modal-icon ' + type;
        
        if (showCancel) {
            modalCancel.style.display = 'block';
        } else {
            modalCancel.style.display = 'none';
        }
        
        modal.classList.add('show');
        
        modalConfirm.onclick = () => {
            modal.classList.remove('show');
            resolve(true);
        };

        modalCancel.onclick = () => {
            modal.classList.remove('show');
            resolve(false);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                resolve(false);
            }
        };
    });
}

function showAlert(message, type = 'success') {
    const titles = {
        success: 'Berhasil!',
        error: 'Gagal!',
        warning: 'Peringatan!',
        question: 'Konfirmasi'
    };
    return showModal(titles[type] || 'Informasi', message, type, false);
}

function showConfirm(message, title = 'Konfirmasi') {
    return showModal(title, message, 'question', true);
}

async function getCatalogIdFromUrl(){
    const urlParams = new URLSearchParams(window.location.search);
    const catalogId = urlParams.get('id');
    
    if (!catalogId) {
        await showAlert('ID makanan tidak ditemukan!', 'error');
        window.location.href = '/food-catalog.html';
        return null;
    }
    
    return catalogId;
}


async function fetchFoodData(catalogId) {
    try {
        const { data, error } = await supabaseClient
            .from('catalog')
            .select('*')
            .eq('catalog_id', catalogId)
            .single();
        
        if (error) throw error;
        return data;
        
    } catch (error) {
        console.error('Error fetching food data:', error);
        await showAlert('Gagal memuat data makanan.', 'error');
        return null;
    }
}


function populateForm(foodData) {
    document.getElementById('catalog_id').value = foodData.catalog_id;
    document.getElementById('resto_id').value = foodData.resto_id;
    document.getElementById('nama_makanan').value = foodData.nama_makanan;
    document.getElementById('stok').value = foodData.stok;
    document.getElementById('harga').value = foodData.harga;
}

async function uploadImage(file, restoId) {
    try {
        const fileName = `${restoId}_${Date.now()}_${file.name}`;
        
        const { data, error } = await supabaseClient.storage
            .from('resto-photos/katalog')
            .upload(fileName, file);
        
        if (error) throw error;

        const { data: urlData } = supabaseClient.storage
            .from('resto-photos/katalog')
            .getPublicUrl(fileName);
        
        return urlData.publicUrl;
        
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}


async function handleSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.textContent = 'Menyimpan...';
    submitBtn.disabled = true;

    try {
        const catalogId = document.getElementById('catalog_id').value;
        const restoId = document.getElementById('resto_id').value;
        const namaMakanan = document.getElementById('nama_makanan').value;
        const stok = parseInt(document.getElementById('stok').value);
        const harga = parseInt(document.getElementById('harga').value);
        const fotoFile = document.getElementById('foto').files[0];
        
        if (!namaMakanan.trim() || isNaN(stok) || stok < 0 || isNaN(harga) || harga <= 0) {
            await showAlert('Mohon lengkapi semua field yang wajib dengan benar!', 'warning');
            submitBtn.textContent = 'Update';
            submitBtn.disabled = false;
            return;
        }
        
        const updateData = {
            nama_makanan: namaMakanan,
            stok: stok,
            harga: harga
        };
        
        if (fotoFile) {
            console.log('Uploading new image...');
            const newFotoUrl = await uploadImage(fotoFile, restoId);
            updateData.foto = newFotoUrl;
        }
        
        console.log('Sending update to microservice...');
        const response = await fetch(`${MICROSERVICE_URL}/makanan/${catalogId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Gagal mengupdate makanan.');
        }
        
        await showAlert('Makanan berhasil diupdate!', 'success');

        window.location.href = '/food-catalog.html';
        
    } catch (error) {
        console.error('Error updating food:', error);
        await showAlert(`Gagal mengupdate makanan. Silakan coba lagi. Pesan: ${error.message}`, 'error');
        
        submitBtn.textContent = 'Update';
        submitBtn.disabled = false;
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    console.log('Food edit page loaded');
    
    // Get catalog ID from URL
    const catalogId = await getCatalogIdFromUrl();
    if (!catalogId) return;
    
    // Fetch existing data
    const foodData = await fetchFoodData(catalogId);
    if (!foodData) {
        await showAlert('Data makanan tidak ditemukan!', 'error');
        window.location.href = '/food-catalog.html';
        return;
    }
    
    populateForm(foodData);
    
    // Setup form submit handler
    const form = document.getElementById('foodEditForm');
    form.addEventListener('submit', handleSubmit);
});
