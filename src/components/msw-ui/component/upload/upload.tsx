import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';
import './index.less';

export const Upload = (props: {
  callBack: (data: string) => void;
  btnText?: string;
  btnStyle?: React.CSSProperties;
  size?: 'small' | 'middle';
}) => {
  const { callBack, btnText, btnStyle, size = 'middle' } = props;
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const handleUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader(); //新建一个FileReader
      reader.readAsText(file, 'UTF-8'); //读取文件
      reader.onload = function (evt: ProgressEvent<FileReader>) {
        //读取完文件之后会回来这里
        const fileString = evt.target?.result; // 读取文件内容
        if (!fileString || typeof fileString !== 'string') return;
        try {
          const jsonData = JSON.parse(fileString);
          callBack(jsonData);
        } catch (e) {
          console.log(e);
        }
      };
    }
  };
  useEffect(() => {
    uploadRef.current?.addEventListener('change', handleUpload);
    return () => {
      uploadRef.current?.removeEventListener('change', handleUpload);
    };
  }, []);
  return (
    <button
      className={clsx('msw_upload_btn', {
        small: size === 'small',
      })}
      style={{ ...btnStyle }}
      onBlur={() => uploadRef.current && (uploadRef.current.value = '')}
    >
      {btnText || '上传json'}
      <input
        type="file"
        ref={uploadRef}
        className={clsx({
          small: size === 'small',
        })}
      />
    </button>
  );
};
