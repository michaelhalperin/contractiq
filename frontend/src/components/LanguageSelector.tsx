import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import CheckIcon from "@mui/icons-material/Check";
import { useLanguageStore } from "../store/languageStore";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/auth.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { Language } from "../../../shared/types";

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "he", name: "Hebrew", nativeName: "עברית" },
];

export const LanguageSelector = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { language, setLanguage } = useLanguageStore();
  const { user, fetchUser } = useAuthStore();
  const queryClient = useQueryClient();

  const updateLanguageMutation = useMutation({
    mutationFn: async (newLanguage: Language) => {
      if (user) {
        await authService.updateProfile({ language: newLanguage });
      }
      return newLanguage;
    },
    onSuccess: (newLanguage) => {
      setLanguage(newLanguage);
      if (user) {
        fetchUser();
        queryClient.invalidateQueries({ queryKey: ["user"] });
      }
      toast.success(
        newLanguage === "he"
          ? "השפה עודכנה בהצלחה"
          : "Language updated successfully"
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to update language");
    },
  });

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    if (newLanguage !== language) {
      updateLanguageMutation.mutate(newLanguage);
    }
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: "inherit",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
        aria-label="Select language"
      >
        <LanguageIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            bgcolor: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            borderRadius: 2,
            minWidth: 180,
            mt: 1,
          },
        }}
      >
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={lang.code === language}
            sx={{
              color: lang.code === language ? "primary.main" : "text.primary",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {lang.code === language && (
                <CheckIcon sx={{ color: "primary.main", fontSize: 20 }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="body2">{lang.nativeName}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {lang.name}
                  </Typography>
                </Box>
              }
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
