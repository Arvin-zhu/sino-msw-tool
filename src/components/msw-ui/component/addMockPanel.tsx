import clsx from "clsx";
import { observer } from "mobx-react";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";

import { useStores } from "../handles";
import { IGroupDataItem } from "../handlesType";

import { AddMockTextArea } from "./addMockTextArea";
import { Confirm } from "./confirm/confirm";
import { HostChange } from "./hostChange/hostChange";

export const AddMockPanel = observer(
  (props: { tableTab: "unHandle" | "handled" }) => {
    const { store } = useStores();
    const { tableTab } = props;
    const {
      filterKeywords,
      paginationMock,
      currentEditGroupRequest,
      unHandleAllRequest,
      handledAllRequest,
      changeGroupItemStatus,
      deleteGroupItem,
      currentHostSwitch,
      showConflictDetail,
    } = store;
    const [pageSize, setPageSize] = useState(1);
    const filterChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      store.setFilterKeyword(e.target.value);
      setPageSize(1);
    }, []);
    useEffect(() => {
      setPageSize(1);
      store.setFilterKeyword("");
    }, [tableTab]);
    const shouldNotShowTable =
      !currentEditGroupRequest && !showConflictDetail && !currentHostSwitch;
    if (
      !unHandleAllRequest?.length &&
      tableTab === "unHandle" &&
      shouldNotShowTable
    ) {
      return (
        <div className="msw_handle_noRequest" style={{ paddingTop: 10 }}>
          <div>暂无拦截的请求</div>
          <div>
            如果使用的是https,请确认https签名是否有效，
            <a
              target={"_blank"}
              href="https://mswjs.io/docs/recipes/using-local-https"
              rel="noreferrer"
            >
              详情地址
            </a>
          </div>
        </div>
      );
    }
    if (
      !handledAllRequest?.length &&
      tableTab === "handled" &&
      shouldNotShowTable
    ) {
      return (
        <div className="msw_handle_noRequest">
          <div style={{ paddingTop: 10 }}>暂无拦截中的请求</div>
        </div>
      );
    }
    return (
      <div>
        <div>
          {shouldNotShowTable && (
            <div style={{ padding: 10 }}>
              <div className={"msw_addMock_filter"}>
                <span>过滤: </span>
                <input
                  value={filterKeywords}
                  onChange={filterChange}
                  placeholder={"过滤拦截的请求"}
                />
              </div>
              <table className="msw_request_table">
                <thead>
                  <tr>
                    {tableTab !== "unHandle" && (
                      <>
                        <th>模块</th>
                        <th>组</th>
                        <th>别名</th>
                      </>
                    )}
                    <th>
                      {tableTab === "unHandle"
                        ? "未拦截的请求"
                        : "拦截中的请求"}
                    </th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginationMock?.[pageSize - 1]?.map((im: IGroupDataItem) => {
                    return (
                      <tr
                        key={im.request.id + im.collection + im.group + im.name}
                      >
                        {tableTab === "handled" && (
                          <>
                            <td>
                              <div
                                className="msw_table_module"
                                title={im.collection}
                              >
                                {im.collection}
                              </div>
                            </td>
                            <td>
                              <div
                                className="msw_table_module"
                                title={im.group}
                              >
                                {im.group}
                              </div>
                            </td>
                            <td>
                              <div className="msw_table_module" title={im.name}>
                                {im.name}
                              </div>
                            </td>
                          </>
                        )}
                        <td>
                          <span
                            style={{
                              display: "inline-block",
                              width: 50,
                              marginRight: 10,
                              color: "#F89108",
                            }}
                          >
                            {im.request.method}
                          </span>
                          <span
                            className={clsx("msw_table_request", {
                              msw_table_module_handle: tableTab === "handled",
                              msw_table_module_unHandle:
                                tableTab === "unHandle",
                            })}
                            title={im.request.url.href}
                          >
                            {im.request.url.href}
                          </span>
                        </td>
                        <td>
                          <div style={{ textAlign: "center" }}>
                            <button
                              className="msw_mock_btn small"
                              onClick={() => {
                                store.setCurrentEditGroupRequest(im);
                              }}
                            >
                              {tableTab === "unHandle" ? "mock" : "编辑"}
                            </button>
                            {tableTab === "handled" && (
                              <Confirm
                                content={
                                  <div style={{ textAlign: "left" }}>
                                    确定要删除吗
                                  </div>
                                }
                                placement="topRight"
                                onOk={() => {
                                  deleteGroupItem(im);
                                }}
                              >
                                <button className="small msw_mock_btn msw_mock_delete_btn">
                                  删除
                                </button>
                              </Confirm>
                            )}
                            {tableTab === "handled" && (
                              <button
                                className="small msw_mock_btn msw_mock_canCelHandler_btn"
                                onClick={() => {
                                  changeGroupItemStatus(im, false);
                                }}
                              >
                                取消拦截
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
                      !(
                        !!paginationMock?.length &&
                        pageSize < paginationMock?.length
                      )
                    }
                    className="small"
                  >
                    下一页
                  </button>
                </div>
              )}
            </div>
          )}
          {currentEditGroupRequest && (
            <AddMockTextArea
              key={
                (currentEditGroupRequest?.collection || "collection") +
                (currentEditGroupRequest?.group || "group") +
                (currentEditGroupRequest?.name || "request")
              }
              {...currentEditGroupRequest!}
            />
          )}
          {currentHostSwitch && <HostChange />}
        </div>
      </div>
    );
  }
);
