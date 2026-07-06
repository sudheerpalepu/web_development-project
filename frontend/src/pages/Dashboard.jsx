import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";

import WorkIcon from "@mui/icons-material/Work";
import FavoriteIcon from "@mui/icons-material/Favorite";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RecommendIcon from "@mui/icons-material/Recommend";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import api from "../services/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const response = await api.get("/dashboard/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDashboard(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    const token = localStorage.getItem("token");

    if (!file || !token) return;

    const formData = new FormData();
    formData.append("resume", file);

    setResumeFileName(file.name);
    setResumeLoading(true);
    setResumeError("");

    try {
      const response = await api.post("/resume/analyze", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setResumeAnalysis(response.data);
    } catch (error) {
      setResumeAnalysis(null);
      setResumeError(
        error.response?.data?.detail ||
          "Unable to analyze this resume. Please try another file."
      );
    } finally {
      setResumeLoading(false);
      event.target.value = "";
    }
  };

  if (!dashboard) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5">Please login to view dashboard.</Typography>
      </Box>
    );
  }

  const totalJobs = Number(dashboard.total_jobs_in_database) || 0;
  const savedCareers = Number(dashboard.saved_careers) || 0;
  const savedJobs = Number(dashboard.saved_jobs) || 0;
  const otherJobs = Math.max(totalJobs - savedCareers - savedJobs, 0);
  const hasOverviewData = totalJobs + savedCareers + savedJobs > 0;
  const hasActivityData = savedCareers + savedJobs + otherJobs > 0;

  const statCards = [
    {
      title: "Total Jobs",
      value: totalJobs,
      icon: <WorkIcon />,
      color: "#2563eb",
      bg: "#dbeafe",
    },
    {
      title: "Saved Careers",
      value: savedCareers,
      icon: <FavoriteIcon />,
      color: "#16a34a",
      bg: "#dcfce7",
    },
    {
      title: "Saved Jobs",
      value: savedJobs,
      icon: <TrendingUpIcon />,
      color: "#7c3aed",
      bg: "#ede9fe",
    },
    {
      title: "Role",
      value: dashboard.user.role,
      icon: <PersonIcon />,
      color: "#f97316",
      bg: "#ffedd5",
    },
  ];

  const chartData = [
    { name: "Jobs", value: totalJobs, color: "#2563eb" },
    { name: "Saved Careers", value: savedCareers, color: "#16a34a" },
    { name: "Saved Jobs", value: savedJobs, color: "#7c3aed" },
  ];

  const pieData = hasActivityData
    ? [
        { name: "Saved Careers", value: savedCareers, color: "#2563eb" },
        { name: "Saved Jobs", value: savedJobs, color: "#16a34a" },
        { name: "Other Jobs", value: otherJobs, color: "#f97316" },
      ]
    : [{ name: "No activity yet", value: 1, color: "#cbd5e1" }];

  const maxChartValue = Math.max(...chartData.map((item) => item.value), 1);
  const activityTotal = pieData.reduce((sum, item) => sum + item.value, 0);
  let activityOffset = 0;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Hero Section */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 5,
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          color: "white",
          boxShadow: "0 16px 40px rgba(37, 99, 235, 0.25)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                Welcome, {dashboard.user.name}
              </Typography>

              <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                Track career opportunities, salaries, predictions, and saved
                jobs from one professional dashboard.
              </Typography>

              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                sx={{
                  background: "white",
                  color: "#2563eb",
                  fontWeight: 700,
                  borderRadius: 3,
                  px: 3,
                  "&:hover": {
                    background: "#f8fafc",
                  },
                }}
                onClick={() => {
                  window.location.href = "/search";
                }}
              >
                Search Career
              </Button>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "flex-start", md: "center" },
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: 42,
                    fontWeight: 800,
                    background: "rgba(255,255,255,0.2)",
                    border: "4px solid rgba(255,255,255,0.4)",
                  }}
                >
                  {dashboard.user.name?.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Resume Recommendations */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 4,
          boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    background: "#dbeafe",
                    color: "#2563eb",
                  }}
                >
                  <CloudUploadIcon />
                </Avatar>

                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                    Resume Recommendations
                  </Typography>
                  <Typography color="text.secondary">
                    Upload your resume and the dashboard will detect skills,
                    match career paths, and suggest roles to explore.
                  </Typography>
                </Box>

                <Button
                  component="label"
                  variant="contained"
                  startIcon={
                    resumeLoading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <CloudUploadIcon />
                    )
                  }
                  disabled={resumeLoading}
                  sx={{ borderRadius: 3, fontWeight: 800, alignSelf: "flex-start" }}
                >
                  {resumeLoading ? "Analyzing..." : "Upload Resume"}
                  <input
                    hidden
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleResumeUpload}
                  />
                </Button>

                {resumeFileName && (
                  <Typography variant="body2" color="text.secondary">
                    Selected: {resumeFileName}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <Box sx={{ display: "grid", gap: 2 }}>
                {resumeError && <Alert severity="error">{resumeError}</Alert>}

                {!resumeAnalysis && !resumeError && (
                  <Alert severity="info">
                    Your resume recommendations will appear here after upload.
                  </Alert>
                )}

                {resumeAnalysis && (
                  <>
                    <Alert
                      icon={<CheckCircleIcon fontSize="inherit" />}
                      severity="success"
                    >
                      {resumeAnalysis.summary}
                    </Alert>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {resumeAnalysis.matched_skills.length ? (
                        resumeAnalysis.matched_skills.map((skill) => (
                          <Chip
                            key={skill}
                            label={skill}
                            sx={{
                              background: "#dcfce7",
                              color: "#166534",
                              fontWeight: 800,
                            }}
                          />
                        ))
                      ) : (
                        <Chip label="No skills detected yet" />
                      )}
                    </Box>

                    <Grid container spacing={2}>
                      {resumeAnalysis.recommendations.map((item) => (
                        <Grid item xs={12} md={6} key={item.domain}>
                          <Card
                            variant="outlined"
                            sx={{
                              height: "100%",
                              borderRadius: 3,
                              borderColor: "#cbd5e1",
                            }}
                          >
                            <CardContent>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: 2,
                                  mb: 1,
                                }}
                              >
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                  {item.domain}
                                </Typography>
                                <Chip
                                  icon={<RecommendIcon />}
                                  label={`${item.match_score}%`}
                                  sx={{
                                    background: "#dbeafe",
                                    color: "#1d4ed8",
                                    fontWeight: 800,
                                  }}
                                />
                              </Box>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2 }}
                              >
                                {item.reason}
                              </Typography>

                              <LinearProgress
                                variant="determinate"
                                value={item.match_score}
                                sx={{
                                  height: 8,
                                  borderRadius: 5,
                                  mb: 2,
                                  background: "#e2e8f0",
                                }}
                              />

                              <Typography variant="body2" fontWeight={800}>
                                Skills to learn
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 1 }}>
                                {item.skills_to_learn.map((skill) => (
                                  <Chip key={skill} size="small" label={skill} />
                                ))}
                              </Box>

                              {!!item.jobs?.length && (
                                <>
                                  <Divider sx={{ my: 2 }} />
                                  <Typography variant="body2" fontWeight={800} sx={{ mb: 1 }}>
                                    Matching jobs
                                  </Typography>
                                  <Box sx={{ display: "grid", gap: 1 }}>
                                    {item.jobs.map((job) => (
                                      <Box key={job._id}>
                                        <Typography variant="body2" fontWeight={800}>
                                          {job.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {job.company || "Company not listed"}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              sx={{
                borderRadius: 4,
                height: "100%",
                boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-6px)",
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" fontWeight={700}>
                      {card.title}
                    </Typography>

                    <Typography variant="h4" sx={{ fontWeight: 800 }}>
                      {card.value}
                    </Typography>
                  </Box>

                  <Avatar
                    sx={{
                      background: card.bg,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    background: "#e5e7eb",
                    "& .MuiLinearProgress-bar": {
                      background: card.color,
                    },
                  }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 4,
              minWidth: 0,
              boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            }}
          >
            <CardContent sx={{ minWidth: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                Dashboard Overview
              </Typography>

              <Box
                sx={{
                  minHeight: 320,
                  display: "grid",
                  gap: 2,
                  position: "relative",
                }}
              >
                {chartData.map((item) => {
                  const width = `${Math.max(
                    (item.value / maxChartValue) * 100,
                    item.value > 0 ? 8 : 0
                  )}%`;

                  return (
                    <Box key={item.name}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 2,
                          mb: 1,
                        }}
                      >
                        <Typography fontWeight={700}>{item.name}</Typography>
                        <Typography color="text.secondary" fontWeight={800}>
                          {item.value}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          height: 42,
                          overflow: "hidden",
                          background: "#e2e8f0",
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width,
                            height: "100%",
                            minWidth: item.value > 0 ? 28 : 0,
                            background: item.color,
                            borderRadius: 2,
                            transition: "width 300ms ease",
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}

                {!hasOverviewData && (
                  <Box
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background: "#f8fafc",
                      border: "1px dashed #cbd5e1",
                      borderRadius: 2,
                    }}
                  >
                    <Typography color="text.secondary" fontWeight={700}>
                      No dashboard data yet
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 4,
              height: "100%",
              minWidth: 0,
              boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            }}
          >
            <CardContent sx={{ minWidth: 0 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                Saved Activity
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  gap: 2,
                  minHeight: 260,
                }}
              >
                <Box
                  component="svg"
                  viewBox="0 0 120 120"
                  role="img"
                  aria-label="Saved activity chart"
                  sx={{ width: 210, maxWidth: "100%" }}
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="20"
                  />
                  {pieData.map((item) => {
                    const percent = item.value / activityTotal;
                    const dash = `${percent * 263.89} 263.89`;
                    const offset = activityOffset;
                    activityOffset -= percent * 263.89;

                    return (
                      <circle
                        key={item.name}
                        cx="60"
                        cy="60"
                        r="42"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="20"
                        strokeDasharray={dash}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                    );
                  })}
                  <circle cx="60" cy="60" r="28" fill="white" />
                  <text
                    x="60"
                    y="56"
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="15"
                    fontWeight="800"
                  >
                    {hasActivityData ? savedCareers + savedJobs : 0}
                  </text>
                  <text
                    x="60"
                    y="72"
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="8"
                    fontWeight="700"
                  >
                    saved
                  </text>
                </Box>

                <Box sx={{ width: "100%", display: "grid", gap: 1 }}>
                  {pieData.map((item) => (
                    <Box
                      key={item.name}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: item.color,
                          }}
                        />
                        <Typography variant="body2" fontWeight={700}>
                          {item.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {hasActivityData ? item.value : 0}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Profile + Progress */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                User Profile
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 70,
                    height: 70,
                    background: "#2563eb",
                    fontSize: 28,
                    fontWeight: 800,
                  }}
                >
                  {dashboard.user.name?.charAt(0).toUpperCase()}
                </Avatar>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {dashboard.user.name}
                  </Typography>
                  <Typography color="text.secondary">
                    {dashboard.user.email}
                  </Typography>
                  <Chip
                    label={dashboard.user.role}
                    sx={{
                      mt: 1,
                      background: "#dbeafe",
                      color: "#2563eb",
                      fontWeight: 700,
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                Project Progress
              </Typography>

              <Typography sx={{ mb: 1 }}>Backend API</Typography>
              <LinearProgress
                variant="determinate"
                value={100}
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
              />

              <Typography sx={{ mb: 1 }}>Authentication</Typography>
              <LinearProgress
                variant="determinate"
                value={100}
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
              />

              <Typography sx={{ mb: 1 }}>Frontend Dashboard</Typography>
              <LinearProgress
                variant="determinate"
                value={85}
                sx={{ height: 10, borderRadius: 5, mb: 2 }}
              />

              <Typography sx={{ mb: 1 }}>AWS Deployment</Typography>
              <LinearProgress
                variant="determinate"
                value={35}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
