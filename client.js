/**
 * Client half of the Scratchpad bundle.
 *
 * Adds one entry to the left sidebar panel list (`sidebar.panellist`, id
 * "scratchpad"). The sidebar owns the button chrome and selects the matching
 * central panel by id; the panel itself is registered in the `main` keyed slot
 * under the same key. Notes are kept in this browser only.
 */
window.__ModuleLoader__.load({
  id: '@local/sidebar-scratchpad',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const PANEL_KEY = 'scratchpad';
    const ENTRY_ORDER = 20;
    const NS = 'sidebar-scratchpad';
    const STORAGE_KEY = 'dsh.sidebar-scratchpad.notes.v1';

    const EN = {
      'entry.label': 'Scratchpad',
      'panel.title': 'Scratchpad',
      'panel.subtitle': 'A quick place for notes. They stay in this browser and never leave this device.',
      'editor.placeholder': 'Write something down…',
      'editor.clear': 'Clear',
      'editor.saved': 'Saved in this browser',
      'editor.memoryOnly': 'Kept for this page only — local storage is unavailable',
      'editor.count': '{count} characters',
    };
    const ZH = {
      'entry.label': '随手便签',
      'panel.title': '随手便签',
      'panel.subtitle': '随手记下想法。内容只保存在当前浏览器，不会上传。',
      'editor.placeholder': '写点什么…',
      'editor.clear': '清空',
      'editor.saved': '已保存在当前浏览器',
      'editor.memoryOnly': '仅保留在本页 — 本地存储不可用',
      'editor.count': '{count} 个字符',
    };

    const STYLE = {
      root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: 'var(--dsw-alias-bg-base)',
        color: 'var(--dsw-alias-label-primary)',
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flex: 'none',
        padding: '14px 20px',
        borderBottom: '1px solid var(--dsw-alias-border-l1)',
      },
      headerIcon: {
        display: 'flex',
        alignItems: 'center',
        flex: 'none',
        color: 'var(--dsw-alias-brand-primary)',
      },
      title: {
        margin: 0,
        fontSize: 15,
        fontWeight: 600,
        lineHeight: 1.4,
        color: 'var(--dsw-alias-label-primary)',
      },
      body: {
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
      },
      inner: {
        width: '100%',
        maxWidth: 820,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        flex: 1,
        minHeight: 0,
      },
      subtitle: {
        margin: 0,
        fontSize: 13,
        lineHeight: 1.55,
        color: 'var(--dsw-alias-label-secondary)',
      },
      editor: {
        flex: 1,
        minHeight: 220,
        width: '100%',
        boxSizing: 'border-box',
        resize: 'none',
        padding: '12px 14px',
        borderRadius: 10,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        color: 'var(--dsw-alias-label-primary)',
        font: 'inherit',
        fontSize: 14,
        lineHeight: 1.65,
        outline: 'none',
      },
      footer: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: 'none',
        padding: '10px 20px',
        borderTop: '1px solid var(--dsw-alias-border-l1)',
        fontSize: 12,
        lineHeight: 1.4,
        color: 'var(--dsw-alias-label-secondary)',
      },
      statusDot: {
        width: 6,
        height: 6,
        borderRadius: '50%',
        flex: 'none',
        background: 'var(--dsw-alias-state-success-primary)',
      },
      count: {
        marginLeft: 'auto',
        fontVariantNumeric: 'tabular-nums',
      },
      button: {
        appearance: 'none',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'transparent',
        color: 'var(--dsw-alias-label-secondary)',
        font: 'inherit',
        fontSize: 12,
        lineHeight: 1.4,
        padding: '5px 12px',
        marginLeft: 'auto',
        borderRadius: 8,
        cursor: 'pointer',
      },
      buttonHover: {
        background: 'var(--dsw-alias-bg-layer-2)',
        color: 'var(--dsw-alias-label-primary)',
      },
      buttonDisabled: {
        opacity: 0.45,
        cursor: 'default',
      },
    };

    function readNotes() {
      try {
        return window.localStorage.getItem(STORAGE_KEY) || '';
      } catch (_) {
        return '';
      }
    }

    function probeStorage() {
      try {
        const probe = STORAGE_KEY + '.probe';
        window.localStorage.setItem(probe, '1');
        window.localStorage.removeItem(probe);
        return true;
      } catch (_) {
        return false;
      }
    }

    function writeNotes(value) {
      try {
        if (value) window.localStorage.setItem(STORAGE_KEY, value);
        else window.localStorage.removeItem(STORAGE_KEY);
        return true;
      } catch (_) {
        return false;
      }
    }

    function dictFor(localeId) {
      return /^zh/i.test(String(localeId)) ? ZH : EN;
    }

    /**
     * Register this plugin's dictionary through the Client locale service and
     * return a translate function that follows the active locale. Falls back to
     * English when the locale service is unavailable.
     */
    function makeI18n(locale) {
      const disposers = [];
      const registered = new Set();
      const fallback = (key) => (Object.prototype.hasOwnProperty.call(EN, key) ? EN[key] : key);
      let translate = fallback;

      if (locale) {
        try {
          const registerKnownLocales = () => {
            let snapshot = null;
            try {
              snapshot = locale.getLocale();
            } catch (_) {
              return;
            }
            const definitions = snapshot && Array.isArray(snapshot.locales) ? snapshot.locales : [];
            for (const definition of definitions) {
              const id = definition && definition.id;
              if (!id || registered.has(id)) continue;
              try {
                disposers.push(locale.register(NS, id, dictFor(id)));
                registered.add(id);
              } catch (_) {
                // A locale the service rejects stays on the English fallback.
              }
            }
          };

          registerKnownLocales();
          disposers.push(locale.subscribe(registerKnownLocales));
          translate = locale.bind(NS);
        } catch (_) {
          translate = fallback;
        }
      }

      const t = (key) => {
        let value;
        try {
          value = translate(key);
        } catch (_) {
          value = undefined;
        }
        if (value === undefined || value === null || value === '' || value === key) {
          return fallback(key);
        }
        return value;
      };

      return {
        t,
        dispose() {
          for (const disposer of disposers) {
            try {
              disposer();
            } catch (_) {
              // Ignore disposal races with the locale service.
            }
          }
          registered.clear();
        },
      };
    }

    /** The note glyph used by both the sidebar cell and the panel header. */
    function NoteGlyph(props) {
      const size = typeof props.size === 'number' && props.size > 0 ? props.size : 18;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: props.active ? 1.9 : 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
          focusable: 'false',
          style: { display: 'block', flex: 'none' },
        },
        h('path', {
          d: 'M6.2 3.5H14L19.5 9v10.1a1.4 1.4 0 0 1-1.4 1.4H6.2a1.4 1.4 0 0 1-1.4-1.4V4.9a1.4 1.4 0 0 1 1.4-1.4Z',
        }),
        h('path', { d: 'M14 3.5V9h5.5' }),
        h('path', { d: 'M8.5 13h7.5' }),
        h('path', { d: 'M8.5 16.8h5' }),
      );
    }

    /** Content cell of one `sidebar.panellist` entry; the sidebar owns the button. */
    function SidebarEntry(props) {
      return h(NoteGlyph, { size: props.size, active: props.active });
    }

    /** Re-render when the locale snapshot changes (active language or dictionary). */
    function useLocaleRevision(locale) {
      const [, forceUpdate] = React.useState(0);
      React.useEffect(() => {
        if (!locale || typeof locale.subscribe !== 'function') return undefined;
        let off;
        try {
          off = locale.subscribe(() => forceUpdate((value) => value + 1));
        } catch (_) {
          return undefined;
        }
        return () => {
          if (typeof off === 'function') off();
        };
      }, [locale]);
    }

    function ScratchpadPanel(props) {
      const t = props.t;
      const [text, setText] = React.useState(readNotes);
      const [persisted, setPersisted] = React.useState(probeStorage);
      const [editorFocused, setEditorFocused] = React.useState(false);
      const [clearHovered, setClearHovered] = React.useState(false);

      React.useEffect(() => {
        if (!persisted) return;
        if (!writeNotes(text)) setPersisted(false);
      }, [text, persisted]);

      const editorStyle = editorFocused
        ? Object.assign({}, STYLE.editor, { borderColor: 'var(--dsw-alias-brand-primary)' })
        : STYLE.editor;

      const clearStyle = Object.assign(
        {},
        STYLE.button,
        text ? null : STYLE.buttonDisabled,
        clearHovered && text ? STYLE.buttonHover : null,
      );

      return h(
        'section',
        { style: STYLE.root, 'aria-label': t('panel.title') },
        h(
          'header',
          { style: STYLE.header },
          h('span', { style: STYLE.headerIcon, 'aria-hidden': 'true' }, h(NoteGlyph, { size: 18 })),
          h('h1', { style: STYLE.title }, t('panel.title')),
          h(
            'button',
            {
              type: 'button',
              style: clearStyle,
              disabled: !text,
              onClick: () => setText(''),
              onMouseEnter: () => setClearHovered(true),
              onMouseLeave: () => setClearHovered(false),
            },
            t('editor.clear'),
          ),
        ),
        h(
          'div',
          { style: STYLE.body },
          h(
            'div',
            { style: STYLE.inner },
            h('p', { style: STYLE.subtitle }, t('panel.subtitle')),
            h('textarea', {
              style: editorStyle,
              value: text,
              placeholder: t('editor.placeholder'),
              spellCheck: false,
              'aria-label': t('panel.title'),
              onChange: (event) => setText(event.target.value),
              onFocus: () => setEditorFocused(true),
              onBlur: () => setEditorFocused(false),
            }),
          ),
        ),
        h(
          'footer',
          { style: STYLE.footer },
          persisted ? h('span', { style: STYLE.statusDot, 'aria-hidden': 'true' }) : null,
          h('span', null, t(persisted ? 'editor.saved' : 'editor.memoryOnly')),
          h(
            'span',
            { style: STYLE.count },
            t('editor.count').replace('{count}', String(text.length)),
          ),
        ),
      );
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        const locale = ctx.get('locale');
        const i18n = makeI18n(locale);
        ctx.effect(() => () => i18n.dispose(), 'sidebar-scratchpad i18n');

        function Panel() {
          useLocaleRevision(locale);
          return h(ScratchpadPanel, { t: i18n.t });
        }

        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            {
              name: 'sidebar.panellist',
              id: PANEL_KEY,
              order: ENTRY_ORDER,
              label: () => i18n.t('entry.label'),
            },
            SidebarEntry,
          ),
        );

        ctx.slots.inject('main', () =>
          ctx.slots.register(
            {
              name: 'main',
              key: PANEL_KEY,
            },
            Panel,
          ),
        );
      },
    };
  },
});
