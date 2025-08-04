import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  HasMany,
  BelongsTo,
  ForeignKey
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Address, PropertyDetails } from '../types';
import User from './User';
import TenantProfile from './TenantProfile';
import Analysis from './Analysis';

@Table({
  tableName: 'properties',
  timestamps: true
})
export default class Property extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId?: string;

  @AllowNull(false)
  @Column(DataType.JSON)
  address!: Address;

  @AllowNull(false)
  @Column(DataType.JSON)
  details!: PropertyDetails;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  latitude!: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  longitude!: number;

  @Column(DataType.STRING)
  name?: string;

  @Column(DataType.TEXT)
  description?: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @BelongsTo(() => User)
  user?: User;

  @HasMany(() => TenantProfile)
  tenantProfiles!: TenantProfile[];

  @HasMany(() => Analysis)
  analyses!: Analysis[];
}