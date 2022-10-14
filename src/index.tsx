/// <reference path="../typings/yuxStorage.d.ts" />
import { mswPlacement, MswUiType } from './MswUi';
export const MswUi: MswUiType =
  process.env.NODE_ENV !== 'development'
    ? function (props: {
        placement?: mswPlacement;
        projectName: string;
        includesLocal?: boolean; //是否拦截本地请求
        children: any;
      }) {
        return props.children;
      }
    : require('./MswUi').MswUi;
