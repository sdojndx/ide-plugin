import { keymap, PluginValue, ViewPlugin } from '@codemirror/view';
import { standardKeymap, emacsStyleKeymap, defaultKeymap, insertTab } from '@codemirror/commands';
import { EditorItem } from '@ide/store/editorStore';

interface NewNavigator extends Navigator {
  userAgentData?: any;
}

const ismac = (function () {
  const nav = navigator as NewNavigator;
  const platform = navigator.platform;
  const isIos = (nav.userAgentData && nav.userAgentData.platform === 'macOS') || /macintosh|mac os x/i.test(navigator.userAgent);
  return platform === 'Mac68K' || platform === 'MacPPC' || platform === 'Macintosh' || platform === 'MacIntel' || isIos;
})();
class AltKeyListener implements PluginValue {
  lastMouseMove: MouseEvent | null = null;

  // constructor(private view: EditorView) { }

  update() { }
  destroy() { }
}
function ctrlOrCmdByPlatform(event: any) {
  return ismac ? event.metaKey : event.ctrlKey;
}

export default function keyMap(editor: EditorItem, option?: any) {
  // console.log(standardKeymap)
  const save = () => {
    event?.preventDefault();
    option?.save?.();
    return false;
  };
  const fmt = () => {
    event?.preventDefault();
    option?.save?.(true);
    return false;
  };
  const decl = (event: MouseEvent) => {
    event?.preventDefault();
    option?.decl?.(event);
    return false;
  };
  const close = () => {
    event?.preventDefault();
    option?.close?.();
    return false;
  };
  const keys = keymap.of([
    ...defaultKeymap,
    ...standardKeymap,
    ...emacsStyleKeymap,
    {
      key: 'Tab',
      run: insertTab
    },
    {
      key: 'Ctrl-s',
      run: save
    },
    {
      mac: 'Cmd-s',
      run: save
    },
    {
      key: 'Ctrl-q',
      run: close
    },
    {
      key: 'Cmd-Shift-f',
      run: fmt
    }
  ]);
  if (editor.fileType === 'go') {
    return [ViewPlugin.fromClass(AltKeyListener, {
      eventHandlers: {
        click(event) {
          if (ctrlOrCmdByPlatform(event)) {
            // console.log('decl', event)
            decl(event);
          }
        }
      }
    }), keys];
  }
  return [keys];
}
