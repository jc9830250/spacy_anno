const webpack = require("webpack");

module.exports = {
  publicPath: "/ner-annotator/",
  outputDir: "./docs/",

  pluginOptions: {
    quasar: {
      importStrategy: "kebab",
      rtlSupport: false,
    },
  },
 devServer: {
        disableHostCheck: true,
        socket: 'socket',
        allowedHosts: ['all'],
        host: '0.0.0.0',
        //host: 'spacy-anno.ccstw.nccu.edu.tw',
        port: 80,
        useLocalIp: true,
        public: '0.0.0.0:80',
    },
  configureWebpack: (config) => {
    return {
      plugins: [
        new webpack.DefinePlugin({
          APPLICATION_VERSION: JSON.stringify(
            require("./package.json").version
          ),
        }),
      ],
    };
  },

  transpileDependencies: ["quasar"],
};
