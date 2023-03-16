import {
  // Completion,
  CompletionContext,
  CompletionResult
} from '@codemirror/autocomplete';
import { AutocomplateRequest } from '@ide/types/ideServer';
import { getLineAndChByPos } from './tools';

// let timer: any
export default function autoCompletion({ getAutoComplate, path }: { getAutoComplate: (param: AutocomplateRequest) => Promise<any>, path: string }) {
  return async function completionSource(
    context: CompletionContext
  ): Promise<CompletionResult> {
    // match everything behind the editor cursor position
    const code = context.state.doc.toString();
    const pos = context.pos;
    const checkCode = code.slice(0, pos).match(/\w+$/)?.[0];
    const codeLength = checkCode?.length ? checkCode.length : 0;
    const { line, ch } = getLineAndChByPos(code, pos);
    const res = await getAutoComplate({
      path,
      code,
      cursorLine: line,
      cursorCh: ch
    });
    return {
      // from: word.from,
      // options,
      from: pos - codeLength,
      options: res,
      filter: false
    };
  };
}
