export default {
  printWidth: 120,
  trailingComma: 'es5',
  bracketSpacing: false,
  singleQuote: true,
  bracketSameLine: true,
  overrides: [
    {
      files: ['*.css', '*.styl'],
      options: {
        parser: 'css',
      },
    },
  ],
};
