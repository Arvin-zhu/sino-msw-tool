import { observer } from 'mobx-react';
import React, { ChangeEvent, useCallback, useState } from 'react';

import { useStores } from '../handles';

import { AddMockTextArea } from './addMockTextArea';

const EmptyIcon = require('../images/empty.svg');

export const AddMockPanel = observer(() => {
  const { store } = useStores();
  const { filterKeywords, paginationMock } = store;
  const [isAdd, setIsAdd] = useState(false);
  const [pageSize, setPageSize] = useState(1);
  const filterChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    store.setFilterKeyword(e.target.value);
    setPageSize(1);
  }, []);
  return (
    <div>
      <div>
        <div className={'msw_addMock_filter'}>
          <span>过滤: </span>
          <input
            value={filterKeywords}
            onChange={filterChange}
            placeholder={'过滤拦截的请求'}
          />
        </div>
        <table className="msw_request_table">
          <thead>
            <tr>
              <th>未拦截的请求</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {paginationMock?.[pageSize - 1]?.map((im) => {
              return (
                <tr key={im.id}>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 50,
                        marginRight: 10,
                      }}
                    >
                      {im.method}
                    </span>
                    <span className="msw_table_request">{im.url.pathname}</span>
                  </td>
                  <td>
                    <div style={{ textAlign: 'center' }}>
                      <button
                        className="small"
                        onClick={() => {
                          setIsAdd(true);
                          store.setCurrentEditMock(im);
                        }}
                      >
                        mock
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!store.unHandleAllRequest?.length && (
          <div className={'msw_table_empty'}>
            <img src={EmptyIcon} alt={'empty'} />
            <div>暂无拦截的请求</div>
          </div>
        )}
        {paginationMock.length > 1 && (
          <div className="msw_pagination_wrap">
            <button
              onClick={() => {
                pageSize > 1 && setPageSize((page) => page - 1);
              }}
              disabled={pageSize === 1}
              className="small"
            >
              上一页
            </button>
            <button
              onClick={() => {
                pageSize < paginationMock?.length &&
                  setPageSize((page) => page + 1);
              }}
              disabled={
                !(!!paginationMock?.length && pageSize < paginationMock?.length)
              }
              className="small"
            >
              下一页
            </button>
          </div>
        )}
        {store.currentEditGroupRequest && (
          <div style={{ marginTop: 20 }}>
            <AddMockTextArea
              isAdd={isAdd}
              {...store.currentEditGroupRequest!}
            />
          </div>
        )}
      </div>
    </div>
  );
});
