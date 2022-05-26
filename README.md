# msw-tools
基于msw mock的可视化操作工具，基于service worker原理，拦截请求，对请求的返回值进行mock

# 使用

- 先安装msw
  - npm install msw@0.39.2 --save-dev
  - yarn add msw@0.39.2 --dev
- 安装msw-tool
	- yarn add @sino/msw-tool --dev
- 执行msw初始化([文档](https://mswjs.io/docs/getting-started/integrate/browser))
  - npx msw init <PUBLIC_DIR> --save
  - 在开发模式下引入
    ```
    //在create-react-app中
    import { MswUi } from "@sino/msw-tool";
    ......
    ......
    //projectName为项目名称，作为存储唯一key
    ReactDOM.render(
      <MswUi projectName="creation_front">
        <AppProvider>
          <App />
        </AppProvider>
      </MswUi>,
      document.getElementById('root')
    );
    ```
    ```
    //在umi中
    //app.tsx
    import { MswUi } from '@sino/msw-tool';

    export function rootContainer(container) {
      return <MswUi projectName="creation_front">{container}</MswUi>;
    }
    ```
