require('ts-node').register({
  project: 'script/tsconfig.json',
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
  },
});
