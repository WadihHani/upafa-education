
INSERT INTO public.site_content (section_key, content, group_key, content_type) VALUES
  ('facebook_url', 'https://www.facebook.com/share/1GvjsATyLm/', 'social', 'link'),
  ('telegram_url', 'https://t.me/UPAFASY', 'social', 'link'),
  ('youtube_url', 'https://youtube.com/channel/UCps2p2iRMlbta8_kmQPevsg', 'social', 'link'),
  ('linkedin_url', 'https://www.linkedin.com/in/%D8%AC%D8%A7%D9%85%D8%B9%D8%A9-%D8%A3%D9%81%D8%B1%D9%8A%D9%82%D9%8A%D8%A7-%D8%A7%D9%84%D9%81%D8%B1%D9%86%D8%B3%D9%8A%D8%A9-%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9-undefined-81514141a', 'social', 'link'),
  ('whatsapp_number', '+963 989 801 021', 'social', 'text')
ON CONFLICT (section_key) DO UPDATE SET content = EXCLUDED.content, group_key = EXCLUDED.group_key, content_type = EXCLUDED.content_type, updated_at = now();
