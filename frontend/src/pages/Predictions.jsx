import { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import WorkIcon from "@mui/icons-material/Work";
import PaidIcon from "@mui/icons-material/Paid";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

import api from "../services/api";

function EmptyChart({ message = "No chart data available" }) {
  return (
    <Box
      sx={{
        minHeight: 220,
        display: "grid",
        placeItems: "center",
        color: "text.secondary",
        background: "#f8fafc",
        border: "1px dashed #cbd5e1",
        borderRadius: 2,
        fontWeight: 800,
        textAlign: "center",
        p: 2,
      }}
    >
      {message}
    </Box>
  );
}

function SimpleBarChart({ data, labelKey, valueKey, color }) {
  const maxValue = Math.max(...data.map((item) => Number(item[valueKey]) || 0), 1);

  if (!data.length) return <EmptyChart />;

  return (
    <Box sx={{ display: "grid", gap: 1.5, minHeight: 300 }}>
      {data.map((item) => {
        const value = Number(item[valueKey]) || 0;
        const width = `${Math.max((value / maxValue) * 100, value > 0 ? 8 : 0)}%`;

        return (
          <Box key={`${item[labelKey]}-${value}`}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                mb: 0.75,
              }}
            >
              <Typography variant="body2" fontWeight={800}>
                {item[labelKey]}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={800}>
                {value}
              </Typography>
            </Box>

            <Box sx={{ height: 28, background: "#e2e8f0", borderRadius: 2 }}>
              <Box
                sx={{
                  width,
                  minWidth: value > 0 ? 24 : 0,
                  height: "100%",
                  background: color,
                  borderRadius: 2,
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function SalaryRangeChart({ data }) {
  const maxValue = Math.max(...data.flatMap((item) => [item.min, item.max]), 1);

  if (!data.length) return <EmptyChart message="No salary data available" />;

  return (
    <Box sx={{ display: "grid", gap: 1.5, minHeight: 300 }}>
      {data.map((item) => (
        <Box key={`${item.title}-${item.min}-${item.max}`}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              mb: 0.75,
            }}
          >
            <Typography variant="body2" fontWeight={800}>
              {item.title}
            </Typography>
            {item.count > 1 && (
              <Typography variant="caption" color="text.secondary" fontWeight={800}>
                {item.count} jobs
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "grid", gap: 0.75 }}>
            {[
              { label: "Min", value: item.min, color: "#7c3aed" },
              { label: "Max", value: item.max, color: "#a78bfa" },
            ].map((bar) => (
              <Box
                key={bar.label}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "42px 1fr 70px",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  {bar.label}
                </Typography>
                <Box sx={{ height: 16, background: "#e2e8f0", borderRadius: 2 }}>
                  <Box
                    sx={{
                      width: `${Math.max((bar.value / maxValue) * 100, 4)}%`,
                      height: "100%",
                      background: bar.color,
                      borderRadius: 2,
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  €{bar.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function DonutChart({ data, colors }) {
  const chartData = data.length
    ? data.map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
      }))
    : [{ type: "No data", value: 1, color: "#cbd5e1" }];
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  let offset = 0;

  return (
    <Box sx={{ display: "grid", placeItems: "center", gap: 2, minHeight: 300 }}>
      <Box
        component="svg"
        viewBox="0 0 120 120"
        role="img"
        aria-label="Contract types chart"
        sx={{ width: 220, maxWidth: "100%" }}
      >
        <circle cx="60" cy="60" r="42" fill="none" stroke="#e2e8f0" strokeWidth="20" />
        {chartData.map((item) => {
          const percent = item.value / total;
          const dash = `${percent * 263.89} 263.89`;
          const currentOffset = offset;
          offset -= percent * 263.89;

          return (
            <circle
              key={item.type}
              cx="60"
              cy="60"
              r="42"
              fill="none"
              stroke={item.color}
              strokeWidth="20"
              strokeDasharray={dash}
              strokeDashoffset={currentOffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          );
        })}
        <circle cx="60" cy="60" r="28" fill="white" />
        <text x="60" y="64" textAnchor="middle" fill="#0f172a" fontSize="14" fontWeight="800">
          {data.length ? total : 0}
        </text>
      </Box>

      <Box sx={{ width: "100%", display: "grid", gap: 1 }}>
        {chartData.map((item) => (
          <Box
            key={item.type}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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
              <Typography variant="body2" fontWeight={800}>
                {item.type}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" fontWeight={800}>
              {data.length ? item.value : 0}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function SimpleLineChart({ data }) {
  if (!data.length) return <EmptyChart message="No posting dates available" />;

  const width = 620;
  const height = 240;
  const padding = 32;
  const maxValue = Math.max(...data.map((item) => item.jobs), 1);
  const step = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const points = data
    .map((item, index) => {
      const x = padding + index * step;
      const y = height - padding - (item.jobs / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Box sx={{ minHeight: 300 }}>
      <Box
        component="svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Jobs posted over time chart"
        sx={{ width: "100%", height: 260 }}
      >
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#cbd5e1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#cbd5e1" />
        <polyline points={points} fill="none" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((item, index) => {
          const x = padding + index * step;
          const y = height - padding - (item.jobs / maxValue) * (height - padding * 2);

          return (
            <g key={item.date}>
              <circle cx={x} cy={y} r="5" fill="#dc2626" />
              <text x={x} y={y - 10} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="700">
                {item.jobs}
              </text>
            </g>
          );
        })}
      </Box>
    </Box>
  );
}

function Predictions() {
  const [domain, setDomain] = useState("Data Science");
  const [result, setResult] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [message, setMessage] = useState("");
  const [applicationJobId, setApplicationJobId] = useState("");
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState("");

  const searchCareer = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      setMessage("Searching career data...");
      setResult(null);
      setSelectedJob(null);
      setApplicationJobId("");
      setResumeAnalysis(null);
      setResumeFileName("");
      setResumeError("");

      const response = await api.get(`/search/${domain}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResult(response.data);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Unable to fetch career information.");
    }
  };

  const saveCareer = async () => {
    const token = localStorage.getItem("token");

    try {
      await api.post(
        "/favorites/career",
        { domain: result.domain },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Career saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to save career.");
    }
  };

  const saveJob = async (job) => {
    const token = localStorage.getItem("token");

    try {
      await api.post(
        "/favorites/job",
        {
          job_id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Job saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Unable to save job.");
    }
  };

  const startApplication = async (job) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setResumeError("Please login before applying.");
      return;
    }

    setSelectedJob(job);
    setApplicationJobId(job._id);
    setResumeAnalysis(null);
    setResumeFileName("");
    setResumeError("");

    try {
      await api.patch(
        `/jobs/${job._id}/apply`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error(error);
      setResumeError("Could not mark this job as applied.");
    }
  };

  const handleApplicationResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    const token = localStorage.getItem("token");

    if (!file) return;

    if (!token) {
      setResumeError("Please login before uploading your resume.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setResumeFileName(file.name);
    setResumeLoading(true);
    setResumeError("");
    setResumeAnalysis(null);

    try {
      const response = await api.post("/resume/analyze", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setResumeAnalysis(response.data);
    } catch (error) {
      setResumeError(
        error.response?.data?.detail ||
          "Unable to analyze this resume. Please try another file."
      );
    } finally {
      setResumeLoading(false);
      event.target.value = "";
    }
  };

  const jobsByLocation = () => {
    if (!result) return [];

    const data = {};
    result.jobs.forEach((job) => {
      const location = job.location || "Unknown";
      data[location] = (data[location] || 0) + 1;
    });

    return Object.entries(data)
      .map(([location, jobs]) => ({ location, jobs }))
      .slice(0, 10);
  };

  const salaryByLocation = () => {
    if (!result) return [];

    const data = {};
    result.jobs.forEach((job) => {
      const location = job.location || "Unknown";
      const min = Number(job.salary_min);
      const max = Number(job.salary_max);

      if (!isNaN(min) && !isNaN(max)) {
        if (!data[location]) {
          data[location] = { total: 0, count: 0 };
        }

        data[location].total += (min + max) / 2;
        data[location].count += 1;
      }
    });

    return Object.entries(data)
      .map(([location, value]) => ({
        location,
        salary: Math.round(value.total / value.count),
      }))
      .slice(0, 10);
  };

  const salaryRanges = () => {
    if (!result) return [];

    const rangesByRole = {};
    const searchedDomain = result.domain?.toLowerCase();

    result.jobs.forEach((job) => {
      const min = Number(job.salary_min);
      const max = Number(job.salary_max);

      if (Number.isNaN(min) || Number.isNaN(max)) return;

      const searchQuery = job.search_query?.trim();
      const role =
        searchQuery && searchQuery.toLowerCase() !== searchedDomain
          ? searchQuery
          : job.title?.trim() || "Unknown Role";

      if (!rangesByRole[role]) {
        rangesByRole[role] = {
          title: role,
          minTotal: 0,
          maxTotal: 0,
          count: 0,
        };
      }

      rangesByRole[role].minTotal += min;
      rangesByRole[role].maxTotal += max;
      rangesByRole[role].count += 1;
    });

    return Object.values(rangesByRole)
      .map((role) => ({
        title:
          role.title.length > 32
            ? role.title.substring(0, 32) + "..."
            : role.title,
        min: Math.round(role.minTotal / role.count),
        max: Math.round(role.maxTotal / role.count),
        count: role.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  };

  const contractTypes = () => {
    if (!result) return [];

    const data = {};
    result.jobs.forEach((job) => {
      const type = job.contract_type || "Unknown";
      data[type] = (data[type] || 0) + 1;
    });

    return Object.entries(data).map(([type, value]) => ({
      type,
      value,
    }));
  };

  const jobsByDate = () => {
    if (!result) return [];

    const data = {};
    result.jobs.forEach((job) => {
      if (job.created) {
        const date = job.created.substring(0, 10);
        data[date] = (data[date] || 0) + 1;
      }
    });

    return Object.entries(data)
      .map(([date, jobs]) => ({ date, jobs }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  const statCards = result
    ? [
        {
          title: "Total Jobs",
          value: result.total_jobs,
          icon: <WorkIcon />,
          color: "#2563eb",
          bg: "#dbeafe",
        },
        {
          title: "Average Salary",
          value: `€${Math.round(result.average_salary)}`,
          icon: <PaidIcon />,
          color: "#16a34a",
          bg: "#dcfce7",
        },
        {
          title: "Career Score",
          value: result.career_score,
          icon: <TrendingUpIcon />,
          color: "#7c3aed",
          bg: "#ede9fe",
        },
        {
          title: "Future Scope",
          value: result.future_scope,
          icon: <StarIcon />,
          color: "#f97316",
          bg: "#ffedd5",
        },
      ]
    : [];

  const pieColors = ["#2563eb", "#16a34a", "#f97316", "#7c3aed", "#dc2626"];

  return (
    <Box sx={{ width: "100%" }}>
      <Card
        sx={{
          mb: 4,
          borderRadius: 5,
          background: "linear-gradient(135deg, #0f172a, #2563eb)",
          color: "white",
          boxShadow: "0 18px 45px rgba(37,99,235,0.25)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
            Career Search & Prediction
          </Typography>

          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            Search a career domain and view job demand, salary insights,
            prediction score, and available jobs.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Example: Cyber Security"
                sx={{
                  background: "white",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={searchCareer}
                sx={{
                  height: "56px",
                  borderRadius: 2,
                  fontWeight: 800,
                  background: "#16a34a",
                  "&:hover": { background: "#15803d" },
                }}
              >
                Search Career
              </Button>
            </Grid>
          </Grid>

          {message && (
            <Typography sx={{ mt: 3, fontWeight: 700 }}>{message}</Typography>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {statCards.map((card) => (
              <Grid item xs={12} sm={6} md={3} key={card.title}>
                <Card
                  sx={{
                    borderRadius: 4,
                    height: "100%",
                    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                    transition: "0.3s",
                    "&:hover": { transform: "translateY(-6px)" },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography color="text.secondary" fontWeight={700}>
                          {card.title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900 }}>
                          {card.value}
                        </Typography>
                      </Box>

                      <Avatar sx={{ background: card.bg, color: card.color }}>
                        {card.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card
            sx={{
              mb: 4,
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
            }}
          >
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>
                {result.domain}
              </Typography>

              <Typography sx={{ mb: 2 }}>{result.recommendation}</Typography>

              <Button
                variant="contained"
                startIcon={<FavoriteIcon />}
                onClick={saveCareer}
                sx={{ borderRadius: 2, fontWeight: 800 }}
              >
                Save Career
              </Button>
            </CardContent>
          </Card>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                    Jobs by Location
                  </Typography>

                  <SimpleBarChart
                    data={jobsByLocation()}
                    labelKey="location"
                    valueKey="jobs"
                    color="#2563eb"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                    Average Salary by Location
                  </Typography>

                  <SimpleBarChart
                    data={salaryByLocation()}
                    labelKey="location"
                    valueKey="salary"
                    color="#16a34a"
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                    Salary Range by Job
                  </Typography>

                  <SalaryRangeChart data={salaryRanges()} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                    Contract Types
                  </Typography>

                  <DonutChart data={contractTypes()} colors={pieColors} />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                    Jobs Posted Over Time
                  </Typography>

                  <SimpleLineChart data={jobsByDate()} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ fontWeight: 900, mb: 2 }}>
            Available Jobs
          </Typography>

          <Grid container spacing={3}>
            {result.jobs.map((job) => (
              <Grid item xs={12} md={6} key={job._id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    height: "100%",
                    boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      {job.title}
                    </Typography>

                    <Chip
                      label={job.company || "Company N/A"}
                      sx={{ my: 1, background: "#dbeafe", color: "#2563eb" }}
                    />

                    <Typography>
                      <b>Location:</b> {job.location || "N/A"}
                    </Typography>

                    <Typography>
                      <b>Salary:</b> {job.salary_min || "N/A"} -{" "}
                      {job.salary_max || "N/A"}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() =>
                          setSelectedJob(selectedJob?._id === job._id ? null : job)
                        }
                        sx={{
                          mr: 1,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 700,
                        }}
                      >
                        {selectedJob?._id === job._id
                          ? "Hide Details"
                          : "View Details"}
                      </Button>

                      <Button
                        variant="contained"
                        startIcon={<FavoriteIcon />}
                        onClick={() => saveJob(job)}
                        sx={{ borderRadius: 2, textTransform: "none" }}
                      >
                        Save
                      </Button>
                    </Box>

                    {selectedJob?._id === job._id && (
                      <Box
                        sx={{
                          mt: 3,
                          p: 3,
                          borderRadius: 3,
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <Typography variant="h6" fontWeight={800} mb={2}>
                          Job Details
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography>
                              <b>Company:</b> {job.company || "N/A"}
                            </Typography>
                            <Typography>
                              <b>Location:</b> {job.location || "N/A"}
                            </Typography>
                            <Typography>
                              <b>Category:</b> {job.category || "N/A"}
                            </Typography>
                            <Typography>
                              <b>Contract:</b> {job.contract_type || "N/A"}
                            </Typography>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Typography>
                              <b>Salary:</b> {job.salary_min || "N/A"} -{" "}
                              {job.salary_max || "N/A"}
                            </Typography>
                            <Typography>
                              <b>Contract Time:</b>{" "}
                              {job.contract_time || "N/A"}
                            </Typography>
                            <Typography>
                              <b>Created:</b> {job.created || "N/A"}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle1" fontWeight={800}>
                          Description
                        </Typography>

                        <Typography sx={{ mt: 1, mb: 2 }}>
                          {job.description || "No description available."}
                        </Typography>

                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => startApplication(job)}
                          sx={{ mr: 2, borderRadius: 2 }}
                        >
                          Apply Now
                        </Button>

                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={<FavoriteIcon />}
                          onClick={() => saveJob(job)}
                          sx={{ borderRadius: 2 }}
                        >
                          Save Job
                        </Button>

                        {applicationJobId === job._id && (
                          <Box
                            sx={{
                              display: "grid",
                              gap: 2,
                              mt: 3,
                              p: 2,
                              background: "#ffffff",
                              border: "1px solid #cbd5e1",
                              borderRadius: 2,
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle1" fontWeight={900}>
                                Upload Resume
                              </Typography>
                              <Typography color="text.secondary">
                                Upload your resume to check matched skills and
                                recommendations before applying.
                              </Typography>
                            </Box>

                            <Button
                              component="label"
                              variant="contained"
                              color="success"
                              startIcon={
                                resumeLoading ? (
                                  <CircularProgress size={18} color="inherit" />
                                ) : (
                                  <CloudUploadIcon />
                                )
                              }
                              disabled={resumeLoading}
                              sx={{
                                width: "fit-content",
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 800,
                              }}
                            >
                              {resumeLoading ? "Analyzing..." : "Choose Resume"}
                              <input
                                hidden
                                type="file"
                                accept=".pdf,.docx,.txt"
                                onChange={handleApplicationResumeUpload}
                              />
                            </Button>

                            {resumeFileName && (
                              <Typography variant="body2" color="text.secondary">
                                Selected: {resumeFileName}
                              </Typography>
                            )}

                            {resumeError && (
                              <Alert severity="error">{resumeError}</Alert>
                            )}

                            {!resumeAnalysis && !resumeError && (
                              <Alert severity="info">
                                Resume recommendations will appear here after
                                upload.
                              </Alert>
                            )}

                            {resumeAnalysis && (
                              <Box sx={{ display: "grid", gap: 1.5 }}>
                                <Alert severity="success">
                                  {resumeAnalysis.summary}
                                </Alert>

                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                  }}
                                >
                                  {(resumeAnalysis.matched_skills || []).length ? (
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

                                {(resumeAnalysis.recommendations || []).length > 0 && (
                                  <Box sx={{ display: "grid", gap: 1 }}>
                                    {resumeAnalysis.recommendations
                                      .slice(0, 3)
                                      .map((item) => (
                                        <Box
                                          key={item.domain}
                                          sx={{
                                            p: 1.5,
                                            border: "1px solid #e2e8f0",
                                            borderRadius: 2,
                                            background: "#ffffff",
                                          }}
                                        >
                                          <Typography fontWeight={900}>
                                            {item.domain} ({item.match_score}%)
                                          </Typography>
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                          >
                                            {item.reason}
                                          </Typography>
                                        </Box>
                                      ))}
                                  </Box>
                                )}
                              </Box>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
}

export default Predictions;
