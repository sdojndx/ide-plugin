import {
  // Completion,
  CompletionContext,
  CompletionResult
} from '@codemirror/autocomplete';
import { IdeEventListener } from '@ide/types/ideEventListener';
import { getLineAndChByPos } from './tools';
import { EditorItem } from '@ide/store/editorStore';

// let timer: any
export default function autoCompletion({ getAutoComplate, editor }: { getAutoComplate: IdeEventListener['autocomplete'], editor:EditorItem }) {
  return async function completionSource(
    context: CompletionContext
  ): Promise<CompletionResult> {
    // match everything behind the editor cursor position
    const code = context.state.doc.toString();
    const pos = context.pos;
    const checkCode = code.slice(0, pos).match(/\w+$/)?.[0];
    const codeLength = checkCode?.length ? checkCode.length : 0;
    const { line, ch } = getLineAndChByPos(code, pos);
    const res = await getAutoComplate?.(
      editor,
      code,
      line,
      ch
    );
    return {
      // from: word.from,
      // options,
      from: pos - codeLength,
      options: res || [],
      filter: false
    };
  };
}
