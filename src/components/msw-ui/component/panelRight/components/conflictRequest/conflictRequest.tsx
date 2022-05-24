import { observer } from 'mobx-react';
import React from 'react';

import { useStores } from '../../../../handles';
import { IGroupDataItem } from '../../../../handlesType';
import './index.less';

export const ConflictRequest = observer(
  (props: { data: Record<string, IGroupDataItem[]> }) => {
    const { store } = useStores();
    const { changeGroupItemStatus } = store;
    const { data } = props;
    return (
      <div style={{ padding: '0 10px', paddingTop: 10 }}>
        {Object.keys(data)?.map((im) => {
          return (
            <table
              className="msw_request_table"
              style={{ marginBottom: 20 }}
              key={im}
            >
              <thead>
                <tr>
                  <th>模块</th>
                  <th>组</th>
                  <th>url</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {data[im].map((im) => {
                  return (
                    <tr key={im.request.id + im.collection + im.group}>
                      <td>
                        <div className="msw_table_module" title={im.collection}>
                          {im.collection}
                        </div>
                      </td>
                      <td>
                        <div className="msw_table_module" title={im.group}>
                          {im.group}
                        </div>
                      </td>

                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 50,
                            marginRight: 10,
                            color: '#F89108',
                          }}
                        >
                          {im.request.method}
                        </span>
                        <span
                          className="msw_table_request msw_table_module_handle"
                          title={im.request.url.href}
                        >
                          {im.request.url.href}
                        </span>
                      </td>
                      <td>
                        <button
                          className="small msw_mock_btn msw_mock_canCelHandler_btn"
                          onClick={() => {
                            changeGroupItemStatus(im, false);
                          }}
                        >
                          取消拦截
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        }) || null}
      </div>
    );
  }
);
