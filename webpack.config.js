//const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require('constants');
const path = require('path');

module.exports = {
  entry: './client/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './dist'),
    publicPath: ''
  },
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.(png|jpeg|glb|gltf|bin)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  node: {
    fs: "empty"
  }
};