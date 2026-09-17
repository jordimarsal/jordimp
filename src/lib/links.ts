const SITE_HOSTS = new Set(['jordimp.net', 'www.jordimp.net']);

export type ExternalLinkAttrs =
  | { readonly target: '_blank'; readonly rel: 'noopener noreferrer' }
  | Record<string, never>;

export function isExternalUrl(href: string, siteOrigin: string): boolean {
  let resolved: URL;
  try {
    resolved = new URL(href, siteOrigin);
  } catch {
    return false;
  }
  const webScheme = resolved.protocol === 'http:' || resolved.protocol === 'https:';
  return webScheme && !SITE_HOSTS.has(resolved.hostname.toLowerCase());
}

export function externalLinkAttrs(href: string, siteOrigin: string): ExternalLinkAttrs {
  return isExternalUrl(href, siteOrigin) ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}
