const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './index.web.js',
  mode: 'development',
  devServer: {
    port: 3000,
    open: true,
    hot: true,
    historyApiFallback: true,
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.web.js', '.js', '.web.ts', '.ts', '.web.tsx', '.tsx', '.json'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-vector-icons': 'react-native-vector-icons/dist',
      'react-native-sqlite-storage': path.resolve(__dirname, 'src/mocks/sqlite.web.js'),
      'react-native-track-player': path.resolve(__dirname, 'src/mocks/trackplayer.web.js'),
      'react-native-fs': path.resolve(__dirname, 'src/mocks/fs.web.js'),
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/mocks/asyncstorage.web.js'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: true,
    }),
  ],
};