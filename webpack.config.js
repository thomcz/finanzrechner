const path = require('path');

module.exports = {
  entry: './src/app.js',
  // devtool: 'cheap-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      'finanzrechner': path.resolve(__dirname, "docs/scripts/finanzrechner/index.js"),
    }
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'docs'),
  },
};