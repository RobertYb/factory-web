<%_ if (project.features.graphql) { _%>
# fbi-template-react react+graphql 模版说明
<%_ } _%>

<%_ if (project.features.openapi) { _%>
# fbi-template-react react+openapi 模版说明
<%_ } _%>
## 依赖

- [fbi](https://github.com/fbi-js/fbi)
- [fbi/factory-web](https://github.com/fbi-js/fbi)

## 特性

- 使用[CRA-CLI](https://create-react-app.dev/) eject 作为基础模版
<%_ if (project.features.graphql) { _%> 
- 将 typescript+react+react-router-dom+graphql 作为基础库
- 已经集成[graphql-codegen](https://github.com/dotansimha/graphql-code-generator)，根据 graphql 自动生成对应 apollo-client+react-hooks+typescript 代码
<%_ } _%>
<%_ if (project.features.graphql) { _%> 
- 使用[pont](https://github.com/alibaba/pont)作为pont工具
<%_ } _%>
- 将 react-scripts 的开发和构建集成到 fbi 的 factory-web 中，隔离起来，统一管理与维护
- eslint+prettier+husky+lint-staged 完善开发体验 保证代码风格和质量

## 开始

```shell
1. npm install
## 开启服务
2. npm run start
## 开启graphql-codegen 自动化生成和watch
3. npm run gql-codegen
```

## 说明

- 所有项目相关的 gql 都需要放在`src/graphql`文件夹下面，具体可查看 `graphql-codegen-cli` 文档配置
- `gql-codegen`执行后，会自动 watch `src/graphql` 文件的变化，每次变化后，会自动生成对应的代码，包含了 typescript 的 type，gql 相关的 react-hooks 钩子 function
- 已经支持 alias `@`作为相对 src 的绝对路径 如`@/router`就等于 `src/router`
- 关于 style，使用的是[css-moduels](https://github.com/css-modules/css-modules),推荐按照 vscode 插件 Css Moduels[](https://marketplace.visualstudio.com/items?itemName=clinyong.vscode-css-modules) 实现 `autocomplete + go to definition`,提升开发体验

  ```js
  import styles from './app.module.scss'

  function App() {
    return (
      <div className={`App ${styles.container}`}>
        <img src={logo} className="App-logo" alt="logo" />
        <Router />
        <ExchangeRates />
      </div>
    )
  }
  ```
## TODO

- 文件夹结构和命名规则待定
- react 组件开发规范待定
