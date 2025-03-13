import { useEffect, useState } from "react";
import { Avatar, Card, CardContent, Stack, Typography } from "@mui/material";
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users'; // Thay biểu tượng

import axios from "axios"; // Để gọi API

const TotalCandidates = ({ diff, trend, sx }) => {
  const [candidateCount, setCandidateCount] = useState(0); // Sử dụng candidateCount để lưu số lượng ứng viên
  const [prevCandidateCount, setPrevCandidateCount] = useState(0); // Lưu số lượng ứng viên của tháng trước
  const [trendValue, setTrendValue] = useState(""); // Tăng/giảm (up/down)

  // Gọi API đếm số lượng ứng viên
  useEffect(() => {
    axios.get('http://localhost:9999/stats/candidate-count')  // API đếm số lượng ứng viên
      .then(response => {
        const currentCandidateCount = response.data;
        setCandidateCount(currentCandidateCount);

        // Tính sự thay đổi so với tháng trước
        const percentageDiff = prevCandidateCount ? ((currentCandidateCount - prevCandidateCount) / prevCandidateCount) * 100 : 0;
        setTrendValue(percentageDiff >= 0 ? 'up' : 'down');

        setPrevCandidateCount(currentCandidateCount); // Cập nhật candidateCount của tháng này làm tháng trước cho lần gọi tiếp theo
      })
      .catch(error => {
        console.error("Error fetching candidate count:", error);
      });
  }, [prevCandidateCount]);  // Chạy lại khi prevCandidateCount thay đổi

  const TrendIcon = trendValue === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trendValue === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';
  
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
            spacing={3}
          >
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Total Candidates {/* Thay "Total Customers" thành "Total Candidates" */}
              </Typography>
              <Typography variant="h4">{candidateCount}</Typography> {/* Hiển thị số lượng ứng viên */}
            </Stack>
            <Avatar
              sx={{
                backgroundColor: "var(--mui-palette-primary-main)",
                height: "56px",
                width: "56px",
              }}
            >
              <UsersIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {/* {diff ? (
            <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
              <Stack
                sx={{ alignItems: "center" }}
                direction="row"
                spacing={0.5}
              >
                <TrendIcon
                  color={trendColor}
                  fontSize="var(--icon-fontSize-md)"
                />
                <Typography color={trendColor} variant="body2">
                  {diff}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                Since last month
              </Typography>
            </Stack>
          ) : null} */}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TotalCandidates;
