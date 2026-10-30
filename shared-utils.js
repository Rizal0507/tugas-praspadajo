/**
 * shared-utils.js
 * Kumpulan fungsi utilitas umum yang dipakai oleh anggota.html dan pelatih.html
 * Dibuat untuk mengurangi duplikasi kode (DRY - Don't Repeat Yourself).
 */

// ======================= WAKTU & TANGGAL =======================

// Mendapatkan tanggal hari ini (Format: YYYY-MM-DD) berdasarkan zona waktu Asia/Jakarta
function getLocalToday() {
    const d = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

// Mengambil objek Date lokal dari berbagai format (ISO string, string tanggal, dll)
function getLocalDateString(dateObj) {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
}

// Mengubah format tanggal dari Google Sheets/ISO menjadi format YYYY-MM-DD
function extractLocalDate(dateStr) {
    if (!dateStr) return '';
    let str = dateStr.toString().trim();
    if (str.includes('T')) {
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            const pad = (n) => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
        }
        return str.split('T')[0];
    }
    return str;
}

// Mengubah format YYYY-MM-DD menjadi DD/MM/YYYY (Format Indonesia)
function formatDateIndo(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
}

// Format tanggal dan waktu lengkap (Mengembalikan objek {date, time})
function formatDateTime(iso) {
    if(!iso) return { date: "", time: "" };
    try {
        if (iso.includes('/')) {
            const parts = iso.split(', ');
            return { date: parts[0], time: parts[1] || '' };
        }
        const d = new Date(iso);
        if(isNaN(d.getTime())) return { date: iso, time: "" };
        const pad = (n) => String(n).padStart(2, '0');
        return { date: `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`, time: `${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}` };
    } catch(e) { return { date: iso, time: "" }; }
}

// ======================= STRING & URL =======================

// Mengubah link Google Drive biasa menjadi link gambar langsung (lh3.googleusercontent)
function getDirectImageLink(url) {
    if(!url) return "";
    const match = url.match(/[-\w]{25,}/);
    return match ? `https://lh3.googleusercontent.com/d/${match[0]}` : url;
}

// Membersihkan string agar hanya menyisakan huruf dan angka (untuk pencocokan nama tugas)
function normalizeStr(str) {
    return String(str || "").replace(/[^a-z0-9]/gi, '').toLowerCase();
}

// ======================= UI (TOAST & LOADING) =======================

// Menampilkan notifikasi pop-up di layar
function showToast(msg, type='info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const div = document.createElement('div');
    
    // Penentuan warna dan ikon berdasarkan tipe
    let bgClass = 'bg-gray-800'; 
    let iconClass = 'fa-info';
    
    if (type === 'success') { bgClass = 'bg-emerald-600'; iconClass = 'fa-check'; }
    else if (type === 'error') { bgClass = 'bg-rose-600'; iconClass = 'fa-xmark'; }
    
    div.className = `p-3 rounded-xl shadow-xl text-xs font-bold text-white flex items-center gap-2 transition-all transform translate-y-4 opacity-0 mt-2 ${bgClass}`;
    div.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${msg}</span>`;
    
    container.appendChild(div);
    
    // Animasi masuk
    setTimeout(() => div.classList.remove('translate-y-4', 'opacity-0'), 50);
    // Animasi keluar dan hapus elemen
    setTimeout(() => { 
        div.classList.add('opacity-0'); 
        setTimeout(() => div.remove(), 300); 
    }, 3000);
}

// Menampilkan/menyembunyikan layar loading overlay
function showLoading(show, txt="Memproses...") {
    const overlay = document.getElementById('loadingOverlay');
    const textEl = document.getElementById('loadingText');
    if (!overlay) return;
    
    if (textEl) textEl.textContent = txt;
    if (show) {
        overlay.classList.remove('opacity-0', 'pointer-events-none');
    } else {
        overlay.classList.add('opacity-0', 'pointer-events-none');
    }
}
