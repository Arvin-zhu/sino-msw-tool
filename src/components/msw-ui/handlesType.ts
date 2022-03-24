import { DefaultRequestBody, MockedRequest, RestRequest } from "msw";

export interface IStore {
	handleRequest: RestRequest[];
	handleAllRequest:RestRequest[];
}

export interface IGroupDataItem {
	group: string;
	status?: string;
	request: mswReqType;
	type: 'basic' | 'advanced',
	disabled?: boolean;
}

export type mswReqType = MockedRequest<DefaultRequestBody> & {responseJson?: string};

export type groupsRequestType = Record<string, {data: IGroupDataItem[], isEnable: boolean}>;
