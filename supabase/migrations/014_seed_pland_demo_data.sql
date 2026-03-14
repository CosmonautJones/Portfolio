-- Seed demo data for Plan'd
-- Uses a fixed UUID so no real user can modify this data via RLS

DO $$
DECLARE
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  trip_id uuid;
  member_alex uuid;
  member_jordan uuid;
  member_sam uuid;
  member_riley uuid;
  expense_flights uuid;
  expense_hotel uuid;
  expense_food uuid;
  expense_transport uuid;
BEGIN
  -- Create the demo trip
  INSERT INTO pland_trips (user_id, name, destination, description, cover_image_url, start_date, end_date, status)
  VALUES (
    demo_user_id,
    'Tokyo Adventure 2026',
    'Tokyo, Japan',
    'An epic 10-day trip exploring Tokyo — from Shibuya''s neon streets to serene temples, incredible food, and everything in between. Let''s plan the ultimate adventure!',
    NULL,
    '2026-04-01',
    '2026-04-10',
    'planning'
  )
  RETURNING id INTO trip_id;

  -- Members
  INSERT INTO pland_members (trip_id, user_id, name, email, avatar_color)
  VALUES (trip_id, demo_user_id, 'Alex', 'alex@example.com', '#6366f1')
  RETURNING id INTO member_alex;

  INSERT INTO pland_members (trip_id, user_id, name, email, avatar_color)
  VALUES (trip_id, demo_user_id, 'Jordan', 'jordan@example.com', '#f59e0b')
  RETURNING id INTO member_jordan;

  INSERT INTO pland_members (trip_id, user_id, name, email, avatar_color)
  VALUES (trip_id, demo_user_id, 'Sam', 'sam@example.com', '#10b981')
  RETURNING id INTO member_sam;

  INSERT INTO pland_members (trip_id, user_id, name, email, avatar_color)
  VALUES (trip_id, demo_user_id, 'Riley', 'riley@example.com', '#ec4899')
  RETURNING id INTO member_riley;

  -- Itinerary items
  INSERT INTO pland_itinerary_items (trip_id, user_id, date, start_time, end_time, title, description, location, link, category, sort_order) VALUES
  (trip_id, demo_user_id, '2026-04-01', '14:00', '16:00', 'Arrive at Narita Airport', 'Meet at arrivals, take Narita Express to Shinjuku.', 'Narita International Airport', NULL, 'transport', 0),
  (trip_id, demo_user_id, '2026-04-02', '09:00', '12:00', 'Tsukiji Outer Market', 'Fresh sushi breakfast and explore the market stalls.', 'Tsukiji, Chuo City', 'https://www.tsukiji.or.jp/', 'food', 0),
  (trip_id, demo_user_id, '2026-04-02', '14:00', '18:00', 'Shibuya Crossing & Harajuku', 'Walk the famous crossing, explore Takeshita Street.', 'Shibuya', NULL, 'activity', 1),
  (trip_id, demo_user_id, '2026-04-04', '07:00', '20:00', 'Mt. Fuji Day Trip', 'Bus to Fuji Five Lakes area. Bring warm layers!', 'Mt. Fuji', NULL, 'activity', 0),
  (trip_id, demo_user_id, '2026-04-06', '15:00', '19:00', 'teamLab Borderless', 'Digital art museum — book tickets in advance!', 'Azabudai Hills, Minato City', 'https://www.teamlab.art/', 'activity', 0);

  -- Ideas
  INSERT INTO pland_ideas (trip_id, user_id, title, description, link, location, estimated_cost, votes, status) VALUES
  (trip_id, demo_user_id, 'Onsen Day Trip', 'Hakone has amazing hot springs about 90 min from Tokyo. Could be a great rest day.', 'https://www.hakonenavi.jp/en/', 'Hakone', 150.00, 3, 'approved'),
  (trip_id, demo_user_id, 'Robot Restaurant', 'Wild robot-themed dinner show in Shinjuku. Touristy but fun!', NULL, 'Shinjuku', 80.00, 2, 'suggested'),
  (trip_id, demo_user_id, 'Ramen Tour', 'Hit the top 5 ramen shops across different neighborhoods.', NULL, 'Various', 50.00, 4, 'approved'),
  (trip_id, demo_user_id, 'Karaoke Night', 'Book a private karaoke room in Shibuya for the group.', NULL, 'Shibuya', 30.00, 1, 'suggested');

  -- Accommodations
  INSERT INTO pland_accommodations (trip_id, user_id, name, address, check_in, check_out, cost, booking_link, notes) VALUES
  (trip_id, demo_user_id, 'Hotel Gracery Shinjuku', '1-19-1 Kabukicho, Shinjuku', '2026-04-01', '2026-04-06', 850.00, NULL, 'The one with the Godzilla head on the roof! Great location near the station.'),
  (trip_id, demo_user_id, 'Shibuya Airbnb', 'Shibuya-ku, Tokyo', '2026-04-06', '2026-04-10', 600.00, NULL, '2-bedroom apartment, walking distance to Shibuya station. Has a washer.');

  -- Expenses
  INSERT INTO pland_expenses (trip_id, user_id, paid_by_member_id, title, amount, category, date, notes)
  VALUES (trip_id, demo_user_id, member_alex, 'Group Flights (4 tickets)', 3200.00, 'transport', '2026-02-15', 'Booked via Google Flights — non-refundable')
  RETURNING id INTO expense_flights;

  INSERT INTO pland_expenses (trip_id, user_id, paid_by_member_id, title, amount, category, date, notes)
  VALUES (trip_id, demo_user_id, member_jordan, 'Hotel Gracery (5 nights)', 850.00, 'accommodation', '2026-03-01', 'Split 4 ways')
  RETURNING id INTO expense_hotel;

  INSERT INTO pland_expenses (trip_id, user_id, paid_by_member_id, title, amount, category, date, notes)
  VALUES (trip_id, demo_user_id, member_sam, 'Tsukiji Market Breakfast', 120.00, 'food', '2026-04-02', 'Sushi for 4')
  RETURNING id INTO expense_food;

  INSERT INTO pland_expenses (trip_id, user_id, paid_by_member_id, title, amount, category, date, notes)
  VALUES (trip_id, demo_user_id, member_riley, 'Narita Express Tickets', 140.00, 'transport', '2026-04-01', 'Round trip for everyone')
  RETURNING id INTO expense_transport;

  -- Expense splits (even 4-way splits)
  INSERT INTO pland_expense_splits (expense_id, member_id, amount, settled) VALUES
  (expense_flights, member_alex, 800.00, true),
  (expense_flights, member_jordan, 800.00, false),
  (expense_flights, member_sam, 800.00, false),
  (expense_flights, member_riley, 800.00, false),
  (expense_hotel, member_alex, 212.50, false),
  (expense_hotel, member_jordan, 212.50, true),
  (expense_hotel, member_sam, 212.50, false),
  (expense_hotel, member_riley, 212.50, false),
  (expense_food, member_alex, 30.00, false),
  (expense_food, member_jordan, 30.00, false),
  (expense_food, member_sam, 30.00, true),
  (expense_food, member_riley, 30.00, false),
  (expense_transport, member_alex, 35.00, false),
  (expense_transport, member_jordan, 35.00, false),
  (expense_transport, member_sam, 35.00, false),
  (expense_transport, member_riley, 35.00, true);

  -- Messages
  INSERT INTO pland_messages (trip_id, user_id, content, context_type, context_id) VALUES
  (trip_id, demo_user_id, 'Just booked the flights! We''re really doing this!! 🎉', 'general', NULL),
  (trip_id, demo_user_id, 'Found an amazing ramen place near Shinjuku station — adding it to the ideas board.', 'general', NULL),
  (trip_id, demo_user_id, 'Should we do Mt. Fuji on day 4 or day 5? Want to make sure the weather is good.', 'itinerary', NULL);

  -- Gallery
  INSERT INTO pland_gallery (trip_id, user_id, url, caption, date) VALUES
  (trip_id, demo_user_id, 'https://picsum.photos/seed/tokyo1/800/600', 'Shibuya Crossing at night', '2026-04-02'),
  (trip_id, demo_user_id, 'https://picsum.photos/seed/tokyo2/800/600', 'Mt. Fuji from Lake Kawaguchi', '2026-04-04');

END $$;
