"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Link from "next/link";

export default function LoginForm() {
  return (
    <>
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Login
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter your email below to login to your account
        </Typography>
      </Box>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          id="email"
          label="Email"
          type="email"
          placeholder="m@example.com"
          required
          fullWidth
          variant="outlined"
        />
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              component="label"
              htmlFor="password"
              variant="body2"
              fontWeight="medium"
            >
              Password
            </Typography>
            <Link href="/forgot-password" passHref>
              <Typography
                variant="body2"
                sx={{ textDecoration: "underline", color: "primary.main" }}
              >
                Forgot your password?
              </Typography>
            </Link>
          </Box>
          <TextField
            id="password"
            type="password"
            required
            fullWidth
            variant="outlined"
          />
        </Box>
        <Button type="submit" variant="contained" fullWidth sx={{ py: 1.5 }}>
          Login
        </Button>
        <Button variant="outlined" fullWidth sx={{ py: 1.5 }}>
          Login with Google
        </Button>
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 2, textAlign: "center" }}
      >
        {"Don't have an account?"}{" "}
        <Link href="/sign-up" passHref>
          <Typography
            component="span"
            sx={{ textDecoration: "underline", color: "primary.main" }}
          >
            Sign up
          </Typography>
        </Link>
      </Typography>
    </>
  );
}
