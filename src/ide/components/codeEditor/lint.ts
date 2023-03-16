import { linter, Diagnostic } from '@codemirror/lint';
import { EditorItem } from '@ide/store/editorStore';
import { getPostByLineAndCh } from './tools';

export const outLint = (lints: EditorItem['lints']) => {
  return linter(view => {
    const code = view.state.doc.toString() || '';
    const diagnostics: Diagnostic[] = lints
      ? lints.map(item => {
        const pos = getPostByLineAndCh(code, Number(item.lineNo) + 1, 0);
        return {
          from: pos,
          to: pos,
          severity: item.severity,
          message: item.msg
        };
      })
      : [];
    return diagnostics;
  });
};
