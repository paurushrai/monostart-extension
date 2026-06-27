// Multi-account Google: when several accounts are signed in, a link opens
// whichever account the URL pins via either a `/u/<n>/` path segment
// (mail, drive, calendar, photos, keep, …) or an `authuser=<n>` query param
// (youtube, maps, meet, …). A captured link therefore opens the account that
// happened to be active at capture time — usually NOT the default account.
//
// This forces such links back to the default account (index 0). We only rewrite
// an existing non-zero selector; we never add one, since a URL without a
// selector already resolves to the default account.

const GOOGLE_HOST_SUFFIXES = ['google.com', 'youtube.com'] as const;
const DEFAULT_ACCOUNT_INDEX = '0';
const ACCOUNT_PATH_SEGMENT = /\/u\/\d+(\/|$)/;
const AUTHUSER_PARAM = 'authuser';

const isGoogleHost = (hostname: string): boolean => {
  const host = hostname.toLowerCase();
  return GOOGLE_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
};

export const normalizeGoogleAccountUrl = (rawUrl: string): string => {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  if (!isGoogleHost(parsed.hostname)) return rawUrl;

  parsed.pathname = parsed.pathname.replace(
    ACCOUNT_PATH_SEGMENT,
    `/u/${DEFAULT_ACCOUNT_INDEX}$1`,
  );

  if (parsed.searchParams.has(AUTHUSER_PARAM)) {
    parsed.searchParams.set(AUTHUSER_PARAM, DEFAULT_ACCOUNT_INDEX);
  }

  return parsed.toString();
};
