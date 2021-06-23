import path from "path"
import webpack from "webpack"
import HtmlWebpackPlugin from "html-webpack-plugin"
import TerserPlugin from "terser-webpack-plugin"

function resolveRoot(...paths: string[]) {
  return path.resolve(...paths)
}

function resolveSrc(...paths: string[]) {
  return resolveRoot("src", ...paths)
}

const Paths = {
  Root: resolveRoot(),
  Src: resolveSrc(),
  Dist: resolveRoot("dist"),
  Node_Modules: resolveRoot("node_modules"),
}

const cssLoader = [
  "style-loader",
  "css-loader",
]

const cssModuleLoader = [
  "style-loader",
  {
    loader: "css-loader",
    options: {
      modules: {
        localIdentName: "[local]_[hash:base64:5]",
        exportLocalsConvention: "camelCase",
      },
    }
  },
]

const webapckConfig: webpack.Configuration = {
  mode: "production",
  devtool: false,
  // 使输出更精简
  stats: "errors-warnings",
  entry: {
    popup: resolveSrc("popup.tsx"),
  },
  output: {
    path: Paths.Dist,
    filename: "packages/scripts/[name].js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolveRoot("public/index.html"),
      filename: "packages/docs/popup.html",
      title: "popup",
      inject: "body",
      chunks: ["popup"],
    }),
    new webpack.WatchIgnorePlugin({
      paths: [
        /\.d\.ts$/,
      ],
    }),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "@Src": Paths.Src,
    }
  },
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        include: [
          Paths.Src,
        ],
        use: [
          "babel-loader",
          {
            loader: "ts-loader",
            options: {
              // 开发时无需类型检查(编辑器会提示)
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        // 这儿不能用 include, 因为 node_modules 中的包也需要 loader
        use: cssLoader,
      },
      {
        test: /(?<!\.module)\.less$/,
        include: Paths.Src,
        use: cssLoader,
      },
      {
        test: /\.module\.less$/,
        include: Paths.Src,
        use: cssModuleLoader,
      },
      {
        test: /\.(png|jpg|jpeg|gif|ico)(\?.*)?$/i,
        include: Paths.Src,
        use: [{
          loader: "url-loader",
          options: {
            limit: 8192,
            name: "packages/images/[name].[hash:5].[ext]"
          }
        }]
      },
      {
        test: /\.(otf|eot|svg|ttf|woff)(\?.*)?$/i,
        include: Paths.Src,
        use: [{
          loader: "url-loader",
          options: {
            limit: 8192,
            name: "packages/fonts/[name].[hash:5].[ext]"
          }
        }]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i,
        include: Paths.Src,
        loader: "url-loader",
        options: {
          limit: 8192,
          name: "packages/medias/[name].[hash:5].[ext]" // 文件名
        }
      },
    ]
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true, // 开启并行压缩，充分利用 cpu
        extractComments: false, // 不保留 @license @preserve 等信息
        terserOptions: {
          compress: {
            unused: true,
            drop_debugger: true,
          },
          output: {
            comments: false, // 移除注释
          },
          sourceMap: false, // 不保留 sourceMap
        }
      }),
    ],
  }
}

const swConfig: webpack.Configuration = {
  mode: "production",
  devtool: false,
  // 使输出更精简
  stats: "errors-warnings",
  entry: {
    "service-worker": resolveSrc("service-worker.ts"),
  },
  output: {
    path: resolveRoot(),
    filename: "[name].js",
  },
  plugins: [
    new webpack.WatchIgnorePlugin({
      paths: [
        /\.d\.ts$/,
      ],
    }),
  ],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "@Src": Paths.Src,
    }
  },
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        include: [
          Paths.Src,
        ],
        use: [
          "babel-loader",
          {
            loader: "ts-loader",
            options: {
              // 开发时无需类型检查(编辑器会提示)
              transpileOnly: true,
            },
          },
        ],
      },
    ]
  }
}

export default [webapckConfig, swConfig]
