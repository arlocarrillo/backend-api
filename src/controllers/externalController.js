const pool = require('../config/db');

const poblarTablaProductos = async (req, res) => {
    const client = await pool.connect();
    try {
        const respuesta = await fetch('https://fakestoreapi.com/products');
        const datos = await respuesta.json();
        
        await client.query('BEGIN'); 

        for (const prod of datos) {
            
            let categoriaId;
            const checkCat = await client.query('SELECT id FROM categorias WHERE nombre = $1', [prod.category]);
            
            if (checkCat.rows.length > 0) {
                categoriaId = checkCat.rows[0].id;
            } else {
                const newCat = await client.query(
                    'INSERT INTO categorias (nombre) VALUES ($1) RETURNING id', 
                    [prod.category]
                );
                categoriaId = newCat.rows[0].id;
            }

            await client.query(
                `INSERT INTO productos (nombre, precio, stock, descripcion, imagen_url, categoria_id) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [prod.title, prod.price, 50, prod.description, prod.image, categoriaId]
            );
        }

        await client.query('COMMIT');
        res.json({ msg: 'Base de datos poblada con éxito' });

    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
};

module.exports = { poblarTablaProductos };