const db = require('../db');

class Offer {
  // Создать предложение
  static async create(offerData) {
    const query = `
      INSERT INTO offers (
        arrival_city, departure_city, arrival_date, departure_date,
        marketing_company, operating_company, base_price, tax_price,
        total_price, currency, flight_number, flight_duration,
        stops, aircraft_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      offerData.arrival,
      offerData.departure,
      offerData.arrivalDate,
      offerData.departureDate,
      offerData.marketingCompany,
      offerData.operatingCompany,
      offerData.price.base,
      offerData.price.tax,
      offerData.price.total,
      offerData.currency || 'USD',
      offerData.flightNumber,
      offerData.flightDuration,
      offerData.stops || 0,
      offerData.aircraftType
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Поиск предложений
  static async search(filters = {}) {
    let query = 'SELECT * FROM offers WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.departure) {
      query += ` AND departure_city ILIKE $${paramCount}`;
      values.push(`%${filters.departure}%`);
      paramCount++;
    }

    if (filters.departureIn && filters.departureIn.length) {
      query += ` AND departure_city = ANY($${paramCount})`;
      values.push(filters.departureIn);
      paramCount++;
    }

    if (filters.arrival) {
      query += ` AND arrival_city ILIKE $${paramCount}`;
      values.push(`%${filters.arrival}%`);
      paramCount++;
    }

    if (filters.departureDate) {
      query += ` AND DATE(departure_date) = $${paramCount}`;
      values.push(filters.departureDate);
      paramCount++;
    }

    if (filters.maxPrice) {
      query += ` AND total_price <= $${paramCount}`;
      values.push(filters.maxPrice);
      paramCount++;
    }

    if (filters.price && filters.price.min !== undefined) {
      query += ` AND total_price >= $${paramCount}`;
      values.push(filters.price.min);
      paramCount++;
    }

    if (filters.price && filters.price.max !== undefined) {
      query += ` AND total_price <= $${paramCount}`;
      values.push(filters.price.max);
      paramCount++;
    }

    if (filters.airline) {
      query += ` AND marketing_company ILIKE $${paramCount}`;
      values.push(`%${filters.airline}%`);
      paramCount++;
    }

    if (filters.maxStops !== undefined) {
      query += ` AND stops <= $${paramCount}`;
      values.push(filters.maxStops);
      paramCount++;
    }

    // Сортировка
    query += ' ORDER BY ';
    if (filters.sortBy === 'price') {
      query += 'total_price ASC';
    } else if (filters.sortBy === 'duration') {
      query += 'flight_duration ASC';
    } else {
      query += 'departure_date ASC';
    }

    // Пагинация
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await db.query(query, values);
    return result.rows;
  }

  // Получить предложение по ID
  static async findById(id) {
    const query = 'SELECT * FROM offers WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Обновить предложение
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'arrival_city', 'departure_city', 'arrival_date', 'departure_date',
      'marketing_company', 'operating_company', 'base_price', 'tax_price',
      'total_price', 'currency', 'flight_number', 'flight_duration',
      'stops', 'aircraft_type'
    ];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    fields.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    paramCount++;

    values.push(id);

    const query = `
      UPDATE offers 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Удалить предложение
  static async delete(id) {
    const query = 'DELETE FROM offers WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Получить статистику
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_offers,
        COUNT(DISTINCT departure_city) as departure_cities,
        COUNT(DISTINCT arrival_city) as arrival_cities,
        COUNT(DISTINCT marketing_company) as airlines,
        MIN(total_price) as min_price,
        MAX(total_price) as max_price,
        AVG(total_price)::numeric(10,2) as avg_price,
        AVG(flight_duration)::numeric(10,2) as avg_duration
      FROM offers
    `;

    const result = await db.query(query);
    return result.rows[0];
  }

  // Получить уникальные города
  static async getCities(type = 'all') {
    let query;
    if (type === 'departure') {
      query = 'SELECT DISTINCT departure_city as city FROM offers ORDER BY city';
    } else if (type === 'arrival') {
      query = 'SELECT DISTINCT arrival_city as city FROM offers ORDER BY city';
    } else {
      query = `
        SELECT DISTINCT city FROM (
          SELECT departure_city as city FROM offers
          UNION
          SELECT arrival_city as city FROM offers
        ) AS cities ORDER BY city
      `;
    }

    const result = await db.query(query);
    return result.rows.map(row => row.city);
  }

  // Получить уникальные авиакомпании
  static async getAirlines() {
    const query = 'SELECT DISTINCT marketing_company as airline FROM offers ORDER BY airline';
    const result = await db.query(query);
    return result.rows.map(row => row.airline);
  }
}

module.exports = Offer;
