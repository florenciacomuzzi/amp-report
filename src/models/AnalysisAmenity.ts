import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  AllowNull
} from 'sequelize-typescript';
import Analysis from './Analysis';
import Amenity from './Amenity';

@Table({
  tableName: 'analysis_amenities',
  timestamps: false
})
export default class AnalysisAmenity extends Model {
  @ForeignKey(() => Analysis)
  @AllowNull(false)
  @Column(DataType.UUID)
  analysisId!: string;

  @ForeignKey(() => Amenity)
  @AllowNull(false)
  @Column(DataType.UUID)
  amenityId!: string;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  score!: number;

  @AllowNull(false)
  @Column(DataType.TEXT)
  rationale!: string;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  roi!: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  priority!: 'essential' | 'recommended' | 'nice-to-have';
}