import { get } from "lodash";
import { DefaultRequestBody, MockedRequest, rest, RestHandler } from "msw";

import { groupsRequestType, IGroupDataItem, mswReqType } from "./handlesType";

export function filterRequest(req: mswReqType) {
  return !req.destination && req.url.host !== window.location.host;
}

export function existRequest(req: mswReqType, reqs: mswReqType[]) {
  return !!reqs.find((im) => getRequestKey(im) === getRequestKey(req));
}

export function existInGroup(
  mock: IGroupDataItem,
  mocks: Record<string, { data: IGroupDataItem[] }>
) {
  return !!mocks[mock.group]?.data.find(
    (im) =>
      getRequestKey(im.request) + im.name ===
      getRequestKey(mock.request) + mock.name
  );
}

export function getResetHandlers(groupsRequest: groupsRequestType) {
  //创建handlers,进行动态拦截
  let handlers: RestHandler<MockedRequest<DefaultRequestBody>>[] = [];
  groupsRequest.collection?.forEach((_collection) => {
    const group = _collection.data;
    Object.keys(group).forEach((_groupKey) => {
      group[_groupKey]?.data.forEach((request) => {
        if (!request.disabled) {
          const handler = rest[
            request.request.method.toLowerCase() as keyof typeof rest
          ]?.(request.request.url.href, (req, res, ctx) => {
            return res(
              ctx.status(+(request.status || 200)),
              ctx.delay(
                request.delay && Number(request.delay) !== 0
                  ? Number(request.delay)
                  : 0
              ),
              ctx.json(request.request.responseJson)
            );
          });
          handlers = [...handlers, handler];
        }
      });
    });
  });
  return handlers;
}

export function activeGroupRequest(
  collectionKey: string,
  groupKey: string,
  groupsRequest: groupsRequestType,
  active: boolean
) {
  const collection = groupsRequest.collection.find(
    (collectionItem) => collectionItem.name === collectionKey
  );
  const group = collection?.data[groupKey];
  if (group) {
    group.data = group.data?.map((im) => {
      im.disabled = !active;
      return im;
    });
  }
}

export function activeCollection(
  collectionKey: string,
  groupsRequest: groupsRequestType,
  active: boolean
) {
  const collection = groupsRequest.collection.find(
    (im) => im.name === collectionKey
  );
  if (collection?.data) {
    Object.keys(collection.data).forEach((groupKey) => {
      const groups = collection.data[groupKey];
      groups.data.forEach((im) => {
        im.disabled = !active;
      });
    });
  }
}

export function getRequestKey(req: mswReqType | undefined) {
  if (!req) return;
  return req.method + req.url.host + req.url.pathname;
}

export function getRequestKeyFormatShow(
  req: mswReqType | undefined,
  short?: string
) {
  if (!req) return;
  if (short && req.url.pathname?.length > 35) {
    return `${req.url.pathname.slice(0, 10)}......${req.url.pathname.slice(
      -25
    )}`;
  }
  return req.url.pathname;
}

export function judgeHavaGroupHandlers(groupMock: groupsRequestType) {
  let hasData = false;
  if (!groupMock) {
    return hasData;
  }
  const collection = groupMock.collection;
  collection.forEach((im) => {
    const group = im.data;
    Object.keys(group).forEach((groupKey) => {
      if (group[groupKey].data?.length) {
        hasData = true;
      }
    });
  });
  return hasData;
}

export function exportGroupRequestData(groupRequest: groupsRequestType) {
  const eleLink = document.createElement("a");
  eleLink.download = "msw_tool_config.json";
  eleLink.style.display = "none";
  // 字符内容转变成blob地址
  const blob = new Blob([JSON.stringify(groupRequest)]);
  eleLink.href = URL.createObjectURL(blob);
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
}
export function importStorageGroupData(data: string | Record<string, unknown>) {
  if (!data) return;
  try {
    if (data) {
      const request: groupsRequestType =
        typeof data === "string" ? JSON.parse(data) : data;
      request.collection?.forEach((collectionItem) => {
        const group = collectionItem.data;
        Object.keys(group).forEach((im) => {
          group[im].data.forEach((ik) => {
            //url 字符串转化为URL对象
            ik.request.url = new URL(ik.request.url);
          });
        });
      });
      return request;
    }
  } catch (e) {
    console.error("导入失败", e);
    return undefined;
  }
}

export function checkEnableInCollection(name: string, data: groupsRequestType) {
  const collection = data.collection?.find(
    (collection) => collection.name === name
  );
  const group = collection?.data;
  if (group) {
    return Object.keys(group).some((groupKey) => {
      return group[groupKey].data.some((groupItem) => {
        if (!groupItem.disabled) {
          return true;
        }
        return false;
      });
    });
  }
  return false;
}

export function checkEnableInGroup(
  collectionName: string,
  groupName: string,
  data: groupsRequestType
) {
  const collection = data.collection?.find(
    (collection) => collection.name === collectionName
  );
  const group = collection?.data;
  if (group) {
    return group[groupName].data.some((groupItem) => {
      if (!groupItem.disabled) {
        return true;
      }
      return false;
    });
  }
  return false;
}

export function getGroupKeys(data: groupsRequestType, collectionName: string) {
  const collection = data.collection;
  const groups =
    collection?.find((im) => im.name === collectionName)?.data || {};
  return Object.keys(groups);
}

export function getCollectionKeys(data: groupsRequestType) {
  const collection = data.collection;
  return collection?.map((im) => im.name) || [];
}

