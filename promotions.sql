-- Add promotion column to menu_items table
ALTER TABLE menu_items 
ADD COLUMN promotion JSONB DEFAULT NULL;

-- Example of how data is stored in the promotion column:
/*
{
  "type": "bundle",
  "quantityRequired": 7,
  "allowFewer": false,
  "options": [
    { "id": "opt-1", "name": "Mango" },
    { "id": "opt-2", "name": "Chocolate" }
  ]
}
*/
