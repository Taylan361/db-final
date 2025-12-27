import axios from 'axios';

// Render'daki Backend adresin
const BASE_URL = "https://db-final-kh6u.onrender.com";

export const api = axios.create({
    baseURL: BASE_URL,
});

// GET (Tüm Tezleri Çek)
export const getTheses = () => api.get('/api/theses');

// POST (Tez Ekle)
export const addThesis = (data) => api.post('/api/theses', data);

// DELETE (Tez Sil)
export const deleteThesis = (id) => api.delete(`/api/theses/${id}`);

// --- ARAMA FONKSİYONU ---
export const searchTheses = (filters) => {
    const cleanParams = {};
    
    for (const key in filters) {
        if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
            cleanParams[key] = filters[key];
        }
    }

    console.log("Backend'e giden parametreler:", cleanParams);
    return api.get('/api/search', { params: cleanParams });
};

// Dropdown Verileri (Kişiler, Enstitüler vb.)
export const getPeople = () => api.get('/api/people');
export const getInstitutes = () => api.get('/api/institutes');
export const getLanguages = () => api.get('/api/languages');
export const getTypes = () => api.get('/api/types');

// Yeni Kişi Ekle (Frontend sadece istek atar, SQL sorgusu yazmaz)
export const addPerson = (personData) => api.post('/api/people', personData);