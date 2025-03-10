import { Card, CardContent, CardHeader, Paper, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import axios from "axios";
import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
const formatLabels = (data) =>
  data.map((item) => `${item.year}-${item.month.toString().padStart(2, "0")}`);
const statusLabels = [
  "reject",
  "accept",
  "open",
  "closed",
  "cancel",
  "waiting for approved",
];

const colors = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#8A2BE2",
];
const ChartTimes = ({ chartSeries, sx }) => {
  const [hiringTimeData, setHiringTimeData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:9999/stats/avg-hiring-time-trend")
      .then((res) => {
        setHiringTimeData(res.data);
      });
  }, []);

  const hiringTimeChartData = {
    labels: formatLabels(hiringTimeData),
    datasets: [
      {
        label: "Thời gian trung bình tuyển dụng (ngày)",
        data: hiringTimeData.map((item) => item.avgDaysToHire),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <Card sx={sx}>
      <CardHeader title="📌 Thời gian trung bình tuyển dụng" />
      <CardContent>
        <Stack spacing={2}>
          <Grid item xs={12} md={6} lg={6}>
            <Paper
              className="p-3 shadow"
              style={{ height: "350px", maxWidth: "550px", margin: "auto" }}
            >
              <Line data={hiringTimeChartData} />
            </Paper>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ChartTimes;
