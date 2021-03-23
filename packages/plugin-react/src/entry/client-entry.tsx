import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { FeRouteItem, preloadComponent } from 'ssr-client-utils'
import { wrapComponent } from 'ssr-hoc-react'
import { IWindow } from 'ssr-types'
import { App } from './app'

declare const module: any
declare const window: IWindow

const feRoutes: FeRouteItem[] = require('ssr-temporary-routes/route')

const clientRender = async (): Promise<void> => {
  // 客户端渲染||hydrate
  //window.__USE_SSR__只有在服务端渲染的layout组件中会赋值
  const routes = await preloadComponent(feRoutes)
  // 如果是服务端渲染，就用reactdom.hydrate来注水，如果是客户端就完整渲染
  ReactDOM[window.__USE_SSR__ ? 'hydrate' : 'render'](
    <BrowserRouter>
      <App>
        <Switch>
          {
            // 使用高阶组件wrapComponent使得csr首次进入页面以及csr/ssr切换路由时调用getInitialProps
            routes.map((item: FeRouteItem) => {
              const { fetch, component, path } = item
              component.fetch = fetch
              const WrappedComponent = wrapComponent(component)
              return (
                <Route exact={true} key={path} path={path} render={() => <WrappedComponent key={location.pathname}/>}/>
              )
            })
          }
        </Switch>
      </App>
    </BrowserRouter>
    , document.getElementById('app'))
  if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept()
  }
}

export default clientRender()
