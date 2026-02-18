CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('internal', 'external')),
  status TEXT NOT NULL DEFAULT 'enabled' CHECK (status IN ('enabled', 'disabled')),
  url TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  icon TEXT,
  build_hook_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT external_tool_requires_url CHECK (type != 'external' OR url IS NOT NULL)
);

CREATE INDEX idx_tools_slug ON public.tools (slug);
CREATE INDEX idx_tools_status ON public.tools (status);
