declare module '*.yaml' {
  const content: unknown;
  export default content;
}

declare module 'locale:all' {
  const locales: Record<string, unknown>;
  export default locales;
}
