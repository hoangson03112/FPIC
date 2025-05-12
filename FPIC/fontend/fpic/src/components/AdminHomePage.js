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
  Paper,
  useMediaQuery,
  IconButton,
  Chip,
  Divider,
  Tooltip as MuiTooltip,
  Fade,
} from "@mui/material";
import { FilterAlt, ViewList, Timeline, TableView } from "@mui/icons-material";
import {
  People,
  Memory,
  DeveloperBoard,
  Schema,
  AccountTree,
  Refresh,
  Info,
  Dashboard,
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
  LineChart,
  Line,
} from "recharts";
import axios from "axios";
import { REACT_APP_URL_BE } from "../config";
import { alpha, useTheme } from "@mui/material/styles";

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
    title: "Người dùng",
    icon: People,
    color: "#0088FE",
    linkTo: "/admin/manager-account/admin",
    key: "users",
  },
  {
    title: "Mẫu linh kiện",
    icon: Memory,
    color: "#00C49F",
    linkTo: "/page/1",
    key: "accessories",
  },
  {
    title: "Mẫu bản mạch",
    icon: DeveloperBoard,
    color: "#FFBB28",
    linkTo: "/microchip",
    key: "microchips",
  },
  {
    title: "Mẫu điểm yếu",
    icon: Schema,
    color: "#FF8042",
    linkTo: "/weak-point",
    key: "weakPoints",
  },
  {
    title: "Mẫu sơ đồ khối",
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
const AnimatedCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 6px 10px rgba(0, 0, 0, 0.08)",
  borderRadius: theme.shape.borderRadius * 2,
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(0, 0, 0, 0.15)",
  },
}));

