import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  BelongsToMany
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Analysis from './Analysis';
import AnalysisAmenity from './AnalysisAmenity';

@Table({
  tableName: 'amenities',
  timestamps: true
})
export default class Amenity extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  category!: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  description!: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  estimatedCostLow!: number;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  estimatedCostHigh!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  implementationTime!: string;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  impactScore!: number;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  popularityScore!: number;

  @Column(DataType.JSON)
  requirements?: string[];

  @Column(DataType.JSON)
  benefits?: string[];

  @Default(true)
  @Column(DataType.BOOLEAN)
  isActive!: boolean;

  @BelongsToMany(() => Analysis, () => AnalysisAmenity)
  analyses!: Analysis[];
}