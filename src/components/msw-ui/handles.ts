import { chunk, cloneDeep } from 'lodash';
import { makeAutoObservable } from 'mobx';
import { MobXProviderContext } from 'mobx-react';
import { setupWorker, SetupWorkerApi } from 'msw';
import { useContext } from 'react';
import yuxStorage from './yuxStorage';

import {
  activeCollection,
  activeGroupRequest,
  addMock,
  checkCurrentEditInGroupRequest,
  collectionRepeat,
  editMock,
  existRequest,
  filterRequest,
  getConflictRequest,
  getRequestKey,
  getResetHandlers,
  importStorageGroupData,
  importStorageSwaggerDocs,
  saveSwitchHostData,
  versionDataTransfer,
} from './handlesFnc';
import { groupsRequestType, IGroupDataItem, mswReqType } from './handlesType';

export class HandlerMock {
  constructor(projectName: string) {
    makeAutoObservable(this, {}, { autoBind: true });
    this.projectName = projectName;
  }
  filterKeywords = '';
  projectName = '';
  handleTableTab = 'unHandle';
  worker: SetupWorkerApi | null = null;
  handleAllRequest: mswReqType[] = [];
  showConflictDetail = false;
  currentEditGroupRequest: IGroupDataItem | undefined = undefined;
  currentHostSwitch = false;
  groupRequest: groupsRequestType = { collection: [], version: 3 };
  storageSwagger = '';
  //获取未mock的接口
  get unHandleAllRequest() {
    const handledMap: Record<string, boolean> = {};
    const collections = this.groupRequest.collection;
    collections.forEach((collectionItem) => {
      Object.values(collectionItem.data).forEach((requestGroupItem) => {
        requestGroupItem.data.forEach((requestItem) => {
          if (!requestItem.disabled) {
            handledMap[getRequestKey(requestItem.request)!] = true;
          }
        });
      });
    });
    return this.handleAllRequest
      .filter((im) => {
        return !handledMap[getRequestKey(im)!];
      })
      .map(
        (im) =>
          ({
            request: im,
            group: '',
            type: 'basic',
            name: '',
            collection: '',
          } as IGroupDataItem),
      );
  }
  //获取已mock的接口
  get handledAllRequest() {
    const collections = this.groupRequest.collection;
    const handledRequest: IGroupDataItem[] = [];
    collections.forEach((collectionItem) => {
      Object.values(collectionItem.data).forEach((requestGroupItem) => {
        requestGroupItem.data.forEach((requestItem) => {
          if (!requestItem.disabled || (requestItem.disabled && requestItem.track)) {
            handledRequest.push(requestItem);
          }
        });
      });
    });
    return handledRequest;
  }
  //初始化
  async init(projectName: string, includesLocal?: boolean) {
    if (process.env.NODE_ENV !== 'development') {
      return Promise.reject('请在测试环境下使用msw mock 工具');
    }
    if (!projectName) {
      return Promise.reject('请定义项目名称');
    }
    this.projectName = projectName;
    const worker = setupWorker();
    worker.events.on('request:unhandled', (req) => {
      if (filterRequest(req, includesLocal)) {
        if (!existRequest(req, this.handleAllRequest)) {
          this.handleAllRequest.unshift(req);
        } else {
          const findIndex = this.handleAllRequest.findIndex(
            (im) => getRequestKey(im) === getRequestKey(req),
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
        console.log('==e', e);
      }
    });
    worker.start({
      onUnhandledRequest: 'bypass',
    });
    window._msw_worker = worker;
    this.worker = worker;
    try {
      const storageSwaggerList = await yuxStorage.getItem(projectName + '_msw-ui-swagger-storage');
      this.storageSwagger = importStorageSwaggerDocs(storageSwaggerList);
      const storage = await yuxStorage.getItem(projectName + '_msw-ui-storage');
      let storageData = importStorageGroupData(storage || '');
      storageData = storageData ? versionDataTransfer(storageData) : undefined;
      storageData && this.resetHandlers(storageData);
      storageData && (this.groupRequest = storageData);
      return Promise.resolve();
    } catch (e) {
      console.error('msw-tool 数据初始化失败:' + e);
      return Promise.resolve();
    }
  }
  resetHandlers(groupsRequest: groupsRequestType) {
    const handlers = getResetHandlers(groupsRequest);
    this.worker?.resetHandlers(...handlers);
  }
  changeSwaggerUrl(url: string) {
    this.storageSwagger = url;
    yuxStorage.setItem(this.projectName + '_msw-ui-swagger-storage', JSON.stringify(url));
  }
  //添加mock
  addSimpleMock(data: IGroupDataItem, isEdit?: boolean) {
    if (isEdit) {
      editMock(data, this.groupRequest, this.currentEditGroupRequest);
    } else {
      addMock(this.groupRequest, data);
    }
    this.resetHandlers(this.groupRequest);
    this.saveRequestGroup();
  }
  setFilterKeyword(keyword: string) {
    this.filterKeywords = keyword;
  }
  get paginationMock() {
    let filterRequest: IGroupDataItem[] = [];
    if (this.handleTableTab === 'unHandle') {
      filterRequest = this.unHandleAllRequest.filter((im) => {
        return getRequestKey(im.request)?.includes(this.filterKeywords);
      });
    } else {
      filterRequest = this.handledAllRequest.filter((im) => {
        return getRequestKey(im.request)?.includes(this.filterKeywords);
      });
    }
    return chunk(filterRequest, 20);
  }
  activeGroup(collectionKey: string, groupKey: string, active: boolean) {
    activeGroupRequest(collectionKey, groupKey, this.groupRequest, active);
    this.resetHandlers(this.groupRequest);
    this.saveRequestGroup();
  }
  changeCollectionStatus(collectionKey: string, active: boolean) {
    activeCollection(collectionKey, this.groupRequest, active);
    this.resetHandlers(this.groupRequest);
    this.saveRequestGroup();
  }
  setCurrentEditGroupRequest(mock: IGroupDataItem | undefined) {
    this.currentEditGroupRequest = mock;
    this.currentHostSwitch = false;
    this.showConflictDetail = false;
  }
  deleteGroup(collectionName: string, groupKey: string) {
    const collection = this.groupRequest.collection?.find((im) => im.name === collectionName);
    const group = collection?.data;
    if (group) {
      delete group[groupKey];
    }
    if (!checkCurrentEditInGroupRequest(this.groupRequest, this.currentEditGroupRequest)) {
      this.currentEditGroupRequest = undefined;
    }
    this.resetHandlers(this.groupRequest);
    this.saveRequestGroup();
  }
  deleteCollection(collectionName: string) {
    this.groupRequest.collection = this.groupRequest.collection.filter(
      (im) => im.name !== collectionName,
    );
    if (!checkCurrentEditInGroupRequest(this.groupRequest, this.currentEditGroupRequest)) {
      this.currentEditGroupRequest = undefined;
    }
    this.resetHandlers(this.groupRequest);
    this.saveRequestGroup();
  }
  deleteGroupItem(requestItem: IGroupDataItem) {
    const collection = this.groupRequest.collection.find(
      (im) => im.name === requestItem.collection,
    );
    const group = collection?.data;
    const groupKey = requestItem.group;
    if (group?.[groupKey]?.data) {
      group[groupKey].data = group[groupKey].data.filter((im) => im !== requestItem);
      if (!checkCurrentEditInGroupRequest(this.groupRequest, this.currentEditGroupRequest)) {
        this.currentEditGroupRequest = undefined;
      }
      this.resetHandlers(this.groupRequest);
      this.saveRequestGroup();
    }
  }
  moveOutFromHandledTable(requestItem: IGroupDataItem) {
    requestItem.disabled = true;
    requestItem.track = false;
    this.resetHandlers(this.groupRequest);
    this.saveRequestGroup();
  }
  //清空拦截池
  clearTableList() {
    if (this.handleTableTab !== 'handled') return;
    this.paginationMock?.forEach((item) => {
      item.forEach((_item) => {
        _item.disabled = true;
        _item.track = false;
      });
    });
    this.resetHandlers(this.groupRequest);
    this.saveRequestGroup();
  }
  //暂停启动拦截池
  batchChangeTableList(status: 'active' | 'disabled') {
    if (this.handleTableTab !== 'handled') return;
    this.paginationMock?.forEach((item) => {
      item.forEach((_item) => {
        _item.disabled = status !== 'active';
      });
    });
    this.resetHandlers(this.groupRequest);
    this.saveRequestGroup();
  }
  changeGroupItemStatus(requestItem: IGroupDataItem, isEnable: boolean) {
    requestItem.disabled = !isEnable;
    //当为激活的时候存放到拦截池
    isEnable && (requestItem.track = true);
    this.resetHandlers(this.groupRequest);
    this.saveRequestGroup();
    const conflictData = getConflictRequest(this.groupRequest);
    if (!Object.values(conflictData)?.length) {
      this.showConflictDetail = false;
    }
  }
  saveRequestGroup() {
    yuxStorage.setItem(this.projectName + '_msw-ui-storage', JSON.stringify(this.groupRequest));
  }
  importGroupData(data: string) {
    const importData = importStorageGroupData(data);
    if (importData) {
      this.groupRequest = importData;
      this.resetHandlers(importData);
      this.saveRequestGroup();
    }
  }
  changeHandleTabTab(type: 'unHandle' | 'handled') {
    this.handleTableTab = type;
  }
  addCollection(name: string) {
    const trimName = name.trim();
    if (!trimName) {
      return { status: false, msg: '名称不能为空' };
    }
    if (collectionRepeat(trimName, this.groupRequest)) {
      return { status: false, msg: '名称重复' };
    }
    if (!this.groupRequest.collection) {
      this.groupRequest.collection = [];
    }
    this.groupRequest.collection.push({
      name: trimName,
      data: {},
    });
    this.saveRequestGroup();
    return {
      status: true,
      msg: '',
    };
  }
  setCurrentHostChange(status: boolean) {
    this.currentHostSwitch = status;
    this.showConflictDetail = false;
    this.currentEditGroupRequest = undefined;
  }
  setShowConflictDetail(status: boolean) {
    this.currentHostSwitch = false;
    this.currentEditGroupRequest = undefined;
    this.showConflictDetail = status;
  }
  saveChangeHost(changeObj: Record<string, any>) {
    saveSwitchHostData(changeObj, this.groupRequest);
    this.setCurrentHostChange(false);
    this.saveRequestGroup();
    this.resetHandlers(this.groupRequest);
  }
  checkNameEditRepeat(
    data: {
      level: 'collection' | 'group' | 'request';
      collectionName?: string;
      groupName?: string;
      request?: IGroupDataItem;
    },
    newName: string,
  ) {
    const { level, collectionName, groupName } = data;
    let repeat = false;
    if (level === 'collection' && newName) {
      const collectionNames = this.groupRequest.collection.map((im) => im.name);
      if (collectionNames.includes(newName)) {
        repeat = true;
      }
    }
    if (level === 'group' && newName && collectionName) {
      const collection = this.groupRequest.collection.find(
        (collection) => collection.name === collectionName,
      );
      if (collection?.data) {
        repeat = Object.keys(collection.data).includes(newName);
      }
    }
    if (level === 'request' && collectionName && groupName && newName) {
      const collection = this.groupRequest.collection.find(
        (collection) => collection.name === collectionName,
      );
      const group = collection?.data?.[groupName];
      const requestsName =
        group?.data?.map((requestItem) => {
          return requestItem.name;
        }) || [];
      repeat = requestsName.includes(newName);
    }
    return repeat;
  }

  saveEditName(
    data: {
      level: 'collection' | 'group' | 'request';
      collectionName?: string;
      groupName?: string;
      request?: IGroupDataItem;
    },
    newName: string,
  ) {
    const { level, collectionName, groupName, request } = data;
    if (level === 'collection' && collectionName) {
      const collection = this.groupRequest.collection.find(
        (collection) => collection.name === collectionName,
      );
      if (collection) {
        collection.name = newName;
        const groups = collection.data;
        Object.keys(groups).forEach((groupKey) => {
          groups[groupKey].data.forEach((requestItem) => {
            requestItem.collection = newName;
          });
        });
      }
    }
    if (level === 'group' && collectionName && groupName) {
      const collection = this.groupRequest.collection.find(
        (collection) => collection.name === collectionName,
      );
      const group = collection?.data[groupName];
      if (group) {
        group.data?.forEach((requestItem) => {
          requestItem.group = newName;
        });
        delete collection.data[groupName];
        collection.data[newName] = group;
      }
    }
    if (level === 'request' && collectionName && groupName && request) {
      const collection = this.groupRequest.collection.find(
        (collection) => collection.name === collectionName,
      );
      const group = collection?.data[groupName];
      const request: IGroupDataItem | undefined = group?.data.find(
        (requestItem) => requestItem.name === request?.name,
      );
      if (request && group) {
        request.name = newName;
      }
    }
    this.resetHandlers(this.groupRequest);
    this.saveRequestGroup();
  }
  saveCopy(
    data: {
      level: 'collection' | 'group' | 'request';
      collectionName?: string;
      groupName?: string;
      request?: IGroupDataItem;
    },
    newName: string,
  ) {
    const { level, collectionName, groupName, request } = data;
    if (level === 'collection' && collectionName) {
      const collection = this.groupRequest.collection.find(
        (collection) => collection.name === collectionName,
      );
      if (collection) {
        const cpCollection = cloneDeep(collection);
        cpCollection.name = newName;
        const groups = cpCollection.data;
        Object.keys(groups).forEach((groupKey) => {
          groups[groupKey].data.forEach((requestItem: IGroupDataItem) => {
            requestItem.collection = newName;
            requestItem.disabled = true;
          });
        });
        this.groupRequest.collection.push(cpCollection);
      }
    }
    if (level === 'group' && collectionName && groupName) {
      const collection = this.groupRequest.collection.find(
        (collection) => collection.name === collectionName,
      );
      const group = collection?.data[groupName];
      if (group) {
        const cpGroup = cloneDeep(group);
        cpGroup.data?.forEach((requestItem: IGroupDataItem) => {
          requestItem.group = newName;
          requestItem.disabled = true;
        });
        collection.data[newName] = cpGroup;
      }
    }
    if (level === 'request' && collectionName && groupName && request) {
      const collection = this.groupRequest.collection.find(
        (collection) => collection.name === collectionName,
      );
      const group = collection?.data[groupName];
      const request: IGroupDataItem | undefined = group?.data.find(
        (requestItem) => requestItem.name === request?.name,
      );
      if (request && group) {
        const cpRequest = cloneDeep(request);
        cpRequest.name = newName;
        cpRequest.disabled = true;
        group.data.push(cpRequest);
      }
    }
    this.resetHandlers(this.groupRequest);
    this.saveRequestGroup();
  }

  static of(projectName: string) {
    if (!instance) {
      instance = new HandlerMock(projectName)
    }
    return instance
  }
}

let instance: HandlerMock;

export const handlerMock = (name: string) => new HandlerMock(name);


function useStores(): { store: HandlerMock };
function useStores() {
  return useContext(MobXProviderContext);
}

export { useStores };
