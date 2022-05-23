import React from 'react';
import './index.less';

export const Header = (props: {
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { setShowDetail } = props;
  return (
    <div className="msw_header">
      <div>
        {/* <Input style={{ width: 500 }} placeholder="全局搜索接口" /> */}
      </div>
      <div className="msw_close" onClick={() => setShowDetail(false)}>
        X
      </div>
    </div>
  );
};
