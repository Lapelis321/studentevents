import pool from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'worker' | 'user';
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'worker' | 'user';
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<User> {
    const { name, email, password, role = 'user' } = userData;
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at
    `;

    const result = await pool.query(query, [name, email, hashedPassword, role]);
    return result.rows[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const query = 'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findAll(): Promise<User[]> {
    const query = 'SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findByRole(role: string): Promise<User[]> {
    const query = 'SELECT id, name, email, role, created_at, updated_at FROM users WHERE role = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [role]);
    return result.rows;
  }

  static async updateRole(id: number, role: 'admin' | 'worker' | 'user'): Promise<User | null> {
    const query = `
      UPDATE users 
      SET role = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, name, email, role, created_at, updated_at
    `;
    const result = await pool.query(query, [role, id]);
    return result.rows[0] || null;
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    const query = 'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    const result = await pool.query(query, [hashedPassword, id]);
    return (result.rowCount || 0) > 0;
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount || 0) > 0;
  }

  static async emailExists(email: string): Promise<boolean> {
    const query = 'SELECT 1 FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  }
}
