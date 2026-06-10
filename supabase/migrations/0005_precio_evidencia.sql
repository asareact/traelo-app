-- Traelo — Price evidence per item
-- A screenshot showing the product with its current price, so the order keeps
-- proof of what the price was when the admin confirmed/updated it. Per ITEM.
-- The product image (producto_imagen) is also re-hosted in the `productos`
-- bucket on process so the order doesn't depend on the SHEIN CDN link.
-- Run AFTER 0004.

alter table pedido_items
  add column if not exists precio_evidencia_url text;
