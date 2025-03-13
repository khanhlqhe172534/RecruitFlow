import * as React from "react";

import { alpha, useTheme } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import { ArrowClockwise as ArrowClockwiseIcon } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { ArrowRight as ArrowRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import {  Paper, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import axios from "axios";

import Grid from '@mui/material/Grid2';

const formatLabels = (data) =>
  data.map((item) => `${item.year}-${item.month.toString().padStart(2, "0")}`);

const ChartCandidate = ({ chartSeries, sx }) => {
  const [candidateData, setCandidateData] = React.useState([]);

  React.useEffect(() => {
    axios.get("http://localhost:9999/stats/candidate-trend").then((res) => {
      setCandidateData(res.data);
    });
  }, []);
  const candidateChartData = {
    labels: formatLabels(candidateData),
    datasets: [
      {
        label: "Number of candidates",
        data: candidateData.map((item) => item.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card sx={sx}>
      <CardHeader
        action={
          <Button
            color="inherit"
            size="small"
            startIcon={
              <ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />
            }
          >
            Sync
          </Button>
        }
        title="📌 Number of candidates per month"
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Biểu đồ Number of candidates theo tháng */}
          <Grid item size={{ xs: 12, sm: 12, lg: 12 }} >
            <Paper
              className="p-3 shadow"
              style={{ height: "350px", maxWidth: "550px", margin: "auto" }}
            >
              <Bar
                style={{ padding: "20px" }}
                data={candidateChartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          color="inherit"
          endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
          size="small"
        >
          Overview
        </Button>
      </CardActions>
    </Card>
  );
};

export default ChartCandidate;
