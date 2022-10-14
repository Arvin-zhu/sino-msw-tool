/// <reference path="../typings/yuxStorage.d.ts" />
import { MswUiType } from './MswUi';
export const MswUi: MswUiType =
  process.env.NODE_ENV !== 'development'
    ? function () {
        return null;
      }
    : require('./MswUi').MswUi;
