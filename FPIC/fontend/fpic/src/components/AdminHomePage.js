import React, { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, Button } from "@mui/material";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import { 
  PeopleAlt, Memory, DeveloperBoard,
  TrendingUp, Assessment, PieChart as PieChartIcon
} from "@mui/icons-material";
import AccountContext from "../http/AccountContext";
import axios from "axios";
import { REACT_APP_URL_BE } from "../config";

const AdminDashboard = () => {
  const [countUser, setCountUser] = useState(0);
  const [countImages, setCountImages] = useState(0);
  const [countMicrochip, setCountMicrochip] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [userTypeData, setUserTypeData] = useState([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch counts
        const [userResponse, imagesResponse, microchipResponse] = await Promise.all([
          AccountContext.getCountUser(),
          axios.get(`${REACT_APP_URL_BE}/images/count`),
          axios.get(`${REACT_APP_URL_BE}/images-microchip/count`)
        ]);

        setCountUser(userResponse.data.count);
        setCountImages(imagesResponse.data.count);
        setCountMicrochip(microchipResponse.data.count);

        // Generate sample monthly data (replace with actual API call)
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return {
            name: date.toLocaleString('default', { month: 'short' }),
            users: Math.floor(Math.random() * 50) + 50,
            components: Math.floor(Math.random() * 30) + 20,
            circuits: Math.floor(Math.random() * 20) + 10,
          };
        }).reverse();
        setMonthlyData(last6Months);

        // Set user type distribution
        setUserTypeData([
          { name: 'Admin', value: Math.floor(countUser * 0.1) },
          { name: 'Đánh giá viên', value: Math.floor(countUser * 0.3) },
          { name: 'Khách hàng', value: Math.floor(countUser * 0.6) },
        ]);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, count, icon, color, linkTo }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h3" color="primary" gutterBottom>
          {count}
        </Typography>
        <Button 
          variant="contained" 
          href={linkTo}
          sx={{ 
            bgcolor: color,
            '&:hover': {
              bgcolor: color,
              opacity: 0.9
            }
          }}
        >
          Xem chi tiết
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <StatCard
            title="Tổng số người dùng"
            count={countUser}
            icon={<PeopleAlt sx={{ fontSize: 40, color: '#0088FE' }} />}
            color="#0088FE"
            linkTo="/admin/manager-account/admin"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Tổng số mẫu linh kiện"
            count={countImages}
            icon={<Memory sx={{ fontSize: 40, color: '#00C49F' }} />}
            color="#00C49F"
            linkTo="/page/1"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Tổng số mẫu bản mạch"
            count={countMicrochip}
            icon={<DeveloperBoard sx={{ fontSize: 40, color: '#FFBB28' }} />}
            color="#FFBB28"
            linkTo="/microchip"
          />
        </Grid>

        {/* Growth Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <TrendingUp sx={{ mr: 1 }} /> Xu hướng tăng trưởng
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#0088FE" name="Người dùng" />
                  <Line type="monotone" dataKey="components" stroke="#00C49F" name="Linh kiện" />
                  <Line type="monotone" dataKey="circuits" stroke="#FFBB28" name="Bản mạch" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* User Distribution Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <PieChartIcon sx={{ mr: 1 }} /> Phân bố người dùng
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Comparison Bar Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                <Assessment sx={{ mr: 1 }} /> So sánh hàng tháng
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#0088FE" name="Người dùng" />
                  <Bar dataKey="components" fill="#00C49F" name="Linh kiện" />
                  <Bar dataKey="circuits" fill="#FFBB28" name="Bản mạch" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;