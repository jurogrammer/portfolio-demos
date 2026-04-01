import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '..');

const config = {
  source: [
    path.join(ROOT, 'tokens/primitive/**/*.json'),
    path.join(ROOT, 'tokens/semantic/**/*.json'),
  ],
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: path.join(ROOT, 'build/css/'),
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
          },
        },
      ],
    },
    scss: {
      transformGroup: 'scss',
      buildPath: path.join(ROOT, 'build/scss/'),
      files: [
        {
          destination: 'variables.scss',
          format: 'scss/variables',
        },
      ],
    },
    ts: {
      transformGroup: 'js',
      buildPath: path.join(ROOT, 'build/ts/'),
      files: [
        {
          destination: 'variables.js',
          format: 'javascript/es6',
        },
      ],
    },
  },
};

export default config;
