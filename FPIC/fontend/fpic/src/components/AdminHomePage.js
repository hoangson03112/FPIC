import React, { useEffect, useState, useRef } from "react";
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
  IconButton,
  Tooltip as MuiTooltip,
  Fade,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  People,
  Memory,
  DeveloperBoard,
  Schema,
  AccountTree,
  Refresh,
  ViewList,
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

// Danh mục và màu Pie cố định
const PCB_TYPES = [
  "Router",
  "PC",
  "USB",
  "Access Point",
  "Switch",
  "Server",
  "FPGA",
];
const PCB_COLORS = {
  Router: "#1E88E5",
  PC: "#00A86B",
  USB: "#FFB300",
  "Access Point": "#FB8C00",
  Switch: "#7E57C2",
  Server: "#26A69A",
  FPGA: "#F4C20D",
};

// Màu cho biểu đồ cột điểm yếu
const WEAK_COLORS = [
  "#7E57C2",
  "#00A86B",
  "#F4C20D",
  "#1E88E5",
  "#FB8C00",
  "#26A69A",
  "#8D6E63",
  "#29B6F6",
];

// 5 card thống kê
const STAT_CARDS = [
  {
    title: "Tổng số người dùng",
    icon: People,
    color: "#1E88E5",
    key: "users",
    linkTo: "/admin/manager-account/admin",
  },
  {
    title: "Tổng số mẫu linh kiện",
    icon: Memory,
    color: "#00A86B",
    key: "accessories",
    linkTo: "/page/1",
  },
  {
    title: "Tổng số mẫu bản mạch",
    icon: DeveloperBoard,
    color: "#FFB300",
    key: "microchips",
    linkTo: "/microchip",
  },
  {
    title: "Tổng số mẫu điểm yếu",
    icon: Schema,
    color: "#FB8C00",
    key: "weakPoints",
    linkTo: "/weak-point",
  },
  {
    title: "Tổng số mẫu sơ đồ khối",
    icon: AccountTree,
    color: "#7E57C2",
    key: "blockDiagrams",
    linkTo: "/block-diagram",
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

// Card với border rõ nét và height cao hơn
const AnimatedCard = styled(Card)(({ theme }) => ({
  height: "100%",
  minHeight: "240px",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  border: "1px solid rgba(0,0,0,0.12)",
  transition:
    "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    borderColor: theme.palette.primary.light,
  },
}));

// Label % cho Pie
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return percent > 0.03 ? (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight="bold"
      style={{ textShadow: "0 0 3px rgba(0,0,0,0.5)" }}
    >
      {(percent * 100).toFixed(0)}%
    </text>
  ) : null;
};

