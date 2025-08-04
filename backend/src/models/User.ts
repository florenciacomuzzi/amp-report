import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  HasMany,
  BeforeCreate,
  BeforeUpdate
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import Property from './Property';

@Table({
  tableName: 'users',
  timestamps: true
})
export default class User extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare firstName: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare lastName: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare password: string;

  @Column(DataType.STRING)
  declare company?: string;

  @Column(DataType.STRING)
  declare phone?: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isVerified: boolean;

  @Column(DataType.DATE)
  declare lastLoginAt?: Date;

  @HasMany(() => Property)
  properties!: Property[];

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed('password') && user.getDataValue('password')) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.getDataValue('password'), salt);
      user.setDataValue('password', hashedPassword);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    const hashedPassword = this.getDataValue('password');
    console.log('Validating password:', { hashedPassword: !!hashedPassword, inputPassword: !!password });
    if (!hashedPassword) {
      throw new Error('No hashed password found for user');
    }
    return bcrypt.compare(password, hashedPassword);
  }
}