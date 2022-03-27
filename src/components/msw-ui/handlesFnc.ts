import { DefaultRequestBody, MockedRequest, rest, RestHandler } from 'msw';

import { groupsRequestType, IGroupDataItem, mswReqType } from './handlesType';

export function filterRequest(req: mswReqType) {
  return !req.destination && req.url.host !== window.location.host;
}

export function existRequest(req: mswReqType, reqs: mswReqType[]) {
  return !!reqs.find((im) => getRequestKey(im) === getRequestKey(req));
}

export function existInGroup(
  mock: IGroupDataItem,
  mocks: Record<string, { data: IGroupDataItem[]; isEnable: boolean }>
) {
  return !!mocks[mock.group]?.data.find(
    (im) =>
      im.request.url.host + im.request.url.pathname ===
      mock.request.url.host + mock.request.url.pathname
  );
}

export function getResetHandlers(groupsRequest: groupsRequestType) {
  //创建handlers,进行动态拦截
  let handlers: RestHandler<MockedRequest<DefaultRequestBody>>[] = [];
  Object.keys(groupsRequest).forEach((_groupKey) => {
    if (groupsRequest[_groupKey].isEnable) {
      groupsRequest[_groupKey].data.forEach((request) => {
        if (!request.disabled) {
          const handler = rest[
            request.request.method.toLowerCase() as keyof typeof rest
          ]?.(request.request.url.href, (req, res, ctx) => {
            return res(
              ctx.status(+(request.status || 200)),
              ctx.json(request.request.responseJson)
            );
          });
          handlers = [...handlers, handler];
        }
      });
    }
  });
  return handlers;
}

export function activeGroupRequest(
  groupKey: string,
  groupsRequest: groupsRequestType,
  active: boolean
) {
  if (groupsRequest[groupKey]) {
    groupsRequest[groupKey].isEnable = active;
    groupsRequest[groupKey].data = groupsRequest[groupKey].data?.map((im) => {
      im.disabled = !active;
      return im;
    });
  }
}

export function getRequestKey(req: mswReqType | undefined) {
  if (!req) return;
  return req.method + req.url.host + req.url.pathname;
}

export function getRequestKeyFormatShow(req: mswReqType | undefined) {
  if (!req) return;
  return req.url.pathname;
}

export function judgeHavaGroupHandlers(
  groupMock: Record<string, { data: IGroupDataItem[]; isEnable: boolean }>
) {
  let hasData = false;
  if (!groupMock) {
    return hasData;
  }
  Object.keys(groupMock).forEach((im) => {
    if (groupMock[im].data?.length) {
      hasData = true;
    }
  });
  return hasData;
}

export function exportGroupRequestData(groupRequest: groupsRequestType) {
  const link = document.createElement('a');
  link.download = 'config.json';
  link.href = 'data:text/plain,' + JSON.stringify(groupRequest);
  link.click();
  link.remove();
}
export function importStorageGroupData(data: string | Record<string, unknown>) {
  if (!data) return;
  try {
    if (data) {
      const request = typeof data === 'string' ? JSON.parse(data) : data;
      Object.keys(request).forEach((im: any) => {
        request[im].data.forEach((ik: any) => {
          //url 字符串转化为URL对象
          ik.request.url = new URL(ik.request.url);
        });
      });
      return request;
    }
  } catch (e) {
    console.error('导入失败', e);
    return '';
  }
}

export function getGroupKeys(
  data: Record<string, { data: IGroupDataItem[]; isEnable: boolean }>
) {
  return Object.keys(data);
}

export function checkGroupNameDuplicate(
  copyGroupName: string,
  groupRequest: groupsRequestType
) {
  const groupKeys = Object.keys(groupRequest);
  return groupKeys.includes(copyGroupName);
}
