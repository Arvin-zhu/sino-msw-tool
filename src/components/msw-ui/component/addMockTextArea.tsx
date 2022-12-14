import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.min.css';
import { cloneDeep } from 'lodash';
import { observer } from 'mobx-react';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

import { useStores } from '../handles';
import { checkRequestDuplicateInGroup } from '../handlesFnc';
import { IGroupDataItem } from '../handlesType';
import { AddMockTextAreaComponent } from './addMockTextAreaComponent';
import { SwaggerUrlInputModal } from './addMockTextAreaComponent/components/swaggerUrlInput';

export const AddMockTextArea = observer((data: Partial<IGroupDataItem>) => {
  const { request, group, status, collection, name, delay = '0', disabled } = data;
  const { store } = useStores();
  const { addSimpleMock, setCurrentEditGroupRequest, groupRequest } = store;
  const editor = useRef<JSONEditor | null>(null);
  const editorContainer = useRef<HTMLDivElement | null>(null);
  const [statusCode, setStatusCode] = useState<string | undefined>(status || '200');
  const [errorMsg, setErrorMsg] = useState('');
  const [groupName, setGroupName] = useState(group || '');
  const [collectionName, setCollectionName] = useState(collection || '');
  const [requestAlias, setRequestAlias] = useState(name || '');
  const [delayRes, setDelayRes] = useState(delay);
  const [urlInput, setUrlInput] = useState(request?.url.href || '');
  const [showSwaggerModal, setShowSwaggerModal] = useState(false);
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
        mode: 'code',
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
        setErrorMsg('?????????url');
        return;
      }
      if (errors?.length) {
        setErrorMsg('json ?????????');
        return;
      }
      if (!collectionName.trim()) {
        setErrorMsg('?????????????????????!');
        return;
      }
      if (!groupName.trim()) {
        setErrorMsg('?????????????????????!');
        return;
      }
      if (!statusCode?.trim()) {
        setErrorMsg('?????????????????????');
        return;
      }
      if (!collectionName.trim()) {
        setErrorMsg('????????????????????????');
        return;
      }
      if (!requestAlias.trim()) {
        setErrorMsg('????????????????????????');
        return;
      }
      if (errors?.length || !request) {
        return;
      }
      if (Number(delayRes) < 0 || isNaN(Number(delayRes))) {
        setErrorMsg('??????????????????????????????');
        return;
      }
      const newRequestData = {
        type: 'basic',
        group: groupName.trim(),
        status: statusCode.trim(),
        collection: collectionName.trim(),
        name: requestAlias.trim(),
        disabled: false,
        request,
        delay: delayRes,
      } as IGroupDataItem;
      //??????????????????????????????????????????????????????????????????????????????
      if ((isSaveAs || !isEdit) && checkRequestDuplicateInGroup(groupRequest, newRequestData)) {
        setErrorMsg('???????????????????????????????????????');
        return;
      }
      //?????????????????????????????????????????????????????????????????????????????????
      if (
        isEdit &&
        (collection !== newRequestData.collection ||
          group !== newRequestData.group ||
          name !== newRequestData.name) &&
        checkRequestDuplicateInGroup(groupRequest, newRequestData)
      ) {
        setErrorMsg('???????????????????????????????????????');
        return;
      }
      if (isSaveAs) {
        //???????????????????????????????????????
        const data = editor.current?.get();
        const requestSaveAs = cloneDeep(request);
        try {
          requestSaveAs.url = new URL(urlInput);
          requestSaveAs.responseJson = data;
          newRequestData.request = requestSaveAs;
          newRequestData.disabled = !!disabled;
          //???????????????????????????????????????
          !disabled && (newRequestData.track = true);
          addSimpleMock(newRequestData, false);
          setCurrentEditGroupRequest(undefined);
        } catch (e) {
          setErrorMsg('url ?????????');
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
          //???????????????????????????????????????
          !newRequestData.disabled && (newRequestData.track = true);
          addSimpleMock(newRequestData, isEdit);
          setCurrentEditGroupRequest(undefined);
        } catch (e) {
          setErrorMsg('url ?????????');
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
    ],
  );
  const setTextJson = useCallback((data) => {
    editor.current?.set(data);
  }, []);
  useEffect(() => {
    setErrorMsg('');
  }, [delayRes, groupName, statusCode, collectionName, requestAlias, urlInput]);
  const onStatusChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setStatusCode(e.target.value);
  }, []);
  return (
    <>
      <AddMockTextAreaComponent
        ref={editorContainer}
        request={request}
        urlInput={urlInput}
        setUrlInput={setUrlInput}
        changeGroupName={changeGroupName}
        changeCollectionName={changeCollectionName}
        changeAliasName={changeAliasName}
        collectionName={collectionName}
        groupName={groupName}
        requestAlias={requestAlias}
        onStatusChange={onStatusChange}
        statusCode={statusCode}
        setDelayRes={setDelayRes}
        delayRes={delayRes}
        errorMsg={errorMsg}
        isEdit={isEdit}
        setTextJson={setTextJson}
        saveData={saveData}
        setShowSwaggerModal={setShowSwaggerModal}
      />
      <SwaggerUrlInputModal
        setTextJson={setTextJson}
        request={request}
        visible={showSwaggerModal}
        setVisible={setShowSwaggerModal}
      />
    </>
  );
});
