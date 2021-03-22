// 通过使用该HOC使得组件只在客户端进行渲染
import * as React from 'react'
import { useState, useEffect } from 'react'
import { SProps } from 'ssr-types'

type FC = (props: SProps) => JSX.Element
// 只在客户端渲染的高阶组件
function onlyCsr (WrappedComponent: FC): FC {
  return (props: SProps) => {
    const [isClient, setIsClient] = useState(false)
    useEffect(() => {
      setIsClient(true)
    }, [])
    return (
      isClient ? <WrappedComponent {...props}></WrappedComponent> : <div></div>
    )
  }
}

export {
  onlyCsr
}
