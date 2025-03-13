import { useEffect, useState } from "react";
import { Avatar, Card, CardContent, LinearProgress, Stack, Typography } from "@mui/material";
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { ListBullets as ListBulletsIcon } from '@phosphor-icons/react/dist/ssr/ListBullets';
import axios from "axios"; // Để gọi API

const OfferAcceptanceRate = ({ sx }) => {
  const [acceptanceRate, setAcceptanceRate] = useState(0); // Tỷ lệ chấp nhận offer
  const [prevAcceptanceRate, setPrevAcceptanceRate] = useState(0); // Lưu tỷ lệ offer của tháng trước
  const [diff, setDiff] = useState(0); // Sự thay đổi phần trăm
  const [trend, setTrend] = useState(""); // Tăng/giảm (up/down)

  // Gọi API để lấy tỷ lệ chấp nhận offer
  useEffect(() => {
    axios.get("http://localhost:9999/stats/offer-acceptance-rate")  // API đếm tỷ lệ chấp nhận offer
      .then(response => {
        const currentAcceptanceRate = response.data.acceptanceRate;
        setAcceptanceRate(currentAcceptanceRate);

        // Tính sự thay đổi so với tháng trước
        const percentageDiff = prevAcceptanceRate ? ((currentAcceptanceRate - prevAcceptanceRate) / prevAcceptanceRate) * 100 : 0;
        setDiff(percentageDiff.toFixed(2));

        // Đặt hướng tăng giảm (up/down)
        setTrend(percentageDiff >= 0 ? 'up' : 'down');

        setPrevAcceptanceRate(currentAcceptanceRate); // Cập nhật tỷ lệ chấp nhận offer của tháng này làm tháng trước cho lần gọi tiếp theo
      })
      .catch(error => {
        console.error("Error fetching acceptance rate:", error);
      });
  }, [prevAcceptanceRate]);  // Chạy lại khi prevAcceptanceRate thay đổi

  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';
  
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
                Offer Acceptance Rate {/* Thay "Task Progress" thành "Offer Acceptance Rate" */}
              </Typography>
              <Typography variant="h4">{acceptanceRate}%</Typography> {/* Hiển thị tỷ lệ chấp nhận offer */}
            </Stack>
            <Avatar
              sx={{
                backgroundColor: "var(--mui-palette-primary-main)",
                height: "56px",
                width: "56px",
              }}
            >
              <ListBulletsIcon fontSize="var(--icon-fontSize-lg)" />
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
          <LinearProgress value={acceptanceRate} variant="determinate" />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default OfferAcceptanceRate;
