import React from 'react';
import ReactDOM from 'react-dom';
import { MswUi } from '../src/index'; //一款可视化mock插件
import { App } from './App';

const root = document.getElementById('root');

console.log(MswUi);
ReactDOM.render(
  <MswUi projectName="msw_ui">
    <App />
  </MswUi>,
  root,
);
