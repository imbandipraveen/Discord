import React from "react";
import loadingcss from "./loading.module.css";

function Loading() {
  return (
    <div className={loadingcss.main}>
      <div className={loadingcss.loader_wrapper}>
        <span className={loadingcss.loader}></span>
      </div>
    </div>
  );
}

export default Loading;
