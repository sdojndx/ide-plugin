import React, { useCallback, useMemo } from 'react';
import { EditorItem } from '@ide/store/editorStore';
import { useIdeStore } from '@ide/store';
import useAppStore from '@/zx_demo/store';
import { OutlineDetail, OutlineResponse } from '@/zx_demo/store/outlineStore';

export default function StructureItem({
  editor,
  className,
  style
}: {
  editor: EditorItem;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { openEditor } = useIdeStore();
  const { editorOutLine } = useAppStore();
  const outline: OutlineResponse|undefined = useMemo(() => {
    if (editor.id) {
      return editorOutLine[editor.id] || {};
    } else {
      return undefined;
    }
  }, [editor.id, editorOutLine]);
  const editorJump = useCallback((item: OutlineDetail) => {
    const { Line, Ch } = item;
    openEditor({
      path: editor.path,
      name: editor.path.match(/[^/]+$/)?.[0],
      action: {
        Line: Line + 1,
        Ch: Ch + 1,
        type: 'cursor'
      }
    });
  }, [editor]);
  return <div className={`structure_ls ${className}`} style={style}>
    {outline?.funcDecls?.map?.(item => (<div className='func_dec_ls' onClick={(() => editorJump(item))} key={item.Line}>
      <div className='structure_icon' />
      {item.Name}
    </div>))}
    {outline?.structDecls?.map?.(item => (<div className='struct_dec_ls' onClick={(() => editorJump(item))} key={item.Line}>
      <div className='structure_icon' />
      {item.Name}
    </div>))}
  </div>;
}
