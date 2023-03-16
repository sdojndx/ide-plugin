import React, { useCallback } from 'react';
import { EditorItem, OutlineDetail } from '@ide/store/editorStore';
import useIdeStore from '@ide/store';

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
    {editor?.outline?.funcDecls?.map?.(item => (<div className='func_dec_ls' onClick={(() => editorJump(item))} key={item.Line}>
      <div className='structure_icon' />
      {item.Name}
    </div>))}
    {editor?.outline?.structDecls?.map?.(item => (<div className='struct_dec_ls' onClick={(() => editorJump(item))} key={item.Line}>
      <div className='structure_icon' />
      {item.Name}
    </div>))}
  </div>;
}
