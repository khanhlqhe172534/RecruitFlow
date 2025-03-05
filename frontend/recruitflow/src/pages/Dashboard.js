import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Doughnut, Line } from "react-chartjs-2";
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
  Legend
} from "chart.js";

// ✅ Import plugin hiển thị số % trên Doughnut Chart
import ChartDataLabels from "chartjs-plugin-datalabels";

// ✅ Import MUI Components
import { Grid, Paper, Typography, Container } from "@mui/material";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Import Bootstrap

// Đăng ký các thành phần của Chart.js
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

const RecruitmentDashboard = () => {
  const [candidateData, setCandidateData] = useState([]);
  const [hiringTimeData, setHiringTimeData] = useState([]);
  const [offerStatusData, setOfferStatusData] = useState([]);
  const [candidateStatusData, setCandidateStatusData] = useState([]); // ✅ Dữ liệu ứng viên theo trạng thái

  useEffect(() => {
    axios.get("http://localhost:9999/stats/candidate-trend").then((res) => {
      setCandidateData(res.data);
    });

    axios.get("http://localhost:9999/stats/avg-hiring-time-trend").then((res) => {
      setHiringTimeData(res.data);
    });

    axios.get("http://localhost:9999/stats/offer-status-trend").then((res) => {
      setOfferStatusData(res.data);
    });

    axios.get("http://localhost:9999/stats/candidate-status").then((res) => {
      setCandidateStatusData(res.data);
    });
  }, []);

  const formatLabels = (data) =>
    data.map((item) => `${item.year}-${item.month.toString().padStart(2, "0")}`);

  const statusLabels = [
    "reject",
    "accept",
    "open",
    "closed",
    "cancel",
    "waiting for approved"
  ];
  const colors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#8A2BE2"
  ];

  const hiringTimeChartData = {
    labels: formatLabels(hiringTimeData),
    datasets: [
      {
        label: "Thời gian trung bình tuyển dụng (ngày)",
        data: hiringTimeData.map((item) => item.avgDaysToHire),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
        tension: 0.3
      }
    ]
  };

  const candidateStatusChartData = {
    labels: candidateStatusData.map((item) => item.statusName),
    datasets: [
      {
        label: "Số lượng ứng viên",
        data: candidateStatusData.map((item) => item.count),
        backgroundColor: colors.slice(0, candidateStatusData.length),
        hoverOffset: 4
      }
    ]
  };

  const candidateChartData = {
    labels: formatLabels(candidateData),
    datasets: [
      {
        label: "Số lượng ứng viên",
        data: candidateData.map((item) => item.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

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
      backgroundColor: colors[index]
    }))
  };

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
        }
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" align="center" gutterBottom className="mt-3 mb-5"> 
        📊 Recruitment Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Biểu đồ số lượng ứng viên theo tháng */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper className="p-3 shadow" style={{ height: "350px", maxWidth: "550px", margin: "auto" }}>
            <Typography variant="h6" align="center">📌 Số lượng ứng viên theo tháng</Typography>
            <Bar style={{padding: "20px"}} data={candidateChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </Paper>
        </Grid>

        {/* Biểu đồ số lượng ứng viên theo trạng thái */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper className="p-3 shadow" style={{ height: "350px", maxWidth: "550px", margin: "auto" }}>
            <Typography variant="h6" align="center">📌 Số lượng ứng viên theo trạng thái</Typography>
            <Doughnut style={{padding: "20px"}} data={candidateStatusChartData} options={doughnutOptions} />
          </Paper>
        </Grid>

        {/* Biểu đồ thời gian trung bình tuyển dụng */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper className="p-3 shadow" style={{ height: "350px", maxWidth: "550px", margin: "auto" }}>
            <Typography variant="h6" align="center">📌 Thời gian trung bình tuyển dụng</Typography>
            <Line data={hiringTimeChartData} />
          </Paper>
        </Grid>

        {/* Biểu đồ tỷ lệ trạng thái Offer */}
        <Grid item xs={12} md={6} lg={6}>
          <Paper className="p-3 shadow" style={{ height: "350px", maxWidth: "550px", margin: "auto" }}>
            <Typography variant="h6" align="center">📌 Tỷ lệ trạng thái Offer</Typography>
            <Bar style={{padding: "20px"}} data={stackedBarChartData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RecruitmentDashboard;
