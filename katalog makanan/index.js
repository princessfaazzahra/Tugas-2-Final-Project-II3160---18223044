const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = 3000; 

app.use(express.json());
app.use(cors());

const SUPABASE_URL = 'https://nxamzwahwgakiatujxug.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54YW16d2Fod2dha2lhdHVqeHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMDkwMjcsImV4cCI6MjA4MDU4NTAyN30.9nBRbYXKJmLcWbKcx0iICDNisdQNCg0dFjI_JGVt5pk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Platoo Catalog Microservice is running!' });
});

app.post('/makanan/:id/status', async (req, res) => {
    const catalogId = req.params.id;
    const { is_aktif } = req.body; 

    console.log(`Mengubah status untuk catalog_id: ${catalogId} menjadi ${is_aktif}`);

    if (typeof is_aktif !== 'boolean') {
        return res.status(400).json({ message: 'Properti "is_aktif" harus berupa boolean (true/false).' });
    }

    try {
        const { data, error } = await supabase
            .from('catalog')
            .update({ is_aktif: is_aktif })
            .eq('catalog_id', catalogId)
            .select(); 

        if (error) throw error;

        if (data.length === 0) {
            return res.status(404).json({ message: 'Makanan tidak ditemukan.' });
        }

        res.status(200).json({ message: 'Status makanan berhasil diubah.', data: data[0] });

    } catch (error) {
        console.error('Error saat mengubah status:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
});

app.patch('/makanan/:id', async (req, res) => {
    const catalogId = req.params.id;
    const { nama_makanan, stok, harga, foto } = req.body; 

    console.log(`Mengedit data untuk catalog_id: ${catalogId}`);

    const updateData = {};
    if (nama_makanan) updateData.nama_makanan = nama_makanan;
    if (stok !== undefined) updateData.stok = stok;
    if (harga !== undefined) updateData.harga = harga;
    if (foto) updateData.foto = foto; 

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'Tidak ada data yang dikirim untuk diubah.' });
    }

    try {
        const { data, error } = await supabase
            .from('catalog')
            .update(updateData)
            .eq('catalog_id', catalogId)
            .select();

        if (error) throw error;

        if (data.length === 0) {
            return res.status(404).json({ message: 'Makanan tidak ditemukan.' });
        }

        res.status(200).json({ message: 'Data makanan berhasil diubah.', data: data[0] });

    } catch (error) {
        console.error('Error saat mengedit makanan:', error.message);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Microservice Katalog berjalan di http://localhost:${port}`);
});
