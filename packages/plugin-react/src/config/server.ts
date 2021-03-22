import { join } from 'path'
import * as webpack from 'webpack'
import { loadConfig, getLocalNodeModules, nodeExternals } from 'ssr-server-utils'
import * as WebpackChain from 'webpack-chain'
import { getBaseConfig } from './base'

const loadModule = require.resolve

const getServerWebpack = (chain: WebpackChain) => {
  const config = loadConfig()
  const { isDev, cwd, getOutput, chainServerConfig, whiteList, chunkName } = config
  getBaseConfig(chain)
  chain.devtool(isDev ? 'eval-source-map' : false)
  // 服务端打包特殊设置，node，从而在node端引入前端组件模块等等。
  chain.target('node')
  chain.entry(chunkName)
    .add(loadModule('../entry/server-entry'))
    .end()
    .output
    .path(getOutput().serverOutPut)
    .filename('[name].server.js')
    .libraryTarget('commonjs')

  const modulesDir = [join(cwd, './node_modules')]
  if (isDev) {
    modulesDir.push(getLocalNodeModules())
  }
  // 排除后端node_modules的打包
  chain.externals(nodeExternals({
    whitelist: [/\.(css|less|sass|scss)$/, /ssr-temporary-routes/, /^antd.*?css/].concat(whiteList || []),
    // externals Dir contains example/xxx/node_modules ssr/node_modules
    modulesDir
  }))

  chain.when(isDev, () => {
    chain.watch(true)
  })

  chain.plugin('define').use(webpack.DefinePlugin, [{
    __isBrowser__: false
  }])

  chainServerConfig(chain) // 合并用户自定义配置

  return chain.toConfig()
}

export {
  getServerWebpack
}
