-- Screenshots are now uploaded only through one-time signed URLs that the server makes after it checks
-- the file. Browsers no longer need their own upload right.
drop policy if exists "authenticated upload screenshots" on storage.objects;

-- Only common raster images. SVG is not allowed, because an SVG at a public address can run script.
update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/gif', 'image/webp']
where id = 'screenshots';
