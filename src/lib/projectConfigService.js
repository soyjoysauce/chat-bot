import { supabase } from './supabase';

const TABLE = 'project_configs';

// Map DB row → app shape
const rowToConfig = (row) => ({
  rules: row.rules ?? [],
  blockers: row.blockers ?? [],
  notes: row.notes ?? '',
  techStack: row.tech_stack ?? [],
  customPrompts: row.custom_prompts ?? {
    component: '',
    functionality: '',
    design: '',
    validation: ''
  }
});

// Map app shape → DB row
const configToRow = (name, config) => ({
  name,
  rules: config.rules ?? [],
  blockers: config.blockers ?? [],
  notes: config.notes ?? '',
  tech_stack: config.techStack ?? [],
  custom_prompts: config.customPrompts ?? {}
});

export const fetchAllConfigs = async () => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data.reduce((acc, row) => {
    acc[row.name] = rowToConfig(row);
    return acc;
  }, {});
};

export const upsertConfig = async (name, config) => {
  const { error } = await supabase
    .from(TABLE)
    .upsert(configToRow(name, config), { onConflict: 'name' });

  if (error) throw error;
};

export const deleteConfig = async (name) => {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('name', name);

  if (error) throw error;
};
