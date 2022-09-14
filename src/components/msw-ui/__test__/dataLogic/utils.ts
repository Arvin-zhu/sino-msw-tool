import { HandlerMock } from '@/components/msw-ui/handles';
import { importStorageGroupData } from '@/components/msw-ui/handlesFnc';

const mockJson = require('../utils/unhandleRequest.json');

export function testPanelLeftGroupDataInit(handlerMock: HandlerMock) {
  const formatData = importStorageGroupData(mockJson);
  handlerMock.resetHandlers(formatData);
  handlerMock.groupRequest = formatData;
}
