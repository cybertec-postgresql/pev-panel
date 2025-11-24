import type { Configuration } from "webpack";
import { merge } from "webpack-merge";
import grafanaConfig, { type Env } from "./.config/webpack/webpack.config";
import webpack from "webpack";
import { VueLoaderPlugin } from "vue-loader";

const config = async (env: Env): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);

  return merge(baseConfig, {
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: "vue-loader",
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: true,
        __VUE_PROD_DEVTOOLS__: false,
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
      }),
    ],
    resolve: {
      alias: {
        vue: "vue/dist/vue.esm-bundler.js",
      },
    },
  });
};

export default config;
