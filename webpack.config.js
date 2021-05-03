const path = require('path');

const buildPath = path.resolve(__dirname, './dist');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  output: {
    filename: 'app.js',
    path: buildPath
  },
  module: {
    rules: [
      {
        test: /\.(frag|vert)/,
        type: 'asset/source'
      },
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js','.html' ]
  },
  devServer: {
    contentBase: buildPath
  }
};
