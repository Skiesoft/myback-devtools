const path = require("path");
const webpack = require("webpack");
const APIMocker = require("api-mocker");
const bodyParser = require("body-parser");

module.exports = {
  entry: "./src/index.js",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      APIMocker.mock(middlewares);
      middlewares.unshift(bodyParser.json());
      return middlewares;
    },
    static: path.join(__dirname, 'public'),
  },
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "dist/"),
    publicPath: "/dist/",
    filename: "bundle.js"
  }
};
