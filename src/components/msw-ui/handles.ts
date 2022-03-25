import { chunk, cloneDeep } from 'lodash';
import { makeAutoObservable } from 'mobx';
import { MobXProviderContext } from 'mobx-react';
import { setupWorker } from 'msw';
import { useContext } from 'react';

import {
  activeGroupRequest,
  existInGroup,
  existRequest,
  filterRequest,
  getRequestKey,
  importStorageGroupData,
  resetHandlers,
} from './handlesFnc';
import { groupsRequestType, IGroupDataItem, mswReqType } from './handlesType';

class HandlerMock {
  constructor() {
    makeAutoObservable(this);
  }
  filterKeywords = '';
  handleAllRequest: mswReqType[] = [];
  currentEditGroupRequest: Partial<IGroupDataItem> | undefined;
  groupRequest: groupsRequestType = {};
  //获取未mock的接口
  get unHandleAllRequest() {
    const handledMap: Record<string, boolean> = {};
    Object.keys(this.groupRequest).forEach((im) => {
      if (this.groupRequest[im]?.isEnable) {
        this.groupRequest[im].data.forEach((request) => {
          handledMap[
            request.request.method +
              request.request.url.host +
              request.request.url.pathname
          ] = true;
        });
      }
    });
    return this.handleAllRequest.filter((im) => {
      return !handledMap[im.method + im.url.host + im.url.pathname];
    });
  }
  //初始化
  async init() {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('请在测试环境下使用msw mock 工具');
    }
    const worker = setupWorker();
    worker.events.on('request:unhandled', (req) => {
      if (filterRequest(req)) {
        console.log(req, getRequestKey(req), '===req', filterRequest(req));
        if (!existRequest(req, this.handleAllRequest)) {
          this.handleAllRequest.push(req);
        } else {
          const findIndex = this.handleAllRequest.findIndex(
            (im) =>
              im.method + im.url.host + im.url.pathname ===
              req.method + req.url.host + req.url.pathname
          );
          if (findIndex !== -1) {
            this.handleAllRequest.splice(findIndex, 1, req);
          }
        }
      }
    });
    worker.events.on('response:bypass', async (res, reqId) => {
      try {
        const findReq = this.handleAllRequest.find((im) => im.id === reqId);
        if (findReq) {
          findReq.responseJson = await res.json();
        }
      } catch (e) {
        console.log(e);
      }
    });
    worker.start();
    window._msw_worker = worker;
    const storage = localStorage.getItem('msw-ui-storage');
    const storageData = importStorageGroupData(storage || '');
    storageData && (this.groupRequest = storageData);
    storageData && resetHandlers(storageData);
  }
  //添加mock
  addSimpleMock(data: IGroupDataItem) {
    //TODO: 验证
    if (!this.groupRequest[data.group]) {
      this.groupRequest[data.group] = { data: [], isEnable: false };
    }
    if (!existInGroup(data, this.groupRequest)) {
      this.groupRequest[data.group].data = [
        ...this.groupRequest[data.group].data,
        data,
      ];
    } else {
      const filterRequest = this.groupRequest[data.group].data.filter((im) => {
        return im.request.url.pathname !== data.request.url.pathname;
      });
      this.groupRequest[data.group].data = [...filterRequest, data];
    }
    resetHandlers(this.groupRequest);
  }
  setFilterKeyword(keyword: string) {
    this.filterKeywords = keyword;
  }
  get paginationMock() {
    const that = this;
    const filterRequest = this.handleAllRequest.filter((im) => {
      return getRequestKey(im)?.includes(that.filterKeywords);
    });
    return chunk(filterRequest, 5);
  }
  activeGroup(groupKey: string, active: boolean) {
    activeGroupRequest(groupKey, this.groupRequest, active);
    resetHandlers(this.groupRequest);
  }
  setCurrentEditMock(mock: mswReqType | undefined) {
    this.currentEditGroupRequest = {
      type: undefined,
      group: undefined,
      status: undefined,
      request: mock,
    };
  }
  setCurrentEditGroupRequest(mock: IGroupDataItem | undefined) {
    this.currentEditGroupRequest = mock;
  }
  copyGroup(groupKey: string, groupName: string) {
    const cpGroup = cloneDeep(this.groupRequest[groupKey]);
    this.groupRequest[groupName] = cpGroup;
    this.activeGroup(groupName, false);
  }
  deleteGroup(groupKey: string) {
    delete this.groupRequest[groupKey];
    resetHandlers(this.groupRequest);
  }
  deleteGroupItem(groupKey: string, requestItem: IGroupDataItem) {
    if (this.groupRequest[groupKey]?.data) {
      this.groupRequest[groupKey].data = this.groupRequest[
        groupKey
      ].data.filter((im) => im !== requestItem);
      resetHandlers(this.groupRequest);
    }
  }
  changeGroupItemStatus(
    groupKey: string,
    requestItem: IGroupDataItem,
    isEnable: boolean
  ) {
    if (this.groupRequest[groupKey]?.data) {
      this.groupRequest[groupKey].data = this.groupRequest[groupKey].data.map(
        (im) => {
          if (im === requestItem) {
            im.disabled = !isEnable;
          }
          return im;
        }
      );
      resetHandlers(this.groupRequest);
    }
  }
  saveRequestGroup() {
    localStorage.setItem('msw-ui-storage', JSON.stringify(this.groupRequest));
    alert('保存成功！');
  }
  importGroupData(data: string) {
    const importData = importStorageGroupData(data);
    if (importData) {
      this.groupRequest = importData;
    }
  }
}

export const handlerMock = new HandlerMock();

window._msw_tool = handlerMock;

function useStores(): { store: HandlerMock };
function useStores() {
  return useContext(MobXProviderContext);
}

export { useStores };
