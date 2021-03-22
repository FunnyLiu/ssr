import * as React from 'react'
import { useContext, useEffect } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { FC, Action } from 'ssr-types'

let routerChanged = false

const fetch = async (WrappedComponent: FC, dispatch: React.Dispatch<Action>, props: RouteComponentProps) => {
  //执行请求方法，并拿到结果返回
  const asyncData = WrappedComponent.fetch ? await WrappedComponent.fetch(props) : {}
  await dispatch({
    type: 'updateContext',
    payload: asyncData
  })
}
// HOC 
// 用于在路由切换和csr模式下通过fetch拿到数据给客户端组件
function wrapComponent (WrappedComponent: FC) {
  return withRouter(props => {
    const { dispatch } = useContext(window.STORE_CONTEXT)

    useEffect(() => {
      didMount()
    }, [])

    const didMount = async () => {
      if (routerChanged || !window.__USE_SSR__) {
        // ssr 情况下只有路由切换的时候才需要调用 fetch
        // csr 情况首次访问页面也需要调用 fetch
        // 调用fetch
        await fetch(WrappedComponent, dispatch, props)
      }
      if (!routerChanged) {
        // routerChanged 为 true 代表已经进行过切换路由的操作
        routerChanged = true
      }
    }

    return <WrappedComponent {...props}></WrappedComponent>
  })
}

export {
  wrapComponent
}
