import ReactDOM from 'react-dom';
import React from 'react';
import { MswUi } from '../src/index'; //一款可视化mock插件
import { App } from './App';

const root = document.getElementById('root');

ReactDOM.render(
  <MswUi projectName="meetGame">
    <App />
  </MswUi>,
  root,
);
