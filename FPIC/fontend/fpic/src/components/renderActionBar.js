import { Box, Button, Typography } from "@mui/material";
import React, { useContext } from "react";
import { Close as CloseIcon } from "@mui/icons-material";

export default function RenderActionBar({ search, clearSearch, setShowModal }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 3,
        p: 2,
        backgroundColor: "background.paper",
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        {search && (
          <Typography variant="subtitle1">
            Kết quả tìm kiếm cho: <strong>{search}</strong>
            <Button
              size="small"
              startIcon={<CloseIcon />}
              onClick={clearSearch}
              sx={{ ml: 2 }}
            >
              Xóa bộ lọc
            </Button>
          </Typography>
        )}
      </Box>
    </Box>
  );
}
