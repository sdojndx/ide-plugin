import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { Button, Form, Select, message, Modal } from 'tea-component';
import useIdeStore from '@ide/store';
import { IdeSetting } from '@ide/store/settingStore';
export default function SetModal() {
  const {
    setting, fontSizes, lineHeights, editorThemes, themes,
    setVisible, setModalVisible, updateIdeSetting
  } = useIdeStore();
  const [fontSize, setFontSize] = useState(setting.font_size);
  const [editorTheme, setEditorTheme] = useState<IdeSetting['setting']['editor_theme']>(setting.editor_theme);
  const [theme, setTheme] = useState(setting.theme);

  // 获取初始化配置
  useEffect(() => {
    setFontSize(setting.editor_font_size);
    setEditorTheme(setting.editor_theme);
    setTheme(setting.theme);
  }, [setting]);

  const close = () => {
    setModalVisible(false);
  };

  const btnDisabled = useMemo(() => {
    return !setting.font_size;
  }, [setting, fontSize, editorTheme, theme]);

  // 确认更改配置
  const changeSetSubmit = useCallback(async () => {
    await updateIdeSetting({
      editor_font_size: fontSize,
      theme,
      editor_theme: editorTheme
    });
    close();
    message.success({
      content: '修改配置成功'
    });
  }, [fontSize, theme, editorTheme, btnDisabled]);

  return (
    <Modal
      maskClosable
      visible={setVisible}
      caption="设置"
      onClose={close}
      size="m"
      className={`${setting.theme}_model`}
      maskStyle={{
        backgroundColor: 'rgba(0,0,0,0.2)'
      }}
    >
      <Modal.Body>
        <Form>
          <Form.Item label="字体大小">
            <Select
              size='full'
              matchButtonWidth
              appearance="button"
              options={fontSizes.map(item => ({ value: item, text: item }))}
              value={fontSize}
              onChange={value => {
                setFontSize(value);
              }}
            />
          </Form.Item>
          <Form.Item label="编辑器主题">
            <Select
              size='full'
              matchButtonWidth
              appearance="button"
              options={editorThemes.map(item => ({ value: item, text: item }))}
              value={editorTheme}
              onChange={value => {
                setEditorTheme(value as IdeSetting['setting']['editor_theme']);
              }}
            />
          </Form.Item>
          <Form.Item label="外观主题">
            <Select
              size='full'
              matchButtonWidth
              appearance="button"
              options={themes.map(item => ({ value: item, text: item }))}
              value={theme}
              onChange={value => {
                setTheme(value);
              }}
            />
          </Form.Item>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button type="primary" disabled={btnDisabled} onClick={changeSetSubmit}>确定</Button>
        <Button type="weak" onClick={close}>
          取消
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
