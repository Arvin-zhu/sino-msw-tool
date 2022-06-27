import React, { ChangeEvent, forwardRef } from 'react';
import { useStores } from '../../handles';
import { getCollectionKeys, getGroupKeys } from '../../handlesFnc';
import { mswReqType } from '../../handlesType';
import { Input } from '../input/input';
import { SelectData } from '../select/select';
import { Upload } from '../upload/upload';

export const AddMockTextAreaComponent = forwardRef(
  (
    props: {
      request?: mswReqType | undefined;
      urlInput: string;
      setUrlInput: React.Dispatch<React.SetStateAction<string>>;
      changeGroupName: (name: string) => void;
      changeCollectionName: (name: string) => void;
      changeAliasName: (name: string) => void;
      collectionName: string;
      groupName: string;
      requestAlias: string;
      onStatusChange: (e: ChangeEvent<HTMLInputElement>) => void;
      statusCode?: string;
      setDelayRes: React.Dispatch<React.SetStateAction<string>>;
      delayRes: string;
      errorMsg: string;
      isEdit: boolean;
      saveData: (isSave?: boolean) => void;
      setShowSwaggerModal: React.Dispatch<React.SetStateAction<boolean>>;
      setTextJson: (data: string) => void;
    },
    ref
  ) => {
    const { store } = useStores();
    const {
      request,
      setTextJson,
      setShowSwaggerModal,
      isEdit,
      saveData,
      errorMsg,
      delayRes,
      setDelayRes,
      statusCode,
      onStatusChange,
      requestAlias,
      groupName,
      collectionName,
      urlInput,
      setUrlInput,
      changeGroupName,
      changeAliasName,
      changeCollectionName
    } = props;
    return (
      <div className={'msw_mock_detail_wrap'}>
        <div className="msw_mock_detail_wrap_top">
          <div className="msw_mock_detail_wrap_top_url">
            <div className="msw_mock_detail_wrap_top_url_method">
              {request?.method.toUpperCase()}
            </div>
            <div className="msw_mock_detail_wrap_top_url_href">
              <Input
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="msw_detail_section_title">配置：</div>
        <div style={{ padding: 10 }}>
          <div className="msw_mock_detail_wrap_config">
            <div className="msw_mock_detail_wrap_config_inner">
              <div className={'msw_group_input_wrap'}>
                <span>模块</span>
                <div className="msw_detailConfig_item">
                  <SelectData
                    placeholder="选择或输入新增"
                    data={Array.from(
                      new Set([...getCollectionKeys(store.groupRequest)])
                    )}
                    onChange={changeCollectionName}
                    value={collectionName}
                  />
                </div>
              </div>
              <div className={'msw_group_input_wrap'}>
                <span>组名：</span>
                <div className="msw_detailConfig_item">
                  <SelectData
                    placeholder="选择或输入新增"
                    data={getGroupKeys(store.groupRequest, collectionName)}
                    onChange={changeGroupName}
                    value={groupName}
                  />
                </div>
              </div>
              <div className={'msw_group_input_wrap'}>
                <span>请求别名：</span>
                <div className="msw_detailConfig_item">
                  <Input
                    placeholder="请输入请求别名"
                    onChange={e => changeAliasName(e.target.value)}
                    value={requestAlias}
                  />
                </div>
              </div>
              <div
                className={'msw_group_input_wrap'}
                style={{ marginLeft: 0, marginTop: 10 }}
              >
                <span>状态：</span>
                <div className="msw_detailConfig_item">
                  <Input
                    placeholder="请输入状态码"
                    onChange={onStatusChange}
                    value={statusCode || ''}
                  />
                </div>
              </div>
              <div className={'msw_group_input_wrap'} style={{ marginTop: 10 }}>
                <span>延迟：</span>
                <div className="msw_detailConfig_item">
                  <Input
                    placeholder="请输入延迟毫秒数"
                    onChange={e => setDelayRes(e.target.value)}
                    value={delayRes}
                  />
                </div>
              </div>
              <div className={'msw_group_input_wrap'} style={{ marginTop: 10 }}>
                <span>上传数据：</span>
                <div className="msw_detailConfig_item">
                  <Upload callBack={jsonData => setTextJson(jsonData)} />
                </div>
              </div>
              <div
                className={'msw_group_input_wrap'}
                style={{ marginTop: 10, marginLeft: 0 }}
              >
                <span>导入：</span>
                <div className="msw_detailConfig_item">
                  <button
                    className={'msw_config_btn'}
                    onClick={() => setShowSwaggerModal(true)}
                  >
                    从swagger导入
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="msw_detail_section_title">响应：</div>
        <div style={{ padding: 10 }}>
          <div className="msw_mock_content">
            {request && (
              <div className={'msw_jsonEditor_wrap'}>
                <div ref={ref as any} style={{ height: 550 }} />
                <div
                  style={{ marginTop: 10, textAlign: 'right' }}
                  className={'msw_save_btn_wrap'}
                >
                  {errorMsg && <span style={{ color: 'red' }}>{errorMsg}</span>}
                  {isEdit && (
                    <button onClick={() => saveData(true)}>另存副本</button>
                  )}
                  <button onClick={() => saveData()}>保存</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
