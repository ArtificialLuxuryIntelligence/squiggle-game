const path = require("path");
const webpack = require("webpack");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  context: path.resolve(__dirname, "src"),
  entry: {
    index: "./scripts/pages/index.js",
    account: "./scripts/pages/account.js",
    admin: "./scripts/pages/admin.js",
    gallery: "./scripts/pages/gallery.js",
    game: "./scripts/pages/game.js",
    play: "./scripts/pages/play.js",
    styles: "./styles/main.scss",
  },
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.scss|css$/,
        exclude: /node_modules/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { reloadAll: true },
          },
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin([{ from: "images", to: "images" }]),
    new MiniCssExtractPlugin({ filename: "[name].css" }),
  ],
};
