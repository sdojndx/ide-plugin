import { StateCreator } from 'zustand';
import theme from '@ide/components/codeEditor/theme';
import { IdeStore } from '.';

/**
 * 全局设置
 */
export interface IdeSetting {
  setting: {
    editor_font_family?: string;
    editor_font_size?: string;
    editor_tab_size?: string;
    editor_theme: keyof typeof theme;
    font_family?: string;
    font_size?: string;
    line_height?: string;
    go_build_args?: string;
    go_format?: string;
    keymap?: string;
    locale?: string;
    theme: string;
    user_id?: number;
    workspace?: string;
  };
  fontSizes: Array<string>;
  lineHeights: Array<string>;
  themes: Array<string>;
  editorThemes: Array<keyof typeof theme>;
}

const initData: IdeSetting = {
  setting: {
    theme: 'dark',
    editor_theme: 'vscodeDark'
  },
  fontSizes: ['12px', '14px', '16px', '18px', '20px', '22px', '24px', '26px', '28px', '30px'],
  lineHeights: ['14px', '16px', '18px', '20px', '22px', '24px', '26px', '28px', '30px', '32px'],
  themes: ['dark'],
  editorThemes: ['abcdef',
    'androidstudio',
    'atomone',
    'aura',
    'bbedit',
    'bespin',
    'darcula',
    'dracula',
    'duotoneDark',
    'duotoneLight',
    'eclipse',
    'githubDark',
    'githubLight',
    'gruvboxDark',
    'gruvboxLight',
    'material',
    'materialDark',
    'materialLight',
    'noctisLilac',
    'nord',
    'okaidia',
    'solarizedDark',
    'solarizedLight',
    'sublime',
    'tokyoNight',
    'tokyoNightDay',
    'tokyoNightStorm',
    'vscodeDark',
    'xcodeDark',
    'xcodeLight']
};
export type IdeSettingStore = IdeSetting & {
  setIdeSetting: (setting: Partial<IdeSetting['setting']>) => void;
  updateIdeSetting: (setting: Partial<IdeSetting['setting']>) => Promise<any>;
};

export const settingStore: StateCreator<IdeSettingStore> = (set, get) => ({
  ...initData,
  setIdeSetting: (setting) => set((state) => ({
    setting: {
      ...state.setting,
      ...setting
    }
  })),
  updateIdeSetting: async (setting) => {
    const stat = get() as IdeStore;
    const newSetting = {
      ...stat.setting,
      ...setting
    };
    await stat.server?.preference?.(newSetting);
    set({
      setting: newSetting
    });
  }
});
