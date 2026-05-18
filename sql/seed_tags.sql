-- 1. Thêm các danh mục cha (Category) vào tag_category
insert into tag_category (name, slug, icon, sort_order) values
  ('Ai',         'ai',         'Bot',        1),
  ('Framework',  'framework',  'Layers',     2),
  ('CSS & UI',   'css-ui',     'Palette',    3),
  ('Tool',       'tool',       'Wrench',     4)
on conflict (slug) do nothing;


-- 2. Thêm các Tag thuộc danh mục 'Ai'
insert into tag (name, category_id)
select t.name, c.id
from (values
  ('MCP'),
  ('Skill')
) as t(name)
cross join (select id from tag_category where slug = 'ai') as c
on conflict (name) do nothing;


-- 3. Thêm các Tag thuộc danh mục 'Framework'
insert into tag (name, category_id)
select t.name, c.id
from (values
  ('React'),
  ('Next.js'),
  ('Nuxt'),
  ('JavaScript')
) as t(name)
cross join (select id from tag_category where slug = 'framework') as c
on conflict (name) do nothing;


-- 4. Thêm các Tag thuộc danh mục 'CSS & UI'
insert into tag (name, category_id)
select t.name, c.id
from (values
  ('Icon'),
  ('Animation'),
  ('Shadcn/ui')
) as t(name)
cross join (select id from tag_category where slug = 'css-ui') as c
on conflict (name) do nothing;


-- 5. Thêm các Tag thuộc danh mục 'Tool'
insert into tag (name, category_id)
select t.name, c.id
from (values
  ('Database')
) as t(name)
cross join (select id from tag_category where slug = 'tool') as c
on conflict (name) do nothing;