import React from "react";
import { Bar as BarChart } from "react-chartjs";

import "./BookingsChart.css";

const BOOKING_BUCKETS = {
  Cheap: {
    min: 0,
    max: 100
  },
  Normal: {
    min: 100,
    max: 200
  },
  Expensive: {
    min: 200,
    max: 1000000
  }
};

const bookingsChart = props => {
  const chartData = { labels: [], datasets: [] };
  let values = [];

  for (const bucket in BOOKING_BUCKETS) {
    const filteredBookingsCount = props.bookingList.reduce((acc, current) => {
      if (
        current.event.price > BOOKING_BUCKETS[bucket].min &&
        current.event.price < BOOKING_BUCKETS[bucket].max
      ) {
        return acc + 1;
      } else {
        return acc;
      }
    }, 0);
    values.push(filteredBookingsCount);
    chartData.labels.push(bucket);
    chartData.datasets.push({
      // label: "My First dataset",
      fillColor: "rgba(220,220,220,0.5)",
      strokeColor: "rgba(220,220,220,0.8)",
      highlightFill: "rgba(220,220,220,0.75)",
      highlightStroke: "rgba(220,220,220,1)",
      data: values
    });
    values = [...values];
    values[values.length - 1] = 0;
  }
  console.log(chartData);

  return (
    <div className="chart-wrapper">
      <BarChart data={chartData} />
    </div>
  );
};

export default bookingsChart;