export function checkGroupNameDuplicate(
  copyGroupName: string,
  groupRequest: groupsRequestType
) {
  const groupKeys = Object.keys(groupRequest);
  return groupKeys.includes(copyGroupName);
}

export function collectionRepeat(
  name: string,
  groupRequest: groupsRequestType
) {
  const collection = groupRequest.collection;
  const nameCollection = collection?.map((im) => im.name);
  return nameCollection?.includes(name);
}

export function versionDataTransfer(data: groupsRequestType) {
  //数据不兼容处理
  if (!data?.version) {
    return {
      collection: [
        {
          name: "未知模块",
          data,
        },
      ],
      version: 2,
    } as any as groupsRequestType;
  }
  return data;
}

export function getAllHostsFromCollections(groupRequest: groupsRequestType) {
  let hostArray: string[] = [];
  groupRequest.collection.forEach((collection) => {
    const groups = collection.data;
    Object.keys(groups).forEach((groupKey) => {
      groups[groupKey].data.forEach((requestItem) => {
        hostArray = [...hostArray, requestItem.request.url.host];
      });
    });
  });
  return Array.from(new Set(hostArray));
}

export function initHostStringArrToMap(hosts: string[]) {
  const hostMap: Record<string, any> = {};
  hosts?.forEach((im) => (hostMap[im] = im));
  return hostMap;
}

export function saveSwitchHostData(
  changeObj: Record<string, any>,
  groupRequest: groupsRequestType
) {
  groupRequest.collection.forEach((collectionItem) => {
    const groups = collectionItem.data;
    if (groups) {
      Object.keys(groups).forEach((groupKey) => {
        const group = groups[groupKey];
        group?.data.forEach((requestItem) => {
          requestItem.request.url.host =
            changeObj[requestItem.request.url.host];
        });
      });
    }
  });
}

export function addMock(groupRequest: groupsRequestType, data: IGroupDataItem) {
  const currentCollection = groupRequest.collection.find(
    (im) => im.name === data.collection
  );
  if (!currentCollection) {
    groupRequest.collection = [
      {
        name: data.collection,
        data: {
          [data.group]: {
            data: [data],
          },
        },
      },
      ...groupRequest.collection,
    ];
  } else {
    if (!currentCollection?.data[data.group]) {
      currentCollection.data[data.group] = { data: [] };
    }
    if (!existInGroup(data, currentCollection.data)) {
      currentCollection.data[data.group].data = [
        data,
        ...currentCollection.data[data.group].data,
      ];
    } else {
      const filterRequest = currentCollection.data[data.group].data.filter(
        (im) => {
          return (
            getRequestKey(im.request) + im.name !==
            getRequestKey(data.request) + data.name
          );
        }
      );
      currentCollection.data[data.group].data = [data, ...filterRequest];
    }
  }
}

export function editMock(
  newRequestItemData: IGroupDataItem,
  groupRequest: groupsRequestType,
  requestItem?: IGroupDataItem
) {
  if (!requestItem) return;
  const collection = groupRequest.collection.find(
    (collection) => collection.name === requestItem.collection
  );
  const group = collection?.data[requestItem.group];
  //如果不是移动的逻辑就直接修改
  if (
    requestItem.group === newRequestItemData.group &&
    requestItem.collection === newRequestItemData.collection
  ) {
    requestItem.collection = newRequestItemData.collection || "";
    requestItem.delay = newRequestItemData.delay || "0";
    requestItem.group = newRequestItemData.group || "";
    requestItem.name = newRequestItemData.name || "";
    requestItem.status = newRequestItemData.status;
    requestItem.request.responseJson = newRequestItemData.request?.responseJson;
  } else {
    //如果是移动的逻辑，那么需要清除该分组下面request，然后执行添加逻辑
    if (group) {
      group.data = group.data.filter((im) => im !== requestItem);
    }
    addMock(groupRequest, newRequestItemData);
  }
}

export function getConflictRequest(groupRequest: groupsRequestType) {
  const requestKey: Record<string, IGroupDataItem[]> = {};
  groupRequest.collection.forEach((collectionItem) => {
    const groups = collectionItem.data;
    if (groups) {
      Object.keys(groups).forEach((groupKey) => {
        const group = groups[groupKey];
        group.data?.forEach((request) => {
          if (!request.disabled) {
            if (!requestKey[getRequestKey(request.request)!]) {
              requestKey[getRequestKey(request.request)!] = [request];
            } else {
              requestKey[getRequestKey(request.request)!] = [
                ...requestKey[getRequestKey(request.request)!],
                request,
              ];
            }
          }
        });
      });
    }
  });
  Object.keys(requestKey).forEach((key) => {
    if (requestKey[key]?.length < 2) {
      delete requestKey[key];
    }
  });
  return requestKey;
}

export function checkRequestDuplicateInGroup(
  groupRequest: groupsRequestType,
  request: IGroupDataItem
) {
  const collection = groupRequest.collection.find(
    (collection) => collection.name === request.collection
  );
  const group = collection?.data?.[request.group]?.data;
  const groupRequestName = group?.map((request) => request.name);
  if (groupRequestName?.includes(request.name)) {
    return true;
  }
  return false;
}

export function checkCurrentEditInGroupRequest(
  groupRequest: groupsRequestType,
  currentEditItem?: IGroupDataItem
) {
  if (!currentEditItem) {
    return false;
  }
  const collection = groupRequest.collection.find(
    (collection) => collection.name === currentEditItem.collection
  );
  const group = collection?.data?.[currentEditItem.group]?.data;
  return !!group?.find((request) => request === currentEditItem);
}
