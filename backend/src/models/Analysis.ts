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
  BelongsToMany
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { MarketInsight, CompetitiveData } from '../types';
import Property from './Property';
import TenantProfile from './TenantProfile';
import Amenity from './Amenity';
import AnalysisAmenity from './AnalysisAmenity';

@Table({
  tableName: 'analyses',
  timestamps: true
})
export default class Analysis extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Property)
  @AllowNull(false)
  @Column(DataType.UUID)
  propertyId!: string;

  @ForeignKey(() => TenantProfile)
  @AllowNull(false)
  @Column(DataType.UUID)
  tenantProfileId!: string;

  @AllowNull(false)
  @Column(DataType.JSON)
  marketInsights!: MarketInsight[];

  @AllowNull(false)
  @Column(DataType.JSON)
  competitiveAnalysis!: CompetitiveData;

  @Column(DataType.TEXT)
  executiveSummary?: string;

  @Column(DataType.TEXT)
  actionPlan?: string;

  @Column(DataType.STRING)
  status!: 'draft' | 'final' | 'archived';

  @BelongsTo(() => Property)
  property!: Property;

  @BelongsTo(() => TenantProfile)
  tenantProfile!: TenantProfile;

  @BelongsToMany(() => Amenity, () => AnalysisAmenity)
  recommendedAmenities!: Amenity[];
}