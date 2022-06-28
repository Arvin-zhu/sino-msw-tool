import React, { useCallback, useEffect, useState } from 'react';
import { Input } from '../../../input/input';
import { parser } from '../../../../swaggerParseMock/index';
import { Modal } from '../../../modal/modal';
import { mswReqType } from '../../../../handlesType';
import './index.less';
import mockJs from 'mockjs';
import { useStores } from '../../../../handles';
import { Button } from '../../../button';

export const SwaggerUrlInputModal = (props: {
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  request?: mswReqType | undefined;
  setTextJson: (data: string) => void;
}) => {
  const { store } = useStores();
  const { changeSwaggerUrl, storageSwagger } = store;
  const { visible, setVisible, request, setTextJson } = props;
  const [mockUrl, setMockUrl] = useState(request?.url.pathname);
  const [error, setError] = useState('');
  const [swaggerUrl, setSwaggerUrl] = useState(storageSwagger);
  const [urlPaths, setUrlPaths] = useState<Record<string, any>>({});

  const selectSwagger = useCallback(path => {
    const api = path['post'];
    const example = api.responses['200'].example;
    if (example) {
      try {
        const mockData = mockJs.mock(JSON.parse(example));
        setTextJson(mockData);
        setError('');
        setVisible(false);
      } catch (e) {
        setError('swagger数据解析出错');
      }
    } else {
      setError('未找到swagger相关example');
    }
  }, []);

  const getParserFromSwagger = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!swaggerUrl) {
        setError('请输入swaggerUrl地址');
        reject('');
        return;
      }
      if (!mockUrl) {
        setError('请输入mock地址');
        reject('');
        return;
      }
      parser(swaggerUrl, undefined, mockUrl)
        .then((docs: any) => {
          const requestPath = mockUrl;
          if (!requestPath) {
            setError('请先输入mock的url');
            reject('');
            return;
          }
          const findPath = Object.keys(docs.paths).filter((im: string) =>
            im.includes(requestPath)
          );
          if (!findPath?.length) {
            setError('swagger接口定义中未找到相关url,请确认地址是否正确');
            reject('');
            return;
          }
          if (findPath.length > 1) {
            setError('匹配到多个地址，请选择');
            setUrlPaths(docs.paths);
            reject('');
            return;
          }
          setUrlPaths({});
          const api = docs.paths[findPath[0]]['post'];
          const example = api.responses['200'].example;
          if (example) {
            try {
              const mockData = mockJs.mock(JSON.parse(example));
              setTextJson(mockData);
              setError('');
              setVisible(false);
              resolve('');
            } catch (e) {
              setError('swagger数据解析出错');
              reject('');
            }
          } else {
            setError('未找到swagger相关example');
            reject('');
          }
        })
        .catch((e: any) => {
          setError('swagger接口解析失败');
          reject('');
        });
    });
  }, [swaggerUrl, mockUrl, setTextJson]);
  useEffect(() => {
    setError('');
    setUrlPaths({});
  }, [mockUrl, swaggerUrl]);
  useEffect(() => {
    setSwaggerUrl(storageSwagger);
  }, [storageSwagger]);
  return (
    <Modal
      visible={visible}
      width={600}
      error={error}
      title={
        <div>
          <div className={'msw_swagger_label'}>
            mock pathname：(用于匹配swagger的path)
          </div>
          <Input
            placeholder={'请输入mock的pathname'}
            value={mockUrl}
            onChange={e => setMockUrl(e.target.value)}
          />
          <div className={'msw_swagger_label'} style={{ marginTop: 5 }}>
            swagger地址：
          </div>
          <Input
            onBlur={e => changeSwaggerUrl(swaggerUrl)}
            placeholder={'请输入mock的pathname'}
            value={swaggerUrl}
            onChange={e => setSwaggerUrl(e.target.value)}
          />
          {Object.keys(urlPaths)?.length > 1 && (
            <div>
              <div className={'msw_swagger_match_multi_label'}>
                匹配到多个地址，请选择其中一个
              </div>
              <div className={'msw_swagger_url_itemWrap'}>
                {Object.keys(urlPaths).map(path => {
                  return (
                    <div key={path} className={'msw_swagger_url_item'}>
                      <span title={path} className={'msw_swagger_url_path'}>
                        {path}
                      </span>
                      <Button
                        onClick={() => {
                          selectSwagger(urlPaths[path]);
                        }}
                        size={'small'}
                      >
                        使用
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      }
      onOk={getParserFromSwagger}
      onCancel={() => setVisible(false)}
    ></Modal>
  );
};
