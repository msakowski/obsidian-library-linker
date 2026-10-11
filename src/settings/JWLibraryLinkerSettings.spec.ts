import { afterEach, describe, expect, test, vi } from 'vitest';
import { App, Setting } from 'obsidian';
import type { SettingDefinition, SettingDefinitionGroup, ToggleComponent } from 'obsidian';
import JWLibraryLinkerPlugin, { DEFAULT_SETTINGS } from '@/main';
import { TranslationService } from '@/services/TranslationService';
import { JWLibraryLinkerSettings } from './JWLibraryLinkerSettings';

afterEach((): void => {
  vi.restoreAllMocks();
});

async function createTab(): Promise<JWLibraryLinkerSettings> {
  const app = new App();
  const plugin = new JWLibraryLinkerPlugin(app, {
    id: 'jw-library-linker',
    name: 'JW Library Linker',
    version: '0.16.2',
    minAppVersion: '1.13.0',
    description: '',
    author: '',
  });
  plugin.settings = structuredClone(DEFAULT_SETTINGS);
  const translations = new TranslationService();
  await translations.initialize('en');
  vi.spyOn(plugin, 'getTranslationService').mockReturnValue(translations);
  return new JWLibraryLinkerSettings(app, plugin);
}

function getGroups(tab: JWLibraryLinkerSettings): SettingDefinitionGroup[] {
  return tab
    .getSettingDefinitions()
    .filter((item): item is SettingDefinitionGroup => 'type' in item && item.type === 'group');
}

function findDefinition(tab: JWLibraryLinkerSettings, name: string): SettingDefinition {
  const definition = getGroups(tab)
    .flatMap((group) => group.items ?? [])
    .find((item): item is SettingDefinition => 'name' in item && item.name === name);
  if (!definition) throw new Error(`Missing definition: ${name}`);
  return definition;
}

describe('searchable settings', (): void => {
  test('indexes every setting without rendering or reading the offline repository', async (): Promise<void> => {
    const tab = await createTab();
    const repository = vi.spyOn(tab.plugin, 'getOfflineBibleRepository');
    const groups = getGroups(tab);
    expect(groups.map((group) => group.items?.length)).toEqual([5, 8, 3, 5]);
    expect(
      groups.flatMap((group) => group.items ?? []).map((item) => ('name' in item ? item.name : '')),
    ).toEqual([
      'Language',
      'Open links automatically',
      'Keep link text',
      'Create links language independent',
      'Reconvert existing links',
      'Link text length',
      'Prefix outside link',
      'Prefix inside link',
      'Suffix inside link',
      'Suffix outside link',
      'Font style',
      'Style presets',
      'Link preview',
      'Quote template',
      'Template presets',
      'Bible quote preview',
      'Enable offline Bible',
      'Prefer offline quotes',
      'Allow online fallback',
      'Offline Bible actions',
      'Installed offline Bibles',
    ]);
    expect(findDefinition(tab, 'Quote template').desc).toContain('{quote}');
    expect(repository).not.toHaveBeenCalled();
  });

  test('rebuilds search labels when the UI locale changes', async (): Promise<void> => {
    const tab = await createTab();
    await tab.plugin.getTranslationService().setLocale('de');
    expect(getGroups(tab)[0]?.items?.[0]).toMatchObject({ name: tab.t('settings.language.name') });
    expect(tab.t('settings.language.name')).not.toBe('Language');
  });

  test.each([
    { name: 'Allow online fallback', key: 'allowOnlineFallback', refreshes: false },
    { name: 'Prefer offline quotes', key: 'preferOffline', refreshes: true },
  ] as const)(
    'preserves disabled $name and persists changes',
    async ({ name, key, refreshes }): Promise<void> => {
      const tab = await createTab();
      tab.plugin.settings.offlineBible.enabled = false;
      const save = vi.spyOn(tab.plugin, 'saveSettings').mockResolvedValue();
      const update = vi.fn();
      tab.update = update;
      let change: ((value: boolean) => void | Promise<void>) | undefined;
      const toggle = {
        setValue: vi.fn().mockReturnThis(),
        setDisabled: vi.fn().mockReturnThis(),
        onChange: vi.fn((callback: (value: boolean) => void | Promise<void>) => {
          change = callback;
          return toggle;
        }),
      };
      const setting = new Setting(document.createElement('div'));
      vi.spyOn(setting, 'addToggle').mockImplementation((callback) => {
        callback(toggle as unknown as ToggleComponent);
        return setting;
      });
      const definition = findDefinition(tab, name);
      const group = { listEl: document.createElement('div') };
      if (!definition.render) throw new Error('Expected custom control renderer');
      definition.render(setting, group as unknown as import('obsidian').SettingGroup);
      expect(toggle.setDisabled).toHaveBeenCalledWith(true);
      await change?.(false);
      expect(tab.plugin.settings.offlineBible[key]).toBe(false);
      expect(save).toHaveBeenCalledOnce();
      expect(update).toHaveBeenCalledTimes(refreshes ? 1 : 0);
    },
  );
});
