import { useEffect, useState } from 'react';

export interface Suggestion {
  text: string;
  type: 'history' | 'search';
  url?: string;
}

const DEBOUNCE_MS = 200;
const MAX_SUGGESTIONS = 8;

/**
 * Debounced search-suggestion source: merges local browser history with Google
 * autocomplete for the current query. Every async path is cancellation-guarded so
 * a slow response from a prior keystroke can't overwrite results for a newer one.
 * Extracted from GoogleSearchWidget so the data-fetching concern is isolated from
 * the widget's input, keyboard-navigation and voice/lens UI.
 */
export function useSearchSuggestions(query: string): Suggestion[] {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const fetchSuggestions = async () => {
      const q = query.trim();

      try {
        let historyResults: Suggestion[] = [];
        if (typeof chrome !== 'undefined' && chrome.history) {
          const historyItems = await new Promise<chrome.history.HistoryItem[]>((resolve) => {
            chrome.history.search({ text: q, maxResults: q ? 5 : MAX_SUGGESTIONS }, resolve);
          });

          historyResults = historyItems
            .map((h): Suggestion => {
              let text = h.title || h.url;
              if (text && text.endsWith(' - Google Search')) {
                text = text.replace(' - Google Search', '');
              }
              return { text: text || h.url || '', type: 'history', url: h.url };
            });

          const seenHistory = new Set<string>();
          historyResults = historyResults.filter((h) => {
            const key = h.text.toLowerCase();
            if (seenHistory.has(key)) return false;
            seenHistory.add(key);
            return true;
          });

          if (q) {
            historyResults = historyResults.filter(h => h.text.toLowerCase().includes(q.toLowerCase()));
          }
        }

        if (cancelled) return;

        if (!q) {
          setSuggestions(historyResults.slice(0, MAX_SUGGESTIONS));
          return;
        }

        if (typeof chrome !== 'undefined' && chrome.runtime) {
          chrome.runtime.sendMessage(
            { action: 'fetchSuggestions', query: q },
            (response: { data?: [string, string[]] }) => {
              if (cancelled) return;
              let autoResults: Suggestion[] = [];
              if (response && response.data && response.data[1]) {
                autoResults = response.data[1].map((text): Suggestion => ({ text, type: 'search' }));
              }

              const combined: Suggestion[] = [...historyResults, ...autoResults];
              const unique: Suggestion[] = [];
              const seen = new Set<string>();
              for (const s of combined) {
                const lower = s.text.toLowerCase();
                if (!seen.has(lower)) {
                  seen.add(lower);
                  unique.push(s);
                }
              }
              setSuggestions(unique.slice(0, MAX_SUGGESTIONS));
            }
          );
        } else {
          const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(q)}`, { signal: controller.signal });
          const data = (await res.json()) as [string, string[]];
          if (!cancelled && data && data[1]) {
            setSuggestions(data[1].slice(0, MAX_SUGGESTIONS).map((text): Suggestion => ({ text, type: 'search' })));
          }
        }
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        console.error('Failed to fetch suggestions', e);
      }
    };

    const timeout = setTimeout(fetchSuggestions, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  return suggestions;
}
