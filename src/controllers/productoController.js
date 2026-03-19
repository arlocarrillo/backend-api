const pool = require('../config/db');

const getProductos = async (req, res) => {
    try {
        const query = `
            SELECT p.id, p.nombre, p.precio, p.stock, p.imagen_url, p.descripcion, c.nombre as categoria 
            FROM productos p
            JOIN categorias c ON p.categoria_id = c.id
            ORDER BY p.id ASC
        `;
        const response = await pool.query(query);
        res.json(response.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar productos' });
    }
};

const buscarProductos = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ msg: "Falta término de búsqueda" });

        const query = `
            SELECT p.id, p.nombre, p.precio, p.imagen_url, c.nombre as categoria 
            FROM productos p
            JOIN categorias c ON p.categoria_id = c.id
            WHERE p.nombre ILIKE $1 OR p.descripcion ILIKE $1
        `;
        const response = await pool.query(query, [`%${q}%`]);
        res.json(response.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error en búsqueda' });
    }
};

const getProductoById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT p.*, c.nombre as categoria 
            FROM productos p
            JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = $1
        `;
        const response = await pool.query(query, [id]);
        if (response.rows.length === 0) return res.status(404).json({ msg: "No encontrado" });
        res.json(response.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener producto' });
    }
};

const getProductosPorCategoria = async (req, res) => {
    const { categoria_id } = req.params;
    try {
        const query = `
            SELECT p.id, p.nombre, p.precio, p.imagen_url, c.nombre as categoria
            FROM productos p
            JOIN categorias c ON p.categoria_id = c.id
            WHERE c.id = $1
        `;
        const response = await pool.query(query, [categoria_id]);
        res.json(response.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al filtrar' });
    }
};

const CrearProducto = async (req, res) => {
    const { nombre, precio, stock, imagen_url, descripcion, categoria_id, youtube_id } = req.body;
    try {
        const query = `
            INSERT INTO productos (nombre, precio, stock, imagen_url, descripcion, categoria_id, youtube_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const response = await pool.query(query, [nombre, precio, stock, imagen_url, descripcion, categoria_id, youtube_id]);
        res.status(201).json(response.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear producto' });
    }
};

module.exports = { 
    getProductos, 
    buscarProductos, 
    getProductoById, 
    getProductosPorCategoria,
    CrearProducto
};