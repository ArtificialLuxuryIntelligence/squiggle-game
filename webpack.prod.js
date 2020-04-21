const path = require("path");
const common = require("./webpack.common");
const merge = require("webpack-merge");
const webpack = require("webpack");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = merge(common, {
  mode: "production",
  //   context: path.resolve(__dirname, "src"),

  plugins: [
    new MinifyPlugin(),
    new MiniCssExtractPlugin({ filename: "[name].css" }),
    new CleanWebpackPlugin(),
  ],
});
