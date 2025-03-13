import { Card, CardContent, CardHeader, Paper, Stack } from "@mui/material";
import Grid from "@mui/material/Grid2";
import axios from "axios";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
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
const ChartCandidateOffer = ({ chartSeries, sx }) => {
  const [offerStatusData, setOfferStatusData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:9999/stats/offer-status-trend").then((res) => {
      setOfferStatusData(res.data);
    });
  }, []);

  const stackedBarChartData = {
    labels: formatLabels(offerStatusData),
    datasets: statusLabels.map((status, index) => ({
      label: status,
      data: offerStatusData.map((item) => {
        const statusItem = item.statusBreakdown.find(
          (s) => s.status === status
        );
        return statusItem ? statusItem.percentage || 0 : 0;
      }),
      backgroundColor: colors[index],
    })),
  };

  return (
    <Card sx={sx}>
      <CardHeader title="📌 Offer status ratio" />
      <CardContent>
        <Stack spacing={2}>
          <Grid item xs={12} md={6} lg={6}>
            <Paper
              className="p-3 shadow"
              style={{ height: "350px", maxWidth: "550px", margin: "auto" }}
            >
              <Bar
                style={{ padding: "20px" }}
                data={stackedBarChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: { x: { stacked: true }, y: { stacked: true } },
                }}
              />
            </Paper>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ChartCandidateOffer;
