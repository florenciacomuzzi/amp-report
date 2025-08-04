import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Demographics, Preferences, Lifestyle } from '../types';
import Property from './Property';
import Analysis from './Analysis';

@Table({
  tableName: 'tenant_profiles',
  timestamps: true
})
export default class TenantProfile extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Property)
  @AllowNull(false)
  @Column(DataType.UUID)
  propertyId!: string;

  @AllowNull(false)
  @Column(DataType.JSON)
  demographics!: Demographics;

  @AllowNull(false)
  @Column(DataType.JSON)
  preferences!: Preferences;

  @AllowNull(false)
  @Column(DataType.JSON)
  lifestyle!: Lifestyle[];

  @AllowNull(false)
  @Column(DataType.FLOAT)
  confidence!: number;

  @Column(DataType.TEXT)
  summary?: string;

  @Column(DataType.JSON)
  conversationHistory?: any[];

  @Column(DataType.STRING)
  generationMethod!: 'chat' | 'questionnaire' | 'manual';

  @BelongsTo(() => Property)
  property!: Property;

  @HasMany(() => Analysis)
  analyses!: Analysis[];
}