import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  styled,
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
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { REACT_APP_URL_BE } from "../config";
import { alpha } from "@mui/material/styles";

// Constants
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

const STAT_CARDS = [
  {
    title: "Tổng số người dùng",
    icon: People,
    color: "#0088FE",
    linkTo: "/admin/manager-account/admin",
    key: "users",
  },
  {
    title: "Tổng số mẫu linh kiện",
    icon: Memory,
    color: "#00C49F",
    linkTo: "/page/1",
    key: "accessories",
  },
  {
    title: "Tổng số mẫu bản mạch",
    icon: DeveloperBoard,
    color: "#FFBB28",
    linkTo: "/microchip",
    key: "microchips",
  },
  {
    title: "Tổng số mẫu điểm yếu",
    icon: Schema,
    color: "#FF8042",
    linkTo: "/weak-point",
    key: "weakPoints",
  },
  {
    title: "Tổng số mẫu sơ đồ khối",
    icon: AccountTree,
    color: "#8884d8",
    linkTo: "/block-diagram",
    key: "blockDiagrams",
  },
];

const WEAK_POINT_TYPES = [
  "SMB",
  "JTAG",
  "TestPin",
  "SPI",
  "LPC",
  "Unused ports",
  "Vias",
  "Footprint",
];

// Styled components
const GradientHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(120deg, ${theme.palette.primary.main}, ${alpha(
    theme.palette.primary.light,
    0.8
  )})`,
  color: "white",
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(4),
  textAlign: "center",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
  },
}));

// Custom label for PieChart
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

// Custom Tooltips
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const total = payload[0].payload.total;
    return (
      <Card sx={{ p: 1.5, boxShadow: 3, bgcolor: "background.paper" }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          {payload[0].name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Số lượng: {payload[0].value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tỷ lệ: {((payload[0].value / total) * 100).toFixed(1)}%
        </Typography>
      </Card>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Card sx={{ p: 1.5, boxShadow: 3, bgcolor: "background.paper" }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          {label}
        </Typography>
        {payload.map((entry) => (
          <Typography key={entry.name} variant="body2" color="text.secondary">
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Card>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    accessories: 0,
    microchips: 0,
    weakPoints: 0,
    blockDiagrams: 0,
  });
  const [componentTypes, setComponentTypes] = useState([]);
  const [weakPointData, setWeakPointData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${REACT_APP_URL_BE}/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { data } = response;
        setStats({
          users: data.accounts || 0,
          accessories: data.accessories || 0,
          microchips: data.microchips || 0,
          weakPoints: data.weakPoints || 0,
          blockDiagrams: data.soDoKhois || 0,
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setSnackbar({
          open: true,
          message: "Không thể tải dữ liệu thống kê",
          severity: "error",
        });
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch component types and weak points
  useEffect(() => {
    const fetchChartData = async () => {
      setChartLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Giả lập API
        const componentResponse = {
          data: [
            { name: "Router", value: 156, weakPoints: { SMB: 15, JTAG: 12, TestPin: 10 } },
            { name: "PC", value: 128, weakPoints: { SMB: 15, JTAG: 12, TestPin: 10 } },
            { name: "USB", value: 98, weakPoints: { SMB: 15, JTAG: 12, TestPin: 10 } },
            { name: "Access Point", value: 87, weakPoints: { SMB: 15, JTAG: 12, TestPin: 10 } },
            { name: "Switch", value: 45, weakPoints: { SMB: 15, JTAG: 12, TestPin: 10 } },
            { name: "Server", value: 67, weakPoints: { SMB: 15, JTAG: 12, TestPin: 10 } },
            { name: "FPJA", value: 34, weakPoints: { SMB: 15, JTAG: 12, TestPin: 10 } },
          ],
        };

        const weakPointResponse = {
          data: [
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
          ],
        };

        // Thay bằng API thực tế nếu có
        /*
        const componentResponse = await axios.get(`${REACT_APP_URL_BE}/stats/component-types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const weakPointResponse = await axios.get(`${REACT_APP_URL_BE}/stats/weak-points`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        */

        const componentData = componentResponse.data.length > 0 ? componentResponse.data : [];
        setComponentTypes(
          componentData.map(item => ({
            ...item,
            total: componentData.reduce((sum, d) => sum + d.value, 0),
          }))
        );

        setWeakPointData(weakPointResponse.data.length > 0 ? weakPointResponse.data : []);
        setChartLoading(false);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setChartError("Không thể tải dữ liệu biểu đồ");
        setChartLoading(false);
      }
    };

    fetchChartData();
  }, []);

  // Handlers
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePieClick = (data) => {
    setSelectedType(data.name === selectedType ? null : data.name);
  };

  const handleExportPDF = () => {
    setSnackbar({
      open: true,
      message: "Chức năng xuất PDF đang được phát triển",
      severity: "info",
    });
  };

  const handleExportExcel = () => {
    setSnackbar({
      open: true,
      message: "Chức năng xuất Excel đang được phát triển",
      severity: "info",
    });
  };

  // StatCard component
  const StatCard = ({ title, count, Icon, color, linkTo }) => (
    <StyledCard>
      <CardContent sx={{ flexGrow: 1, textAlign: "center", p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Icon sx={{ fontSize: 40, color }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "medium",
            minHeight: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          {title}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: "bold", mb: 3, color }}>
          {count.toLocaleString()}
        </Typography>
        <Button
          variant="contained"
          href={linkTo}
          sx={{
            bgcolor: color,
            "&:hover": { bgcolor: color, opacity: 0.9 },
            textTransform: "none",
            px: 4,
            py: 1,
            borderRadius: 2,
          }}
        >
          Xem chi tiết
        </Button>
      </CardContent>
    </StyledCard>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <GradientHeader>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Admin Dashboard
        </Typography>
      </GradientHeader>

      {isLoading ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Đang tải dữ liệu...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Stat Cards (except Block Diagrams) */}
          {STAT_CARDS.filter(card => card.key !== "blockDiagrams").map((card) => (
            <Grid item xs={12} sm={6} md={3} key={card.title}>
              <StatCard
                title={card.title}
                count={stats[card.key]}
                Icon={card.icon}
                color={card.color}
                linkTo={card.linkTo}
              />
            </Grid>
          ))}

          {/* Row for Component Distribution and Block Diagrams */}
          <Grid container item xs={12} spacing={3}>
            {/* Pie Chart - Component Distribution */}
            <Grid item xs={12} sm={6} md={6}>
              <StyledCard>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ mb: 3, display: "flex", alignItems: "center" }}
                  >
                    <Memory sx={{ mr: 1 }} />
                    Phân bố mẫu bản mạch
                  </Typography>
                  {chartLoading ? (
                    <Box sx={{ textAlign: "center", py: 5 }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Đang tải dữ liệu...
                      </Typography>
                    </Box>
                  ) : chartError ? (
                    <Typography color="error" sx={{ textAlign: "center", py: 5 }}>
                      {chartError}
                    </Typography>
                  ) : componentTypes.length === 0 ? (
                    <Typography sx={{ textAlign: "center", py: 5 }}>
                      Không có dữ liệu phân bố mẫu bản mạch
                    </Typography>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={componentTypes}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            onClick={handlePieClick}
                            activeIndex={
                              selectedType
                                ? componentTypes.findIndex(t => t.name === selectedType)
                                : -1
                            }
                            activeShape={{ stroke: "#000", strokeWidth: 2 }}
                          >
                            {componentTypes.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                style={{ cursor: "pointer" }}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                          <Legend
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            wrapperStyle={{ paddingTop: 20 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {selectedType && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                            Chi tiết: {selectedType}
                          </Typography>
                          {componentTypes.find(t => t.name === selectedType)?.weakPoints ? (
                            Object.entries(
                              componentTypes.find(t => t.name === selectedType).weakPoints
                            ).map(([key, value]) => (
                              <Typography key={key} variant="body2">
                                {key}: {value}
                              </Typography>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Không có dữ liệu điểm yếu
                            </Typography>
                          )}
                        </Box>
                      )}
                    </>
                  )}
                </CardContent>
              </StyledCard>
            </Grid>

            {/* Stat Card - Block Diagrams */}
            <Grid item xs={12} sm={6} md={4}>
              {STAT_CARDS.filter(card => card.key === "blockDiagrams").map((card) => (
                <StatCard
                  key={card.title}
                  title={card.title}
                  count={stats[card.key]}
                  Icon={card.icon}
                  color={card.color}
                  linkTo={card.linkTo}
                />
              ))}
            </Grid>
          </Grid>

          {/* Bar Chart - Weak Point Distribution */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, display: "flex", alignItems: "center" }}
                >
                  <Schema sx={{ mr: 1 }} />
                  Phân bố mẫu điểm yếu
                </Typography>
                {chartLoading ? (
                  <Box sx={{ textAlign: "center", py: 5 }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Đang tải dữ liệu...
                    </Typography>
                  </Box>
                ) : chartError ? (
                  <Typography color="error" sx={{ textAlign: "center", py: 5 }}>
                    {chartError}
                  </Typography>
                ) : weakPointData.length === 0 ? (
                  <Typography sx={{ textAlign: "center", py: 5 }}>
                    Không có dữ liệu phân bố điểm yếu
                  </Typography>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={weakPointData}
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
                        <Tooltip content={<CustomBarTooltip />} />
                        <Legend />
                        {WEAK_POINT_TYPES.map((type, index) => (
                          <Bar
                            key={type}
                            dataKey={type}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                    <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                      <Button
                        variant="contained"
                        sx={{
                          bgcolor: "#FF8042",
                          "&:hover": { bgcolor: "#FF8042", opacity: 0.9 },
                          textTransform: "none",
                          px: 4,
                          py: 1,
                          borderRadius: 2,
                        }}
                        onClick={handleExportPDF}
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
                          borderRadius: 2,
                        }}
                        onClick={handleExportExcel}
                      >
                        Xuất Excel
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminDashboard;