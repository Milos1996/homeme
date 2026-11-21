/**
 * Where a figure comes from.
 * - `verified`: read directly from an authoritative source (e.g. a dimensioned unit plan).
 * - `estimated`: inferred, scaled from a drawing, or invented for demo data.
 *
 * Rule: the UI must never present an `estimated` value as `verified`.
 */
export type Provenance = "verified" | "estimated";

export type LengthUnit = "m";
export type AreaUnit = "m2";
export type MeasureUnit = LengthUnit | AreaUnit;

/** A measured quantity that always carries its provenance. */
export interface Dimension<TUnit extends MeasureUnit = LengthUnit> {
  readonly value: number;
  readonly unit: TUnit;
  readonly provenance: Provenance;
  /** Optional note on where the value comes from, e.g. "Unit plan A-102, sheet 3". */
  readonly source?: string;
}

export type Length = Dimension<LengthUnit>;
export type Area = Dimension<AreaUnit>;
