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
  Legend,
} from "chart.js";

// ✅ Import plugin hiển thị số % trên Doughnut Chart
import ChartDataLabels from "chartjs-plugin-datalabels";

// ✅ Import MUI Components
import {  Paper, Typography, Container } from "@mui/material";
import "bootstrap/dist/css/bootstrap.min.css"; // ✅ Import Bootstrap
import Budget from "./components/jobCount";
import TotalCustomers from "./components/TotalCandidates";
import Tasks from "./components/task";
import ChartCandidate from "./components/chartCandidate";
import Grid from '@mui/material/Grid2';
import ChartCandidateStatus from "./components/chartCandidateStatus";
import ChartCandidateOffer from "./components/chartCandidateOffer";
import ChartTimes from "./components/chartTime";
const RecruitmentDashboard = () => {
  return (
    <Grid container spacing={3} margin={4} >
      <Grid size={{ xs: 12, sm: 6, lg: 4 }} >
        {/* Sửa value thành response sau khi call api */}
        <Budget diff={12} trend="up" sx={{ height: '100%' }} value="$24k" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 4 }} >
        {/* Sửa value thành response sau khi call api */}
        <TotalCustomers diff={16} trend="down" sx={{ height: '100%' }} value="1.6k" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 , lg: 4}} >
        {/* Sửa value thành response sau khi call api */}
        <Tasks sx={{ height: '100%' }} value={75.5} />
      </Grid>
      
      <Grid size={{ xs: 12, sm: 12, lg: 7 }}>
        <ChartCandidate
          sx={{ height: '100%' }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 12, lg: 5 }}>
        <ChartCandidateStatus  sx={{ height: '100%' }} />
      </Grid>

      <Grid size={{ xs: 12, sm: 12, lg: 6 }}>
        <ChartCandidateOffer sx={{ height: '100%' }} />
      </Grid>

      <Grid size={{ xs: 12, sm: 12, lg: 6 }}>
        <ChartTimes sx={{ height: '100%' }} />
      </Grid>
      
    </Grid>
  );
};

export default RecruitmentDashboard;
