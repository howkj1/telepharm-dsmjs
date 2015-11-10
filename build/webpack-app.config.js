require('dotenv/config')

module.exports = {
  devtool: 'inline-source-map',
  entry: {
    app: ['./src/client/startup.js', 'webpack/hot/dev-server']
  },
  output: {
    filename: 'startup.client.js',
    path: './lib/',
    publicPath: process.env.DSM_CDN
  },
  resolve: {
    extensions: ['', '.js', '.html']
  },
  module: {
    loaders: [
      {
        test: /dsmjs[\\\/]src.*\.js$/,
        loader: 'babel-loader?sourceMap'
      },
      {
        test: /dsmjs[\\\/]src.*\.html$/,
        loaders: ['html']
      },
      {
        test: /styles[\\\/]styles\.scss$/,
        loaders: ['style', 'css?sourceMap', 'postcss?sourceMap']
      },
      {
        test: /styles[\\\/]test\.css$/,
        loaders: ['raw', 'css?sourceMap', 'postcss?sourceMap']
      },
      {
        test: /node_modules.*\.css$/,
        loaders: ['style', 'css']
      },
      {
        test: /components.*\.scss$/,
        loaders: ['raw', 'sass?sourceMap']
      },
      {
        test: /\.woff/,
        loader: 'url?limit=10000&minetype=application/font-woff'
      },
      {
        test: /\.(ttf|eot)/,
        loader: 'file'
      },
      {
        test: /\.(jpe?g|png|gif|svg)/,
        loader: 'file'
      }
    ]
  },
  plugins: [],
  postcss: function (webpack) {
    return [
      require('postcss-import')({
        addDependencyTo: webpack
      }),
      require('precss')({
        extension: 'scss'
      }),
      require('postcss-calc'),
      require('postcss-color-function')
    ]
  }
}