const GradientHeader = styled(Box)(({ theme, color }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(
    color || theme.palette.primary.main,
    0.9
  )}, ${alpha(color || theme.palette.primary.light, 0.7)})`,
  color: "#fff",
  borderRadius: `${theme.shape.borderRadius * 2}px ${
    theme.shape.borderRadius * 2
  }px 0 0`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const DashboardWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.background.default, 0.7),
  borderRadius: theme.shape.borderRadius * 2,
  minHeight: "100vh",
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
}));

const StyledChip = styled(Chip)(({ theme, active }) => ({
  margin: theme.spacing(0.5),
  transition: "all 0.2s ease",
  cursor: "pointer",
  ...(active && {
    transform: "scale(1.05)",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  }),
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
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
      style={{ textShadow: "0px 0px 3px rgba(0,0,0,0.5)" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

// Custom tooltips
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const total = payload[0].payload.total;
    return (
      <Card
        sx={{ p: 2, boxShadow: 4, border: "1px solid #eee", minWidth: 180 }}
      >
        <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
          {payload[0].name}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Số lượng: <b>{payload[0].value}</b>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tỷ lệ: <b>{((payload[0].value / total) * 100).toFixed(1)}%</b>
        </Typography>
      </Card>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Card
        sx={{ p: 2, boxShadow: 4, border: "1px solid #eee", minWidth: 200 }}
      >
        <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
          {label}
        </Typography>
        <Divider sx={{ my: 1 }} />
        {payload.map((entry) => (
          <Box
            key={entry.name}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: entry.fill,
                  borderRadius: "50%",
                  mr: 1,
                }}
              />
              <Typography variant="body2">{entry.name}:</Typography>
            </Box>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {entry.value}
            </Typography>
          </Box>
        ))}
      </Card>
    );
  }
  return null;
};

const StatSkeleton = () => (
  <Box sx={{ p: 3, textAlign: "center" }}>
    <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
      <CircularProgress size={40} />
    </Box>
    <Typography variant="body2" color="text.secondary">
      Đang tải dữ liệu...
    </Typography>
  </Box>
);

const AdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

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
  const [animateChart, setAnimateChart] = useState(false);
  const [activeChartType, setActiveChartType] = useState("bar");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch stats
  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${REACT_APP_URL_BE}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted) {
          setStats({
            users: response.data.accounts || 0,
            accessories: response.data.accessories || 0,
            microchips: response.data.microchips || 0,
            weakPoints: response.data.weakPoints || 0,
            blockDiagrams: response.data.soDoKhois || 0,
          });
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setSnackbar({
            open: true,
            message:
              error.response?.data?.message || "Không thể tải dữ liệu thống kê",
            severity: "error",
          });
          setIsLoading(false);
          if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // window.location.href = "/login";
            return;
          }
        }
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [refreshing]);

  // Fetch chart data
  useEffect(() => {
    let isMounted = true;
    const fetchChartData = async () => {
      setChartLoading(true);
      try {
        const token = localStorage.getItem("token");
        const MicrochipResponse = await axios.get(
          `${REACT_APP_URL_BE}/microchips/dashboard-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const WeakPointResponse = await axios.get(
          `${REACT_APP_URL_BE}/weakpoint/dashboard-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (isMounted) {
          const componentData = MicrochipResponse.data.data || [];
          setComponentTypes(
            componentData.map((item) => ({
              ...item,
              total: componentData.reduce((sum, d) => sum + (d.value || 0), 0),
            }))
          );

          const weakPointResponse = WeakPointResponse.data;

          setWeakPointData(weakPointResponse.data || []);
          setTimeout(() => setAnimateChart(true), 300);
          setChartLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setChartError(
            error.response?.data?.message || "Không thể tải dữ liệu biểu đồ"
          );
          setChartLoading(false);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }
      }
    };

    fetchChartData();
    return () => {
      isMounted = false;
    };
  }, [refreshing]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePieClick = (data) => {
    if (data && data.name) {
      setSelectedType((prev) => (prev === data.name ? null : data.name));
    }
  };

  const handleRefresh = () => {
    setSnackbar({
      open: true,
      message: "Đang cập nhật dữ liệu...",
      severity: "info",
    });
    setRefreshing((prev) => !prev);
  };

  const switchChartType = (type) => {
    setActiveChartType(type);
  };

  const renderWeakPointChart = () => {
    if (chartLoading) return <StatSkeleton />;
    if (chartError)
      return (
        <Typography color="error" sx={{ textAlign: "center", py: 5 }}>
          {chartError}
        </Typography>
      );
    if (weakPointData.length === 0)
      return (
        <Typography sx={{ textAlign: "center", py: 5 }}>
          Không có dữ liệu phân bố điểm yếu
        </Typography>
      );

    if (activeChartType === "bar") {
      return (
        <Fade in={animateChart} timeout={800}>
          <Box>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={
                  selectedType
                    ? weakPointData.filter((item) => item[selectedType])
                    : weakPointData
                }
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={alpha("#000", 0.1)}
                />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  cursor={{ fill: alpha(theme.palette.action.hover, 0.4) }}
                  position={{ y: -50 }}
                  wrapperStyle={{ zIndex: 1400 }}
                  contentStyle={{
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    border: `1px solid ${theme.palette.divider}`,
                    padding: "8px",
                    maxWidth: "300px",
                    backgroundColor: "white",
                  }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <Box
                          sx={{
                            bgcolor: "background.paper",
                            p: 1.5,
                            borderRadius: 1,
                            maxHeight: "250px",
                            overflow: "auto",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, fontWeight: 600 }}
                          >
                            {label}
                          </Typography>
                          <Divider sx={{ my: 0.5 }} />
                          <Grid container spacing={1} sx={{ mt: 0.5 }}>
                            {WEAK_POINT_TYPES.filter(
                              (type) => (payload[0]?.payload[type] || 0) > 0
                            ).map((type, index) => (
                              <Grid item xs={6} key={type}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 0.5,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      bgcolor: COLORS[index % COLORS.length],
                                      mr: 1,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{ mr: 0.5 }}
                                  >
                                    {type}:
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {payload[0]?.payload[type]}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ paddingBottom: 10 }}
                />
                {(selectedType ? [selectedType] : WEAK_POINT_TYPES).map(
                  (type, index) => (
                    <Bar
                      key={type}
                      dataKey={type}
                      fill={COLORS[index % COLORS.length]}
                      animationBegin={index * 150}
                      animationDuration={1500}
                      radius={[4, 4, 0, 0]}
                    />
                  )
                )}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Fade>
      );
    }

    if (activeChartType === "line") {
      return (
        <Fade in={animateChart} timeout={800}>
          <Box>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={
                  selectedType
                    ? weakPointData.filter((item) => item[selectedType])
                    : weakPointData
                }
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={alpha("#000", 0.1)}
                />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  cursor={{ fill: alpha(theme.palette.action.hover, 0.4) }}
                  position={{ y: -50 }}
                  wrapperStyle={{ zIndex: 1400 }}
                  contentStyle={{
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    border: `1px solid ${theme.palette.divider}`,
                    padding: "8px",
                    maxWidth: "300px",
                    backgroundColor: "white",
                  }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <Box
                          sx={{
                            bgcolor: "background.paper",
                            p: 1.5,
                            borderRadius: 1,
                            maxHeight: "250px",
                            overflow: "auto",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, fontWeight: 600 }}
                          >
                            {label}
                          </Typography>
                          <Divider sx={{ my: 0.5 }} />
                          <Grid container spacing={1} sx={{ mt: 0.5 }}>
                            {WEAK_POINT_TYPES.filter(
                              (type) => (payload[0]?.payload[type] || 0) > 0
                            ).map((type, index) => (
                              <Grid item xs={6} key={type}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 0.5,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      bgcolor: COLORS[index % COLORS.length],
                                      mr: 1,
                                    }}
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{ mr: 0.5 }}
                                  >
                                    {type}:
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {payload[0]?.payload[type]}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ paddingBottom: 10 }}
                />
                {(selectedType ? [selectedType] : WEAK_POINT_TYPES).map(
                  (type, index) => (
                    <Line
                      key={type}
                      type="monotone"
                      dataKey={type}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      animationDuration={1500}
                      animationBegin={index * 150}
                    />
                  )
                )}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Fade>
      );
    }

    return (
      <Box sx={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
              }}
            >
              <th style={{ padding: 16, textAlign: "left" }}>Loại thiết bị</th>
              {(selectedType ? [selectedType] : WEAK_POINT_TYPES).map(
                (type) => (
                  <th key={type} style={{ padding: 16, textAlign: "center" }}>
                    {type}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {(selectedType
              ? weakPointData.filter((item) => item[selectedType])
              : weakPointData
            ).map((item, index) => (
              <tr
                key={item.name}
                style={{
                  backgroundColor:
                    index % 2 === 0
                      ? alpha(theme.palette.background.paper, 0.5)
                      : alpha(theme.palette.background.default, 0.8),
                }}
              >
                <td style={{ padding: 16, fontWeight: 500 }}>{item.name}</td>
                {(selectedType ? [selectedType] : WEAK_POINT_TYPES).map(
                  (type) => (
                    <td key={type} style={{ padding: 16, textAlign: "center" }}>
                      <Chip
                        label={item[type] || 0}
                        size="small"
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: alpha(
                            COLORS[
                              WEAK_POINT_TYPES.indexOf(type) % COLORS.length
                            ],
                            0.2
                          ),
                          color:
                            COLORS[
                              WEAK_POINT_TYPES.indexOf(type) % COLORS.length
                            ],
                        }}
                      />
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };

  return (
    <DashboardWrapper>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 4,
          background: `linear-gradient(135deg, ${
            theme.palette.primary.main
          }, ${alpha(theme.palette.primary.light, 0.8)})`,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          borderRadius: 3,
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at top right, ${alpha(
              "#fff",
              0.1
            )}, transparent)`,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Memory
            sx={{
              fontSize: 40,
              mr: 2,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            }}
          />
          <Typography
            variant="h6"
            component="h1"
            sx={{ fontWeight: 700, textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
          >
            Thống kê dữ liệu
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2, position: "relative", zIndex: 1 }}>
          <MuiTooltip title="Làm mới dữ liệu">
            <IconButton
              color="inherit"
              onClick={handleRefresh}
              disabled={refreshing}
              sx={{
                backgroundColor: alpha("#fff", 0.1),
                "&:hover": {
                  backgroundColor: alpha("#fff", 0.2),
                  transform: "rotate(180deg)",
                  transition: "transform 0.5s ease",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Refresh />
            </IconButton>
          </MuiTooltip>
        </Box>
      </Paper>

      {isLoading ? (
        <Box
          sx={{
            textAlign: "center",
            py: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": { transform: "scale(1)" },
                "50%": { transform: "scale(1.1)" },
                "100%": { transform: "scale(1)" },
              },
            }}
          />
          <Typography
            variant="body1"
            sx={{ mt: 2, color: theme.palette.text.secondary }}
          >
            Đang tải dữ liệu...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {STAT_CARDS.map((card) => (
                <Grid item xs={12} sm={6} md={2.4} key={card.title}>
                  <AnimatedCard
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(
                        card.color,
                        0.1
                      )}, ${alpha(card.color, 0.05)})`,
                      border: `1px solid ${alpha(card.color, 0.2)}`,
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: `0 8px 24px ${alpha(card.color, 0.2)}`,
                      },
                    }}
                  >
                    <GradientHeader color={card.color}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <card.icon
                          sx={{
                            fontSize: 24,
                            mr: 1,
                            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                          }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {card.title}
                        </Typography>
                      </Box>
                    </GradientHeader>
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: "bold",
                          mb: 2,
                          color: card.color,
                          textAlign: "center",
                          fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                          textShadow: `0 2px 4px ${alpha(card.color, 0.2)}`,
                        }}
                      >
                        {stats[card.key].toLocaleString()}
                      </Typography>
                      <Button
                        variant="contained"
                        href={card.linkTo}
                        sx={{
                          bgcolor: card.color,
                          "&:hover": {
                            bgcolor: card.color,
                            opacity: 0.9,
                            transform: "translateY(-2px)",
                          },
                          transition: "all 0.3s ease",
                          textTransform: "none",
                          fontWeight: "bold",
                          width: "100%",
                          borderRadius: 2,
                          boxShadow: `0 4px 12px ${alpha(card.color, 0.3)}`,
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </AnimatedCard>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={8}>
            <AnimatedCard
              sx={{
                background: `linear-gradient(135deg, ${alpha(
                  theme.palette.background.paper,
                  0.8
                )}, ${alpha(theme.palette.background.paper, 0.6)})`,
                backdropFilter: "blur(10px)",
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <GradientHeader color={theme.palette.primary.main}>
                <Box
                  sx={{ display: "flex", alignItems: "center", width: "100%" }}
                >
                  <Memory
                    sx={{
                      fontSize: 24,
                      mr: 1,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Phân bố mẫu bản mạch
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <MuiTooltip title="Làm mới">
                    <IconButton
                      size="small"
                      onClick={handleRefresh}
                      sx={{
                        color: "#fff",
                        "&:hover": {
                          transform: "rotate(180deg)",
                          transition: "transform 0.5s ease",
                        },
                      }}
                    >
                      <Refresh fontSize="small" />
                    </IconButton>
                  </MuiTooltip>
                </Box>
              </GradientHeader>
              <CardContent>
                {chartLoading ? (
                  <StatSkeleton />
                ) : chartError ? (
                  <Typography color="error" sx={{ textAlign: "center", py: 5 }}>
                    {chartError}
                  </Typography>
                ) : componentTypes.length === 0 ? (
                  <Typography sx={{ textAlign: "center", py: 5 }}>
                    Không có dữ liệu phân bố mẫu bản mạch
                  </Typography>
                ) : (
                  <ChartContainer>
                    <Fade in={animateChart} timeout={800}>
                      <Box>
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
                                  ? componentTypes.findIndex(
                                      (t) => t.name === selectedType
                                    )
                                  : undefined
                              }
                              activeShape={{
                                fill: "#82ca9d",
                                stroke: theme.palette.background.paper,
                                strokeWidth: 3,
                              }}
                              animationBegin={200}
                              animationDuration={1500}
                            >
                              {componentTypes.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                  style={{
                                    cursor: "pointer",
                                    filter:
                                      "drop-shadow(0px 0px 5px rgba(0,0,0,0.15))",
                                  }}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip />} />
                            <Legend
                              layout="horizontal"
                              align="center"
                              verticalAlign="bottom"
                              wrapperStyle={{ paddingTop: 20 }}
                              formatter={(value) => (
                                <span
                                  style={{
                                    color:
                                      selectedType === value
                                        ? theme.palette.primary.main
                                        : theme.palette.text.primary,
                                    fontWeight:
                                      selectedType === value ? 700 : 400,
                                    cursor: "pointer",
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    backgroundColor:
                                      selectedType === value
                                        ? alpha(
                                            COLORS[
                                              componentTypes.findIndex(
                                                (t) => t.name === value
                                              ) % COLORS.length
                                            ],
                                            0.1
                                          )
                                        : "transparent",
                                  }}
                                  onClick={() =>
                                    handlePieClick({ name: value })
                                  }
                                >
                                  {value}
                                </span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Fade>
                    {selectedType && (
                      <Fade in={Boolean(selectedType)} timeout={500}>
                        <Box
                          sx={{
                            mt: 3,
                            p: 3,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.background.paper, 0.9),
                            boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                            border: `1px solid ${alpha(
                              theme.palette.primary.main,
                              0.2
                            )}`,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Info
                              sx={{
                                mr: 1.5,
                                fontSize: 24,
                                color: theme.palette.primary.main,
                              }}
                            />
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                              }}
                            >
                              Chi tiết: {selectedType}
                            </Typography>
                          </Box>
                          <Grid container spacing={2}>
                            {componentTypes.find((t) => t.name === selectedType)
                              ?.value ? (
                              <Grid item xs={12} sm={6} md={4}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    bgcolor: alpha(
                                      theme.palette.background.default,
                                      0.6
                                    ),
                                    border: `1px solid ${alpha(
                                      theme.palette.divider,
                                      0.2
                                    )}`,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      transform: "translateY(-2px)",
                                      boxShadow: `0 4px 8px ${alpha(
                                        theme.palette.primary.light,
                                        0.2
                                      )}`,
                                    },
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 500 }}
                                  >
                                    Số lượng:
                                  </Typography>
                                  <Chip
                                    label={
                                      componentTypes.find(
                                        (t) => t.name === selectedType
                                      ).value
                                    }
                                    size="small"
                                    sx={{
                                      fontWeight: 600,
                                      backgroundColor: alpha(
                                        COLORS[
                                          componentTypes.findIndex(
                                            (t) => t.name === selectedType
                                          ) % COLORS.length
                                        ],
                                        0.15
                                      ),
                                      color:
                                        COLORS[
                                          componentTypes.findIndex(
                                            (t) => t.name === selectedType
                                          ) % COLORS.length
                                        ],
                                    }}
                                  />
                                </Paper>
                              </Grid>
                            ) : (
                              <Grid item xs={12}>
                                <Box
                                  sx={{
                                    p: 2,
                                    textAlign: "center",
                                    borderRadius: 1,
                                    bgcolor: theme.palette.action.hover,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Không có dữ liệu chi tiết
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      </Fade>
                    )}
                  </ChartContainer>
                )}
              </CardContent>
            </AnimatedCard>
          </Grid>

          <Grid item xs={12}>
            <AnimatedCard
              sx={{
                background: `linear-gradient(135deg, ${alpha(
                  "#FF8042",
                  0.05
                )}, ${alpha("#FF8042", 0.02)})`,
                border: `1px solid ${alpha("#FF8042", 0.1)}`,
              }}
            >
              <GradientHeader color="#FF8042">
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Schema
                    sx={{
                      fontSize: 24,
                      mr: 1,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Phân bố mẫu điểm yếu
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      bgcolor: alpha("#fff", 0.1),
                      borderRadius: 2,
                      p: 0.5,
                      backdropFilter: "blur(5px)",
                    }}
                  >
                    <MuiTooltip title="Xem biểu đồ cột">
                      <IconButton
                        size="small"
                        onClick={() => switchChartType("bar")}
                        sx={{
                          color:
                            activeChartType === "bar"
                              ? "#fff"
                              : alpha("#fff", 0.7),
                          bgcolor:
                            activeChartType === "bar"
                              ? alpha("#fff", 0.2)
                              : "transparent",
                        }}
                      >
                        <ViewList fontSize="small" />
                      </IconButton>
                    </MuiTooltip>
                    <MuiTooltip title="Xem biểu đồ đường">
                      <IconButton
                        size="small"
                        onClick={() => switchChartType("line")}
                        sx={{
                          color:
                            activeChartType === "line"
                              ? "#fff"
                              : alpha("#fff", 0.7),
                          bgcolor:
                            activeChartType === "line"
                              ? alpha("#fff", 0.2)
                              : "transparent",
                        }}
                      >
                        <Timeline fontSize="small" />
                      </IconButton>
                    </MuiTooltip>
                    <MuiTooltip title="Xem dạng bảng">
                      <IconButton
                        size="small"
                        onClick={() => switchChartType("table")}
                        sx={{
                          color:
                            activeChartType === "table"
                              ? "#fff"
                              : alpha("#fff", 0.7),
                          bgcolor:
                            activeChartType === "table"
                              ? alpha("#fff", 0.2)
                              : "transparent",
                        }}
                      >
                        <TableView fontSize="small" />
                      </IconButton>
                    </MuiTooltip>
                  </Box>
                </Box>
              </GradientHeader>
              <CardContent>
                {renderWeakPointChart()}
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    Lọc theo loại điểm yếu
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {WEAK_POINT_TYPES.map((type) => (
                      <StyledChip
                        key={type}
                        label={type}
                        size="small"
                        active={type === selectedType}
                        onClick={() =>
                          setSelectedType(type === selectedType ? null : type)
                        }
                        sx={{
                          bgcolor: alpha(
                            COLORS[
                              WEAK_POINT_TYPES.indexOf(type) % COLORS.length
                            ],
                            type === selectedType ? 0.2 : 0.1
                          ),
                          color:
                            COLORS[
                              WEAK_POINT_TYPES.indexOf(type) % COLORS.length
                            ],
                          fontWeight: type === selectedType ? 600 : 400,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: `0 4px 8px ${alpha(
                              COLORS[
                                WEAK_POINT_TYPES.indexOf(type) % COLORS.length
                              ],
                              0.2
                            )}`,
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </AnimatedCard>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Fade}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            boxShadow: 3,
            backdropFilter: "blur(10px)",
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
          }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardWrapper>
  );
};

export default AdminDashboard;
