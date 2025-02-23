import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import {
  People,
  Memory,
  DeveloperBoard,
  Schema,
  AccountTree,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Rectangle,
  ResponsiveContainer,
} from "recharts";

const FIXED_COMPONENT_TYPES = [
  { name: "Router", value: 156 },
  { name: "PC", value: 128 },
  { name: "USB", value: 98 },
  { name: "Access Point", value: 87 },
  { name: "Switch", value: 45 },
  { name: "Server", value: 67 },
  { name: "FPJA", value: 34 },
];

const data = [
  {
    name: "Router",
    SMB: 15,
    JTAG: 12,
    TestPin: 10,
    SPI: 7,
    LPC: 10,
    "Unused ports": 4,
    Vias: 10,
    Footprint: 7,
  },
  {
    name: "PC",
    SMB: 15,
    JTAG: 12,
    TestPin: 10,
    SPI: 7,
    LPC: 10,
    "Unused ports": 7,
    Vias: 4,
    Footprint: 4,
  },
  {
    name: "USB",
    SMB: 15,
    JTAG: 12,
    TestPin: 10,
    SPI: 7,
    LPC: 5,
    "Unused ports": 3,
    Vias: 10,
    Footprint: 10,
  },
  {
    name: "Access Point",
    SMB: 15,
    JTAG: 12,
    TestPin: 10,
    SPI: 7,
    LPC: 10,
    "Unused ports": 2,
    Vias: 10,
    Footprint: 7,
  },
  {
    name: "Switch",
    SMB: 15,
    JTAG: 12,
    TestPin: 10,
    SPI: 7,
    LPC: 10,
    "Unused ports": 18,
    Vias: 10,
    Footprint: 10,
  },
  {
    name: "Server",
    SMB: 15,
    JTAG: 12,
    TestPin: 10,
    SPI: 7,
    LPC: 10,
    "Unused ports": 10,
    Vias: 5,
    Footprint: 10,
  },
  {
    name: "FPJA",
    SMB: 15,
    JTAG: 12,
    TestPin: 10,
    SPI: 7,
    LPC: 10,
    "Unused ports": 10,
    Vias: 10,
    Footprint: 1,
  },
];

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const AdminDashboard = () => {
  const [countUser, setCountUser] = useState(150);
  const [countImages, setCountImages] = useState(643);
  const [countMicrochip, setCountMicrochip] = useState(89);
  const [countWeakPoints, setCountWeakPoints] = useState(35);
  const [countBlockDiagrams, setCountBlockDiagrams] = useState(42);

  const StatCard = ({ title, count, Icon, color, linkTo }) => (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Icon sx={{ fontSize: 40, color: color }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "medium",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            mb: 3,
            color: color,
          }}
        >
          {count.toLocaleString()}
        </Typography>
        <Button
          variant="contained"
          href={linkTo}
          sx={{
            bgcolor: color,
            "&:hover": {
              bgcolor: color,
              opacity: 0.9,
            },
            textTransform: "none",
            px: 4,
            py: 1,
          }}
        >
          Xem chi tiết
        </Button>
      </CardContent>
    </Card>
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 1.5, boxShadow: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {payload[0].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Số lượng: {payload[0].value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tỷ lệ:{" "}
            {(
              (payload[0].value /
                FIXED_COMPONENT_TYPES.reduce(
                  (acc, curr) => acc + curr.value,
                  0
                )) *
              100
            ).toFixed(1)}
            %
          </Typography>
        </Card>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 4 }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Tổng số người dùng"
            count={countUser}
            Icon={People}
            color="#0088FE"
            linkTo="/admin/manager-account/admin"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Tổng số mẫu linh kiện"
            count={countImages}
            Icon={Memory}
            color="#00C49F"
            linkTo="/page/1"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Tổng số mẫu bản mạch"
            count={countMicrochip}
            Icon={DeveloperBoard}
            color="#FFBB28"
            linkTo="/microchip"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Tổng số mẫu điểm yếu"
            count={countWeakPoints}
            Icon={Schema}
            color="#FF8042"
            linkTo="/weak-point"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Tổng số mẫu sơ đồ khối"
            count={countBlockDiagrams}
            Icon={AccountTree}
            color="#8884d8"
            linkTo="/block-diagram"
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{ height: "100%", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 3, display: "flex", alignItems: "center" }}
              >
                <Memory sx={{ mr: 1 }} />
                Phân bố mẫu bản mạch
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={FIXED_COMPONENT_TYPES}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {FIXED_COMPONENT_TYPES.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={12}>
          <Card
            sx={{ height: "100%", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 3, display: "flex", alignItems: "center" }}
              >
                <Schema sx={{ mr: 1 }} />
                Phân bố mẫu điểm yếu
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  width={500}
                  height={300}
                  data={data}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="SMB" fill="#8884d8" />
                  <Bar dataKey="JTAG" fill="#82ca9d" />
                  <Bar dataKey="TestPin" fill="#ffc658" />
                  <Bar dataKey="SPI" fill="#0088FE" />
                  <Bar dataKey="LPC" fill="#00C49F" />
                  <Bar dataKey="Unused ports" fill="#FF8042" />
                  <Bar dataKey="Vias" fill="#FFBB28" />
                  <Bar dataKey="Footprint" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#FF8042",
                    "&:hover": { bgcolor: "#FF8042", opacity: 0.9 },
                    textTransform: "none",
                    px: 4,
                    py: 1,
                  }}
                  onClick={() => alert("Chức năng xuất PDF sẽ được thêm sau")}
                >
                  Xuất PDF
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#00C49F",
                    "&:hover": { bgcolor: "#00C49F", opacity: 0.9 },
                    textTransform: "none",
                    px: 4,
                    py: 1,
                  }}
                  onClick={() => alert("Chức năng xuất Excel sẽ được thêm sau")}
                >
                  Xuất Excel
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