const AdminDashboard = () => {
  const theme = useTheme();

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [refreshing, setRefreshing] = useState(false);

  const barContainerRef = useRef(null);

  // Fetch stats
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${REACT_APP_URL_BE}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!mounted) return;
        const d = res.data || {};
        setStats({
          users: d.accounts ?? 0,
          accessories: d.accessories ?? 0,
          microchips: d.microchips ?? 0,
          weakPoints: d.weakPoints ?? 0,
          blockDiagrams: d.soDoKhois ?? 0,
        });
      } catch (e) {
        mounted &&
          setSnackbar({
            open: true,
            message:
              e.response?.data?.message || "Không thể tải dữ liệu thống kê",
            severity: "error",
          });
      } finally {
        mounted && setIsLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [refreshing]);

  // Fetch charts
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setChartLoading(true);
      try {
        const token = localStorage.getItem("token");
        const microRes = await axios.get(
          `${REACT_APP_URL_BE}/microchips/dashboard-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const weakRes = await axios.get(
          `${REACT_APP_URL_BE}/weakpoint/dashboard-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!mounted) return;

        const apiData = microRes.data?.data || [];
        const map = new Map(apiData.map((d) => [d.name, Number(d.value) || 0]));
        const fullPie = PCB_TYPES.map((name) => ({
          name,
          value: map.get(name) ?? 0,
        }));
        const total = fullPie.reduce((s, it) => s + it.value, 0);
        setComponentTypes(fullPie.map((it) => ({ ...it, total })));

        setWeakPointData(weakRes.data?.data || []);
        setChartError(null);
      } catch (e) {
        const fallback = [
          { name: "Router", value: 25 },
          { name: "PC", value: 21 },
          { name: "USB", value: 16 },
          { name: "Access Point", value: 14 },
          { name: "Switch", value: 7 },
          { name: "Server", value: 11 },
          { name: "FPGA", value: 6 },
        ];
        const total = fallback.reduce((s, it) => s + it.value, 0);
        setComponentTypes(fallback.map((it) => ({ ...it, total })));
        setChartError(null);
      } finally {
        mounted && setChartLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [refreshing]);

  const handleRefresh = () => {
    setSnackbar({
      open: true,
      message: "Đang cập nhật dữ liệu...",
      severity: "info",
    });
    setRefreshing((v) => !v);
  };

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  const exportExcel = () => {
    const header = ["Device", ...WEAK_POINT_TYPES].join(",");
    const rows = weakPointData.map((row) =>
      [row.name, ...WEAK_POINT_TYPES.map((k) => row[k] || 0)].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "phan_bo_mau_diem_yeu.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <Box
      sx={{
        backgroundColor: alpha(theme.palette.background.default, 0.7),
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            background: `linear-gradient(135deg, ${
              theme.palette.primary.main
            }, ${alpha(theme.palette.primary.light, 0.85)})`,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Memory sx={{ fontSize: 36, mr: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Thống kê dữ liệu
            </Typography>
          </Box>
          <MuiTooltip title="Làm mới dữ liệu">
            <IconButton
              color="inherit"
              onClick={handleRefresh}
              sx={{
                bgcolor: alpha("#fff", 0.12),
                "&:hover": {
                  bgcolor: alpha("#fff", 0.2),
                  transform: "rotate(180deg)",
                },
                transition: "all .4s ease",
              }}
            >
              <Refresh />
            </IconButton>
          </MuiTooltip>
        </Paper>

        {/* 6 cards: 5 số liệu + 1 Pie */}
        {isLoading ? (
          <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* 5 card số liệu */}
            {STAT_CARDS.map((c) => (
              <Grid item key={c.key} xs={12} sm={6} md={4}>
                <AnimatedCard>
                  <CardContent
                    sx={{
                      p: 3,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      height: "100%",
                    }}
                  >
                    <Box>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          mx: "auto",
                          mb: 1.25,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: c.color,
                        }}
                      >
                        <c.icon sx={{ fontSize: 32 }} />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                      >
                        {c.title}
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{ color: c.color, fontWeight: 700, mb: 2 }}
                      >
                        {Number(stats[c.key] ?? 0).toLocaleString()}
                      </Typography>
                    </Box>
                    <Button
                      href={c.linkTo}
                      variant="contained"
                      sx={{
                        width: "120px",
                        mx: "auto",
                        px: 2.5,
                        py: 0.75,
                        textTransform: "none",
                        fontWeight: 600,
                        bgcolor: c.color,
                        "&:hover": { bgcolor: c.color, opacity: 0.9 },
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            ))}

            {/* Card thứ 6: Phân bố mẫu bản mạch với Legend bên phải */}
            <Grid item xs={12} sm={6} md={4}>
              <AnimatedCard>
                <CardContent sx={{ p: 2, height: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                      mb: 1,
                    }}
                  >
                    <Schema sx={{ fontSize: 18 }} />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 600 }}
                    >
                      Phân bố mẫu bản mạch
                    </Typography>
                  </Box>

                  {chartLoading ? (
                    <Box sx={{ py: 4 }}>
                      <CircularProgress size={36} />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={componentTypes}
                            cx="40%"
                            cy="50%"
                            outerRadius={65}
                            labelLine={false}
                            label={renderCustomizedLabel}
                            dataKey="value"
                          >
                            {componentTypes.map((e) => (
                              <Cell key={e.name} fill={PCB_COLORS[e.name]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            iconType="square"
                            iconSize={10}
                            wrapperStyle={{
                              paddingLeft: "10px",
                              fontSize: "11px",
                              lineHeight: "16px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </AnimatedCard>
            </Grid>
          </Grid>
        )}

        {/* Phân bố mẫu điểm yếu FULL WIDTH */}
        <Box sx={{ mt: 4 }}>
          <Paper
            elevation={1}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.12)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2.5,
                py: 1.5,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
              }}
            >
              <Schema sx={{ fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Phân bố mẫu điểm yếu
              </Typography>
            </Box>

            <Box ref={barContainerRef} sx={{ px: 2.5, pt: 1.5, pb: 2 }}>
              {chartLoading ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <CircularProgress />
                </Box>
              ) : chartError ? (
                <Typography color="error" sx={{ textAlign: "center", py: 5 }}>
                  {chartError}
                </Typography>
              ) : !weakPointData.length ? (
                <Typography sx={{ textAlign: "center", py: 5 }}>
                  Không có dữ liệu
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={weakPointData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 24 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {WEAK_POINT_TYPES.map((k, i) => (
                      <Bar
                        key={k}
                        dataKey={k}
                        fill={WEAK_COLORS[i % WEAK_COLORS.length]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 2, px: 2.5, pb: 2 }}>
              <Button
                variant="contained"
                color="warning"
                startIcon={<ViewList />}
                onClick={exportPDF}
              >
                Xuất PDF
              </Button>
              <Button variant="contained" color="success" onClick={exportExcel}>
                Xuất Excel
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={handleCloseSnackbar}
        TransitionComponent={Fade}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
