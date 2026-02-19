-- Add "embedded" tool type and html_content column for baked-in tools
ALTER TABLE public.tools DROP CONSTRAINT tools_type_check;
ALTER TABLE public.tools ADD CONSTRAINT tools_type_check CHECK (type IN ('internal', 'external', 'embedded'));

ALTER TABLE public.tools ADD COLUMN html_content TEXT;

-- Embedded tools must have html_content
ALTER TABLE public.tools ADD CONSTRAINT embedded_tool_requires_content
  CHECK (type != 'embedded' OR html_content IS NOT NULL);
