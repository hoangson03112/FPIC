import * as React from "react";
import { useState, useEffect } from "react";
import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Collapse,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
  Home,
  Assessment,
  AdminPanelSettings,
  BarChart,
  Logout,
  Login,
} from "@mui/icons-material";
import AccountContext from "./http/AccountContext";
import StorageIcon from "@mui/icons-material/Storage";

const drawerWidth = 280;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [account, setAccount] = useState({});
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subMenus, setSubMenus] = useState({
    menu1: false,
    menu2: false,
    menu3: false,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const navigateTo = () => {
    window.location.href = `/auth/login`;
  };

  const toggleSubMenu = (menu) => {
    setSubMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await AccountContext.Authentication();
        setAccount(data.account);
      } catch (error) {
        console.error("Error fetching account data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (
      currentPath.includes("/page/") ||
      currentPath.includes("/microchip") ||
      currentPath.includes("/weak-point") ||
      currentPath.includes("/block-diagram")
    ) {
      setSubMenus((prev) => ({ ...prev, menu1: true }));
    }
    if (currentPath.includes("/admin/manager-account")) {
      setSubMenus((prev) => ({ ...prev, menu3: true }));
    }
  }, [currentPath]);

  const drawer = (
    <Box sx={{ bgcolor: "primary.main", color: "white", height: "100%" }}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: "white",
            color: "primary.main",
          }}
        >
          <AdminPanelSettings />
        </Avatar>
        <Box>
          {account?.firstName && account?.lastName ? (
            <Box>
              <Typography variant="subtitle1">
                {account.lastName + " " + account.firstName}
              </Typography>
              <Button
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ color: "white", p: 0, justifyContent: "flex-start" }}
              >
                Đăng xuất
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={navigateTo}
              startIcon={<Login />}
            >
              Đăng Nhập
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ bgcolor: "white", opacity: 0.2 }} />

      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/"
            selected={currentPath === "/"}
            sx={{
              "&.Mui-selected": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Trang chủ" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => toggleSubMenu("menu1")}>
            <ListItemIcon sx={{ color: "white" }}>
              <StorageIcon />
            </ListItemIcon>
            <ListItemText primary="Xây dựng dữ liệu" />
            {subMenus.menu1 ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={subMenus.menu1} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {[
              { text: "Mẫu linh kiện, chủng loại", path: "/page/1" },
              { text: "Mẫu điểm yếu trên Bo mạch", path: "/weak-point" },
              { text: "Mẫu sơ đồ khối", path: "/block-diagram" },
              { text: "Mẫu bản mạch", path: "/microchip" },
            ].map((item) => (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                selected={currentPath.includes(item.path)}
                sx={{
                  pl: 4,
                  "&.Mui-selected": {
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "white",
                    },
                  },
                }}
              >
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        {/* Assessment Management */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => toggleSubMenu("menu2")}>
            <ListItemIcon sx={{ color: "white" }}>
              <Assessment />
            </ListItemIcon>
            <ListItemText primary="Quản lý đánh giá" />
            {subMenus.menu2 ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={subMenus.menu2} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemText primary="Danh mục sản phẩm đã đánh giá" />
            </ListItemButton>
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemText primary="Kết quả đánh giá" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Administration */}
        <ListItem disablePadding>
          <ListItemButton onClick={() => toggleSubMenu("menu3")}>
            <ListItemIcon sx={{ color: "white" }}>
              <AdminPanelSettings />
            </ListItemIcon>
            <ListItemText primary="Quản trị" />
            {subMenus.menu3 ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
        </ListItem>
        <Collapse in={subMenus.menu3} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {[
              { text: "Admin", path: "/admin/manager-account/admin" },
              {
                text: "Đánh giá viên",
                path: "/admin/manager-account/assessor",
              },
              { text: "Khách hàng", path: "/admin/manager-account/user" },
            ].map((item) => (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                selected={currentPath.includes(item.path)}
                sx={{
                  pl: 4,
                  "&.Mui-selected": {
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "white",
                    },
                  },
                }}
              >
                <ListItemText primary={item.text} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>

        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon sx={{ color: "white" }}>
              <BarChart />
            </ListItemIcon>
            <ListItemText primary="Biểu đồ" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          display: { md: "none" },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "primary.main",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              bgcolor: "primary.main",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 7, md: 0 },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
