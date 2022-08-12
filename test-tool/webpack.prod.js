const webpack = require("webpack");
const { merge } = require('webpack-merge');
const common = require('./webpack.config.js');
const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [
            { source: './*.yaml', destination: './dist' },
          ],
        }
      }
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
});
