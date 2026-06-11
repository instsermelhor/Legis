import React from 'react';

export interface SocialLink {
  provider: string;
  url: string;
}

interface SocialSlot {
  checked: boolean;
  provider: string;
  url: string;
}

interface SocialLinksEditorProps {
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

const PROVIDER_OPTIONS = [
  'LinkedIn',
  'Instagram',
  'Facebook',
  'Twitter/X',
  'TikTok',
  'YouTube',
  'Outro',
];

function initSlots(links: SocialLink[]): SocialSlot[] {
  const slots: SocialSlot[] = [];
  for (let i = 0; i < 3; i++) {
    if (links[i]) {
      slots.push({ checked: true, provider: links[i].provider, url: links[i].url });
    } else {
      slots.push({ checked: false, provider: 'LinkedIn', url: '' });
    }
  }
  return slots;
}

/**
 * SocialLinksEditor — componente idêntico ao padrão do RegistrationsTab.
 * 3 slots fixos com checkbox + select de rede + campo URL completo.
 * Emite via `onChange` apenas os links ativos com provider e url preenchidos.
 */
const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({ value, onChange }) => {
  const [slots, setSlots] = React.useState<SocialSlot[]>(() => initSlots(value));

  // Sync initial value if parent updates (e.g. after save/reload)
  React.useEffect(() => {
    setSlots(initSlots(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);

  const updateSlots = (next: SocialSlot[]) => {
    setSlots(next);
    const active = next
      .filter(s => s.checked && s.provider.trim() && s.url.trim())
      .map(s => ({ provider: s.provider.trim(), url: s.url.trim() }));
    onChange(active);
  };

  const toggle = (index: number, checked: boolean) => {
    const next = slots.map((s, i) => i === index ? { ...s, checked } : s);
    updateSlots(next);
  };

  const setProvider = (index: number, provider: string) => {
    const next = slots.map((s, i) => i === index ? { ...s, provider } : s);
    updateSlots(next);
  };

  const setUrl = (index: number, url: string) => {
    const next = slots.map((s, i) => i === index ? { ...s, url } : s);
    updateSlots(next);
  };

  return (
    <div className="bg-gray-50 dark:bg-[#1E1B38] border border-gray-200 dark:border-[#2A2545] rounded-xl p-4 space-y-3">
      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          🌐 Redes Sociais (Máx. 3)
        </label>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Ative a caixa de seleção para incluir o link da respectiva rede social no cadastro.
        </p>
      </div>

      <div className="space-y-2.5">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white dark:bg-[#1A1730] border border-gray-200 dark:border-[#2A2545] rounded-xl p-3 shadow-sm"
          >
            {/* Checkbox */}
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={slot.checked}
                onChange={e => toggle(index, e.target.checked)}
                className="rounded text-primary focus:ring-primary/30 h-4 w-4 border-gray-300 dark:border-[#2A2545] dark:bg-[#1A1730]"
              />
              <span className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">
                Link {index + 1}
              </span>
            </label>

            {slot.checked ? (
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Provider Select */}
                <div className="sm:col-span-1">
                  <select
                    value={slot.provider}
                    onChange={e => setProvider(index, e.target.value)}
                    className="w-full border border-gray-300 dark:border-[#2A2545] dark:bg-[#1A1730] dark:text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {PROVIDER_OPTIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                {/* URL Input */}
                <div className="sm:col-span-2">
                  <input
                    type="url"
                    placeholder="URL do Perfil (ex: https://linkedin.com/in/...)"
                    value={slot.url}
                    onChange={e => setUrl(index, e.target.value)}
                    className="w-full border border-gray-300 dark:border-[#2A2545] dark:bg-[#1A1730] dark:text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 text-xs text-gray-400 italic">Link desativado</div>
            )}
          </div>
        ))}
      </div>

      {/* Preview of active links */}
      {slots.some(s => s.checked && s.url.trim()) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {slots
            .filter(s => s.checked && s.url.trim())
            .map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold hover:bg-primary/20 transition-colors"
              >
                🔗 {s.provider}
              </a>
            ))}
        </div>
      )}
    </div>
  );
};

export default SocialLinksEditor;
