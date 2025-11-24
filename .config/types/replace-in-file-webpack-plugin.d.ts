declare module 'replace-in-file-webpack-plugin' {
  import { Compiler } from 'webpack';
  class ReplaceInFileWebpackPlugin {
    constructor(rules: any[]);
    apply(compiler: Compiler): void;
  }
  export = ReplaceInFileWebpackPlugin;
}
