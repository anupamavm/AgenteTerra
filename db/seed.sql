-- Development-only sample listings for UI work.
INSERT INTO property_listings (
  title,
  state_region,
  locality,
  land_size_area,
  area_unit,
  road_width_meters,
  price_units,
  currency,
  location,
  is_enriched
)
SELECT sample.title,
  sample.state_region,
  sample.locality,
  sample.land_size_area,
  sample.area_unit,
  sample.road_width_meters,
  sample.price_units,
  sample.currency,
  ST_SetSRID(ST_MakePoint(sample.longitude, sample.latitude), 4326),
  false
FROM (VALUES
  ('Quiet garden plot near the lake', 'Western', 'Battaramulla', 12.5::double precision, 'perches', 6.0::double precision, 18500000::bigint, 'LKR', 79.9187::double precision, 6.8964::double precision),
  ('Wide-frontage family land', 'Western', 'Kaduwela', 2400::double precision, 'sqft', 9.0::double precision, 9200000::bigint, 'LKR', 80.0058::double precision, 6.9362::double precision),
  ('Hill country retreat site', 'Central', 'Kandy', 18::double precision, 'perches', 5.5::double precision, 27500000::bigint, 'LKR', 80.6337::double precision, 7.2906::double precision),
  ('Coastal parcel with access road', 'Southern', 'Weligama', 4200::double precision, 'sqft', 7.5::double precision, 125000::bigint, 'USD', 80.4297::double precision, 5.9736::double precision),
  ('Ready-to-build urban corner', 'Western', 'Maharagama', 8::double precision, 'perches', 10.0::double precision, 14800000::bigint, 'LKR', 79.9265::double precision, 6.8480::double precision),
  ('Open land beside the paddy fields', 'North Western', 'Kurunegala', 1.2::double precision, 'acres', 4.0::double precision, 38000000::bigint, 'LKR', 80.3637::double precision, 7.4863::double precision)
) AS sample(title, state_region, locality, land_size_area, area_unit, road_width_meters, price_units, currency, longitude, latitude)
WHERE NOT EXISTS (
  SELECT 1 FROM property_listings existing WHERE existing.title = sample.title
);