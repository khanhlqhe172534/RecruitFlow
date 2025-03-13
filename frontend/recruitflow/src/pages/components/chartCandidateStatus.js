
import { useEffect, useState } from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import { Paper, Stack, Typography } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import axios from "axios";
import { Desktop as DesktopIcon } from "@phosphor-icons/react/dist/ssr/Desktop";
import { DeviceTablet as DeviceTabletIcon } from "@phosphor-icons/react/dist/ssr/DeviceTablet";
import { Phone as PhoneIcon } from "@phosphor-icons/react/dist/ssr/Phone";
import Grid from "@mui/material/Grid2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // ✅ Đăng ký plugin hiển thị %
);

const iconMapping = {
  Desktop: DesktopIcon,
  Tablet: DeviceTabletIcon,
  Phone: PhoneIcon,
};

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

const formatLabels = (data) =>
  data.map((item) => `${item.year}-${item.month.toString().padStart(2, "0")}`);

const ChartCandidateStatus = ({ chartSeries, labels, sx }) => {
  const [candidateStatusData, setCandidateStatusData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:9999/stats/candidate-status").then((res) => {
      setCandidateStatusData(res.data);
    });
  }, []);
  
  const candidateStatusChartData = {
    labels: candidateStatusData.map((item) => item.statusName),
    datasets: [
      {
        label: "Number of candidates",
        data: candidateStatusData.map((item) => item.count),
        backgroundColor: colors.slice(0, candidateStatusData.length),
        hoverOffset: 4,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        color: "#fff",
        font: { weight: "bold", size: 14 },
        formatter: (value, ctx) => {
          let total = ctx.dataset.data.reduce((acc, val) => acc + val, 0);
          return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "";
        },
      },
    },
  }

  return (
    <Card sx={sx}>
      <CardHeader title="📌 Number of candidates by status" />
      <CardContent>
        <Stack spacing={2}>
          <Grid item xs={12} md={6} lg={6}>
            <Paper
              className="p-3 shadow"
              style={{ height: "350px", maxWidth: "550px", margin: "auto" }}
            >
              <Doughnut
                style={{ padding: "20px" }}
                data={candidateStatusChartData}
                options={doughnutOptions}
              />
            </Paper>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ChartCandidateStatus;
