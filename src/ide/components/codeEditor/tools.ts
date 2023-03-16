export const getLineAndChByPos = (code: string, pos: number) => {
  const codels = code.slice(0, pos).split('\n');
  return {
    line: codels.length - 1,
    ch: codels[codels.length - 1].length
  };
};
export const getPostByLineAndCh = (code: string, line: number, ch: number): number => {
  const codels = code.split('\n');
  const l = line < codels.length ? line - 1 : codels.length - 1;
  const length = code.split('\n').slice(0, l).reduce((total, linecode) => (total + linecode.length + 1), ch);
  return length > code.length ? code.length : length;
};
