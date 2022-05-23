import clsx from 'clsx';
import React, { useState } from 'react';
import './index.less';

interface IDropdown {
  content: React.ReactElement;
  placement?: 'bottomRight' | 'bottomLeft' | 'right';
  trigger?: 'click' | 'hover';
}
export const Dropdown: React.FC<IDropdown> = (props) => {
  const [visible, setVisible] = useState(false);
  const { placement = 'bottomRight', trigger = 'click' } = props;
  return (
    <div className="msw_dropdown">
      {visible && (
        <div
          className="msw_dropdown_mask"
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
          }}
        ></div>
      )}
      <div
        onMouseEnter={() => {
          trigger === 'hover' && setVisible(true);
        }}
        onMouseLeave={() => {
          trigger === 'hover' && setVisible(false);
        }}
      >
        <span
          className="msw_dropdown_children"
          onClick={() => trigger === 'click' && setVisible(true)}
        >
          {props.children}
        </span>
        <div
          onClick={() => trigger === 'click' && setVisible(false)}
          className={clsx('msw_dropdown_panel', {
            show: visible,
            msw_dropdown_bottomRight: placement === 'bottomRight',
            msw_dropdown_bottomLeft: placement === 'bottomLeft',
            msw_dropdown_right: placement === 'right',
          })}
        >
          <div>{props.content}</div>
        </div>
      </div>
    </div>
  );
};
