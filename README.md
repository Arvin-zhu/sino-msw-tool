# msw-tools
基于msw mock的可视化操作工具，基于service worker原理，拦截请求，对请求的返回值进行mock

# 使用

- 先安装msw
  - npm install msw --save-dev
  - yarn add msw --dev
- 执行msw初始化([文档](https://mswjs.io/docs/getting-started/integrate/browser))
  - npx msw init <PUBLIC_DIR> --save
  - 在开发模式下引入
    ```
    {
      process.env.NODE_ENV === 'development' && <MswUi />
    }
    ```
