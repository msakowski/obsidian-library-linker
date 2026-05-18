export function createSettingGroup(
  parent: HTMLElement,
  title?: string,
  description?: string,
): HTMLElement {
  const group = parent.createDiv({ cls: 'setting-group' });
  if (title) {
    const heading = group.createDiv({ cls: 'setting-item setting-item-heading' });
    heading.createDiv({ cls: 'setting-item-name', text: title });
    if (description) {
      heading.createDiv({ cls: 'setting-item-description', text: description });
    }
  }
  return group.createDiv({ cls: 'setting-items' });
}
