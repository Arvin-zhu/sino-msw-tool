import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.min.css";
import { cloneDeep } from "lodash";
import { observer } from "mobx-react";
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useStores } from "../handles";
import {
  checkRequestDuplicateInGroup,
  getCollectionKeys,
  getGroupKeys,
} from "../handlesFnc";
import { IGroupDataItem } from "../handlesType";

import { Input } from "./input/input";
import { SelectData } from "./select/select";
import { Upload } from "./upload/upload";

export const AddMockTextArea = observer((data: Partial<IGroupDataItem>) => {
  const {
    request,
    group,
    status,
    collection,
    name,
    delay = "0",
    disabled,
  } = data;
  const { store } = useStores();
  const { addSimpleMock, setCurrentEditGroupRequest, groupRequest } = store;
  const editor = useRef<JSONEditor | null>(null);
  const editorContainer = useRef<HTMLDivElement | null>(null);
  const editorContainerRoot = useRef<HTMLDivElement | null>(null);
  const [statusCode, setStatusCode] = useState<string | undefined>(
    status || "200"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [groupName, setGroupName] = useState(group || "");
  const [collectionName, setCollectionName] = useState(collection || "");
  const [requestAlias, setRequestAlias] = useState(name || "");
  const [delayRes, setDelayRes] = useState(delay);
  const [urlInput, setUrlInput] = useState(request?.url.href || "");
  const isEdit = !!name;
  const changeGroupName = useCallback((value: string) => {
    setGroupName(value);
  }, []);
  const changeCollectionName = useCallback((name: string) => {
    setCollectionName(name);
  }, []);
  const changeAliasName = useCallback((name: string) => {
    setRequestAlias(name);
  }, []);
  useEffect(() => {
    request?.url.href && setUrlInput(request?.url.href);
  }, [request?.id]);
  useEffect(() => {
    if (editorContainer.current) {
      editor.current = new JSONEditor(editorContainer.current, {
        mode: "code",
        enableSort: false,
        enableTransform: false,
      });
    }
    return () => {
      editor.current?.destroy();
    };
  }, []);
  useEffect(() => {
    request?.responseJson && editor.current?.set(request.responseJson);
  }, [request]);
  const saveData = useCallback(
    async (isSaveAs?: boolean) => {
      const errors = await editor.current?.validate();
      if (!urlInput.trim()) {
        setErrorMsg("请输入url");
        return;
      }
      if (errors?.length) {
        setErrorMsg("json 不合法");
        return;
      }
      if (!groupName.trim()) {
        setErrorMsg("请输入分组名称!");
        return;
      }
      if (!statusCode?.trim()) {
        setErrorMsg("请输入状态码！");
        return;
      }
      if (!collectionName.trim()) {
        setErrorMsg("请输入环境名称！");
        return;
      }
      if (!requestAlias.trim()) {
        setErrorMsg("请输入请求别名！");
        return;
      }
      if (errors?.length || !request) {
        return;
      }
      if (Number(delayRes) < 0 || isNaN(Number(delayRes))) {
        setErrorMsg("请输入正确的延迟秒数");
        return;
      }
      const newRequestData = {
        type: "basic",
        group: groupName.trim(),
        status: statusCode.trim(),
        collection: collectionName.trim(),
        name: requestAlias.trim(),
        disabled: false,
        request,
        delay: delayRes,
      } as IGroupDataItem;
      //如果是保存副本或者是新增，检查保存到的地方是否有重复
      if (
        (isSaveAs || !isEdit) &&
        checkRequestDuplicateInGroup(groupRequest, newRequestData)
      ) {
        setErrorMsg("分组下已存在相同命名的请求");
        return;
      }
      //如果是移动编辑或者别名修改，检查移动到的地方是否有重复
      if (
        isEdit &&
        (collection !== newRequestData.collection ||
          group !== newRequestData.group ||
          name !== newRequestData.name) &&
        checkRequestDuplicateInGroup(groupRequest, newRequestData)
      ) {
        setErrorMsg("分组下已存在相同命名的请求");
        return;
      }
      if (isSaveAs) {
        //另存副本理解为就是一个新增
        const data = editor.current?.get();
        const requestSaveAs = cloneDeep(request);
        try {
          requestSaveAs.url = new URL(urlInput);
          requestSaveAs.responseJson = data;
          newRequestData.request = requestSaveAs;
          newRequestData.disabled = !!disabled;
          addSimpleMock(newRequestData, false);
          setCurrentEditGroupRequest(undefined);
        } catch (e) {
          setErrorMsg("url 不合法");
        }
      } else {
        const data = editor.current?.get();
        try {
          if (!isEdit) {
            newRequestData.request = cloneDeep(request);
          }
          newRequestData.request.url = new URL(urlInput);
          newRequestData.request.responseJson = data;
          newRequestData.disabled = isEdit ? !!disabled : false;
          addSimpleMock(newRequestData, isEdit);
          setCurrentEditGroupRequest(undefined);
        } catch (e) {
          setErrorMsg("url 不合法");
        }
      }
    },
    [
      delayRes,
      request,
      groupName,
      statusCode,
      collectionName,
      requestAlias,
      urlInput,
      isEdit,
      groupRequest,
      disabled,
      collection,
      group,
      name,
    ]
  );
  useEffect(() => {
    setErrorMsg("");
  }, [delayRes, groupName, statusCode, collectionName, requestAlias, urlInput]);
  const onStatusChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setStatusCode(e.target.value);
  }, []);
  return (
    <div className={"msw_mock_detail_wrap"}>
      <div className="msw_mock_detail_wrap_top">
        <div className="msw_mock_detail_wrap_top_url">
          <div className="msw_mock_detail_wrap_top_url_method">
            {request?.method.toUpperCase()}
          </div>
          <div className="msw_mock_detail_wrap_top_url_href">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="msw_detail_section_title">配置：</div>
      <div style={{ padding: 10 }}>
        <div className="msw_mock_detail_wrap_config">
          <div className="msw_mock_detail_wrap_config_inner">
            <div className={"msw_group_input_wrap"}>
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
            <div className={"msw_group_input_wrap"}>
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
            <div className={"msw_group_input_wrap"}>
              <span>请求别名：</span>
              <div className="msw_detailConfig_item">
                <Input
                  placeholder="请输入请求别名"
                  onChange={(e) => changeAliasName(e.target.value)}
                  value={requestAlias}
                />
              </div>
            </div>
            <div
              className={"msw_group_input_wrap"}
              style={{ marginLeft: 0, marginTop: 10 }}
            >
              <span>状态：</span>
              <div className="msw_detailConfig_item">
                <Input
                  placeholder="请输入状态码"
                  onChange={onStatusChange}
                  value={statusCode || ""}
                />
              </div>
            </div>
            <div className={"msw_group_input_wrap"} style={{ marginTop: 10 }}>
              <span>延迟：</span>
              <div className="msw_detailConfig_item">
                <Input
                  placeholder="请输入延迟毫秒数"
                  onChange={(e) => setDelayRes(e.target.value)}
                  value={delayRes}
                />
              </div>
            </div>
            <div className={"msw_group_input_wrap"} style={{ marginTop: 10 }}>
              <span>上传数据：</span>
              <div className="msw_detailConfig_item">
                <Upload
                  callBack={(jsonData) => editor.current?.set(jsonData)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="msw_detail_section_title">响应：</div>
      <div style={{ padding: 10 }}>
        <div className="msw_mock_content">
          {request && (
            <div ref={editorContainerRoot} className={"msw_jsonEditor_wrap"}>
              <div ref={editorContainer} style={{ height: 550 }} />
              <div
                style={{ marginTop: 10, textAlign: "right" }}
                className={"msw_save_btn_wrap"}
              >
                {errorMsg && <span style={{ color: "red" }}>{errorMsg}</span>}
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
});
