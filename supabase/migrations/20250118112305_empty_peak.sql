/*
  # Installation Standards Data Migration

  1. Data
    - Predefiniowane standardy montażu
    - Materiały dla każdego standardu
    - Koszty robocizny
    - Metody montażu

  2. Changes
    - Bezpieczne wstawianie danych z użyciem aliasów tabel
    - Sprawdzanie istnienia rekordów przed wstawieniem
    - Unikanie konfliktów nazw kolumn
*/

-- Insert predefined standards with existence checks
DO $$ 
DECLARE
  v_warm_id uuid;
  v_standard_id uuid;
  v_insulation_id uuid;
BEGIN
  -- Check if Warm Installation exists
  SELECT id INTO v_warm_id
  FROM installation_standards AS ist
  WHERE ist.name = 'Warm Installation';

  IF v_warm_id IS NULL THEN
    INSERT INTO installation_standards (id, name, description, is_predefined)
    VALUES (
      '06df6f97-867e-4cf6-aff1-1c303e49e95c',
      'Warm Installation',
      'Enhanced thermal insulation installation method suitable for energy-efficient buildings',
      true
    )
    RETURNING id INTO v_warm_id;
  END IF;

  -- Check if Standard Installation exists
  SELECT id INTO v_standard_id
  FROM installation_standards AS ist
  WHERE ist.name = 'Standard Installation';

  IF v_standard_id IS NULL THEN
    INSERT INTO installation_standards (id, name, description, is_predefined)
    VALUES (
      'cd57acc1-68a6-43a9-b1c6-46d97ddf3fde',
      'Standard Installation',
      'Basic installation method suitable for most construction types',
      true
    )
    RETURNING id INTO v_standard_id;
  END IF;

  -- Check if In Insulation Layer exists
  SELECT id INTO v_insulation_id
  FROM installation_standards AS ist
  WHERE ist.name = 'In Insulation Layer';

  IF v_insulation_id IS NULL THEN
    INSERT INTO installation_standards (id, name, description, is_predefined)
    VALUES (
      '461e1f3d-cf01-4129-9a6e-b95b49722570',
      'In Insulation Layer',
      'Installation method optimized for buildings with external insulation systems',
      true
    )
    RETURNING id INTO v_insulation_id;
  END IF;

  -- Insert labor data for each standard if not exists
  INSERT INTO installation_labor (standard_id, hours_per_unit, hourly_rate)
  SELECT v_warm_id, 1.5, 50.00
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_labor AS il WHERE il.standard_id = v_warm_id
  );

  INSERT INTO installation_labor (standard_id, hours_per_unit, hourly_rate)
  SELECT v_standard_id, 1.0, 50.00
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_labor AS il WHERE il.standard_id = v_standard_id
  );

  INSERT INTO installation_labor (standard_id, hours_per_unit, hourly_rate)
  SELECT v_insulation_id, 2.0, 50.00
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_labor AS il WHERE il.standard_id = v_insulation_id
  );

  -- Insert materials for Warm Installation if not exists
  INSERT INTO installation_materials (standard_id, name, quantity_per_meter, unit, unit_price)
  SELECT v_warm_id, 'Taśma rozprężna', 1.0, 'm', 15.00
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_materials AS im 
    WHERE im.standard_id = v_warm_id AND im.name = 'Taśma rozprężna'
  );

  INSERT INTO installation_materials (standard_id, name, quantity_per_meter, unit, unit_price)
  SELECT v_warm_id, 'Folia paroizolacyjna', 1.0, 'm', 8.00
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_materials AS im 
    WHERE im.standard_id = v_warm_id AND im.name = 'Folia paroizolacyjna'
  );

  INSERT INTO installation_materials (standard_id, name, quantity_per_meter, unit, unit_price)
  SELECT v_warm_id, 'Kotwy termiczne', 3.0, 'szt', 12.00
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_materials AS im 
    WHERE im.standard_id = v_warm_id AND im.name = 'Kotwy termiczne'
  );

  -- Insert materials for Standard Installation if not exists
  INSERT INTO installation_materials (standard_id, name, quantity_per_meter, unit, unit_price)
  SELECT v_standard_id, 'Pianka montażowa', 0.25, 'szt', 25.00
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_materials AS im 
    WHERE im.standard_id = v_standard_id AND im.name = 'Pianka montażowa'
  );

  INSERT INTO installation_materials (standard_id, name, quantity_per_meter, unit, unit_price)
  SELECT v_standard_id, 'Kotwy stalowe', 3.0, 'szt', 5.00
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_materials AS im 
    WHERE im.standard_id = v_standard_id AND im.name = 'Kotwy stalowe'
  );

  -- Insert materials for Insulation Layer Installation if not exists
  INSERT INTO installation_materials (standard_id, name, quantity_per_meter, unit, unit_price)
  SELECT v_insulation_id, 'Konsole montażowe', 2.0, 'szt', 45.00
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_materials AS im 
    WHERE im.standard_id = v_insulation_id AND im.name = 'Konsole montażowe'
  );

  INSERT INTO installation_materials (standard_id, name, quantity_per_meter, unit, unit_price)
  SELECT v_insulation_id, 'Taśma rozprężna', 1.0, 'm', 15.00
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_materials AS im 
    WHERE im.standard_id = v_insulation_id AND im.name = 'Taśma rozprężna'
  );

  INSERT INTO installation_materials (standard_id, name, quantity_per_meter, unit, unit_price)
  SELECT v_insulation_id, 'Kotwy chemiczne', 3.0, 'szt', 18.00
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_materials AS im 
    WHERE im.standard_id = v_insulation_id AND im.name = 'Kotwy chemiczne'
  );

  -- Insert methods for each standard if not exists
  INSERT INTO installation_methods (standard_id, name, description)
  SELECT v_warm_id, 'Montaż warstwowy', 'Montaż z zachowaniem ciągłości izolacji termicznej'
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_methods AS im 
    WHERE im.standard_id = v_warm_id AND im.name = 'Montaż warstwowy'
  );

  INSERT INTO installation_methods (standard_id, name, description)
  SELECT v_standard_id, 'Montaż bezpośredni', 'Standardowy montaż na kotwy'
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_methods AS im 
    WHERE im.standard_id = v_standard_id AND im.name = 'Montaż bezpośredni'
  );

  INSERT INTO installation_methods (standard_id, name, description)
  SELECT v_insulation_id, 'Montaż wysunięty', 'Montaż w warstwie izolacji na konsolach'
  WHERE NOT EXISTS (
    SELECT 1 FROM installation_methods AS im 
    WHERE im.standard_id = v_insulation_id AND im.name = 'Montaż wysunięty'
  );
END $$;