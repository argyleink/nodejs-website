const path                      = require('path')
const webpack                   = require('webpack')
const HtmlWebpackPlugin         = require('html-webpack-plugin')
const CopyWebpackPlugin         = require('copy-webpack-plugin')
const CleanWebpackPlugin        = require('clean-webpack-plugin')
const MiniCssExtractPlugin      = require("extract-css-chunks-webpack-plugin")

const UglifyJsPlugin            = require('uglifyjs-webpack-plugin')
const OptimizeCSSAssetsPlugin   = require("optimize-css-assets-webpack-plugin")

const PATHS = {
  output: `${__dirname}/public/`,
  src:    `./app`,
  views:  `./app/views/pages/`,
}

const PAGES = require('glob')
  .sync(`${PATHS.views}**/*.jade`)
  .map(item => item.slice(PATHS.views.length, item.length - 5))

const DATA = require('quaff')('./app/data/')

module.exports = {
  entry: PAGES.reduce((entries, entry) => Object.assign(entries, {
    [entry]: path.resolve(__dirname, `${PATHS.views}${entry}.js`)
  }), {}),
  output: {
    path:     PATHS.output,
    filename: '[name].js',
    pathinfo: true
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'app/js'), 
      'node_modules'
    ],
    alias: {
      '~': path.resolve(__dirname, 'app'),
    }
  },
  module: { rules: [
    {
      test:     /\.js$/,
      exclude: /node_modules/,
      use:      [{
        loader: 'babel-loader',
        options: { presets: [
          ['babel-preset-env', {
            targets: {
              browsers: ['chrome > 65']
            },
            modules: false
          }]
        ]}
      }],
    },
    {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader,
        'css-loader',
        'postcss-loader',
      ]
    },
    { 
      test:     /\.jade$/,
      exclude:  /node_modules/,
      loader:   'jade-loader'
    },
  ]},
  plugins: [
    new CleanWebpackPlugin([PATHS.output]),
    ...PAGES.map(page =>
      new HtmlWebpackPlugin({
        filename: `${page}.html`,
        template: `${PATHS.views}${page}.jade`,
        inject:   false,
        page,
        DATA,
        meta: {
          theme: '#83BA63'
        }
      })
    ),
    new MiniCssExtractPlugin({
      filename:       '[name].css',
      chunkFilename:  '[id].css',
    }),
    new CopyWebpackPlugin([{ 
      from: `${PATHS.src}/assets`,
      to:   'assets'
    }]),
  ],
  devServer: { 
    contentBase: PATHS.output,
    stats: {
      colors:   true,
      progress: true,
      modules:  false,
      cached:   false,
      chunk:    false,
      children: false,
      builtAt:  false,
    }
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name:     'common.bundle',
          chunks:   'all',
          enforce:  true,
        },
        // styles: {
        //   name:     'common.bundle',
        //   test:     /\.css$/,
        //   chunks:   'all',
        //   enforce:  true,
        // }
      }
    },
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: true,
          ecma:     7,
          toplevel: false,
          ie8:      false,
          safari10: false,
          output:   { comments: false },
          compress: { dead_code: true, drop_console: true }
        },
        sourceMap: false,
      }),
      new OptimizeCSSAssetsPlugin()
    ]
  },
}