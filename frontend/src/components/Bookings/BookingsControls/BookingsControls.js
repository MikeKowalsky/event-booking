import React from "react";
import "./BookingsControls.css";

const bookingsControls = props => {
  return (
    <div className="bookingsControls">
      <button
        className={props.outputType === "list" ? "active" : ""}
        onClick={props.onChange.bind(this, "list")}
      >
        List
      </button>
      <button
        className={props.outputType === "chart" ? "active" : ""}
        onClick={props.onChange.bind(this, "chart")}
      >
        Chart
      </button>
    </div>
  );
};

export default bookingsControls;
