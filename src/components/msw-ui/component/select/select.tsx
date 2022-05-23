import React, { useState } from 'react';

import { IGroupDataItem } from '../../handlesType';
import './index.less';

export type operationClickType = (data: {
  type: 'edit' | 'delete' | 'enable' | 'disabled';
  groupDataItem: IGroupDataItem;
}) => void;

interface ISelectData {
  onChange: (value: string) => void;
  data: string[];
  value: string;
  disabled?: boolean;
  placeholder?: string;
}

export const SelectData = (props: ISelectData) => {
  const { data, onChange, value = '', disabled, placeholder } = props;
  const [visible, setVisible] = useState(false);
  return (
    <div className="msw_select">
      <div
        className="msw_select_input"
        onClick={() => !disabled && setVisible(true)}
      >
        <input
          disabled={!!disabled}
          placeholder={placeholder || '分组名称'}
          value={value}
          onChange={(e) => !disabled && onChange(e.target.value)}
        />
      </div>
      <div
        className={`msw_select_mask ${visible ? 'show' : ''}`}
        onClick={() => setVisible(false)}
      />
      {!!data?.length && (
        <div className={`msw_select_dropdown ${visible ? 'show' : ''}`}>
          {data?.map((im, index) => {
            return (
              <div
                className="msw_select_dropdown_item"
                key={im}
                onClick={() => {
                  !disabled && onChange(im);
                  setVisible(false);
                }}
              >
                <span className="msw_select_dropdown_item_operation_label_wrap">
                  <span className="msw_select_dropdown_item_operation_label">
                    {im}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
