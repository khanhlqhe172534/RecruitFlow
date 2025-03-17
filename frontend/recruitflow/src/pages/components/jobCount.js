// import { Avatar, Card, CardContent, Stack, Typography } from "@mui/material";
// import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
// import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
// import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';

// const Budget = ({diff, sx, trend, value}) => {
//     const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
//     const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

//   return (
//     <Card sx={sx}>
//       <CardContent>
//         <Stack spacing={3}>
//           <Stack
//             direction="row"
//             sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
//             spacing={3}
//           >
//             <Stack spacing={1}>
//               <Typography color="text.secondary" variant="overline">
//                 Budget
//               </Typography>
//               <Typography variant="h4">{value}</Typography>
//             </Stack>
//             <Avatar
//               sx={{
//                 backgroundColor: "var(--mui-palette-primary-main)",
//                 height: "56px",
//                 width: "56px",
//               }}
//             >
//               <CurrencyDollarIcon  />
//             </Avatar>
//           </Stack>
//           {diff ? (
//             <Stack sx={{ alignItems: "center" }} direction="row" spacing={2}>
//               <Stack
//                 sx={{ alignItems: "center" }}
//                 direction="row"
//                 spacing={0.5}
//               >
//                 <TrendIcon
//                   color={trendColor}
//                   fontSize="var(--icon-fontSize-md)"
//                 />
//                 <Typography color={trendColor} variant="body2">
//                   {diff}%
//                 </Typography>
//               </Stack>
//               <Typography color="text.secondary" variant="caption">
//                 Since last month
//               </Typography>
//             </Stack>
//           ) : null}
//         </Stack>
//       </CardContent>
//     </Card>
//   );
// };

// export default Budget;
import { useEffect, useState } from "react";
import { Avatar, Card, CardContent, Stack, Typography } from "@mui/material";
import { Briefcase as BriefcaseIcon } from "@phosphor-icons/react/dist/ssr/Briefcase"; // Thay biểu tượng

import axios from "axios"; // Để gọi API

const JobCount = ({ sx }) => {
  const [jobCount, setJobCount] = useState(0); // Sử dụng jobCount để lưu số lượng Job

  // Gọi API đếm số lượng job
  useEffect(() => {
    axios
      .get("http://localhost:9999/stats/job-count") // API đếm số lượng job
      .then((response) => {
        setJobCount(response.data); // Lưu số lượng job
      })
      .catch((error) => {
        console.error("Error fetching job count:", error);
      });
  }, []);

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={3}>
          <Stack
            direction="row"
            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
            spacing={3}
          >
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Total Jobs {/* Thay tiêu đề "Budget" thành "Total Jobs" */}
              </Typography>
              <Typography variant="h4">{jobCount}</Typography>{" "}
              {/* Hiển thị số lượng Job */}
            </Stack>
            <Avatar
              sx={{
                backgroundColor: "var(--mui-palette-primary-main)",
                height: "56px",
                width: "56px"
              }}
            >
              <BriefcaseIcon />{" "}
              {/* Thay biểu tượng CurrencyDollarIcon bằng BriefcaseIcon */}
            </Avatar>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default JobCount;
