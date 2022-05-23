import { DefaultRequestBody, MockedRequest, RestRequest } from 'msw';

export interface IStore {
  handleRequest: RestRequest[];
  handleAllRequest: RestRequest[];
}

export interface IGroupDataItem {
  group: string;
  status?: string;
  request: mswReqType;
  type: 'basic' | 'advanced';
  disabled?: boolean;
  name: string;
  collection: string;
  delay?: string;
}

export type mswReqType = MockedRequest<DefaultRequestBody> & {
  responseJson?: string;
};

export type groupsRequestType = {
  collection: Array<groupsRequestTypeItem>;
  version: number;
};

export interface groupsRequestTypeItem {
  name: string;
  data: Record<string, { data: IGroupDataItem[] }>;
}

export interface IHostSwitch {
  level: 'collection' | 'group';
  groupName?: string;
  collectionName: string;
}
