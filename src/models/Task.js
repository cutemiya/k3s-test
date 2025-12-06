const db = require('../db');

class Task {
  // Создать задачу
  static async create({ title, description, completed = false, priority = 1 }) {
    const query = `
      INSERT INTO tasks (title, description, completed, priority, created_at, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const values = [title, description, completed, priority];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Получить все задачи
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.completed !== undefined) {
      query += ` AND completed = $${paramCount}`;
      values.push(filters.completed);
      paramCount++;
    }

    if (filters.priority) {
      query += ` AND priority = $${paramCount}`;
      values.push(filters.priority);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';
    
    const result = await db.query(query, values);
    return result.rows;
  }

  // Получить задачу по ID
  static async findById(id) {
    const query = 'SELECT * FROM tasks WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Обновить задачу
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    });

    // Добавляем обновление времени
    fields.push(`updated_at = $${paramCount}`);
    values.push(new Date());
    paramCount++;

    values.push(id);
    
    const query = `
      UPDATE tasks 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Удалить задачу
  static async delete(id) {
    const query = 'DELETE FROM tasks WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Получить статистику
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE completed = true) as completed,
        COUNT(*) FILTER (WHERE completed = false) as pending,
        AVG(priority)::numeric(10,2) as avg_priority
      FROM tasks
    `;
    
    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = Task;