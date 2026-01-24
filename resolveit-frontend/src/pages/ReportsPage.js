import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut, Radar, PolarArea, Scatter } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../services/api';
import '../styles/ReportsPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler
);

export default function ReportsPage() {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [categoryReports, setCategoryReports] = useState([]);
  const [statusReports, setStatusReports] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [exportingPDF, setExportingPDF] = useState(false);

  // Refs for chart containers
  const reportsRef = useRef(null);
  const statsGridRef = useRef(null);
  const chartsRef = useRef(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Use user-specific endpoints instead of system-wide
      const [dashRes, catRes, statRes, trendRes] = await Promise.all([
        api.get('/api/reports/my/dashboard'),
        api.get('/api/reports/my/categories'),
        api.get('/api/reports/my/status'),
        api.get('/api/reports/my/trends').catch(() => ({ data: { status: 'error' } }))
      ]);

      if (dashRes.data.status === 'success') {
        setDashboardStats(dashRes.data.stats);
      }
      if (catRes.data.status === 'success') {
        setCategoryReports(catRes.data.reports);
      }
      if (statRes.data.status === 'success') {
        setStatusReports(statRes.data.reports);
      }
      if (trendRes.data.status === 'success') {
        setTrendData(trendRes.data.trends || []);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      // Use user-specific CSV export
      const response = await api.get('/api/reports/my/export/csv', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my_complaints_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV:', err);
      alert('Failed to export report');
    }
  };

  const exportPDF = async () => {
    if (!dashboardStats || exportingPDF) return;
    
    setExportingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Add title and header
      pdf.setFontSize(24);
      pdf.setTextColor(46, 125, 50);
      pdf.text('📊 Complaint Management Report', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;

      // Add summary statistics section
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text('📈 Executive Summary', 20, yPosition);
      yPosition += 15;

      // Create stats in a more organized layout
      const statsData = [
        { label: 'Total Complaints', value: dashboardStats.totalComplaints, icon: '📝' },
        { label: 'Resolved', value: dashboardStats.resolvedComplaints, icon: '✅' },
        { label: 'Pending', value: dashboardStats.pendingComplaints, icon: '⏳' },
        { label: 'Escalated', value: dashboardStats.escalatedComplaints, icon: '⚡' },
        { label: 'Resolution Rate', value: `${dashboardStats.resolutionRate}%`, icon: '🎯' },
        { label: 'Avg Resolution Time', value: `${dashboardStats.averageResolutionTimeHours}h`, icon: '⏱️' }
      ];

      pdf.setFontSize(11);
      let col = 0;
      statsData.forEach((stat, index) => {
        const xPos = 25 + (col * 85);
        pdf.setTextColor(46, 125, 50);
        pdf.text(`${stat.icon} ${stat.label}:`, xPos, yPosition);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'bold');
        pdf.text(stat.value.toString(), xPos, yPosition + 6);
        pdf.setFont(undefined, 'normal');
        
        col++;
        if (col >= 2) {
          col = 0;
          yPosition += 18;
        }
      });

      if (col > 0) yPosition += 18;
      yPosition += 10;

      // Capture and add charts
      const chartContainers = document.querySelectorAll('.chart-container');
      let chartCount = 0;
      
      for (let i = 0; i < chartContainers.length && chartCount < 8; i++) {
        const container = chartContainers[i];
        const canvas = container.querySelector('canvas');
        const chartTitle = container.querySelector('.chart-title')?.textContent || `Chart ${chartCount + 1}`;
        
        if (!canvas) continue;

        // Check if we need a new page
        if (yPosition > pageHeight - 100) {
          pdf.addPage();
          yPosition = 20;
        }

        // Add chart title
        pdf.setFontSize(14);
        pdf.setTextColor(46, 125, 50);
        pdf.text(chartTitle, 20, yPosition);
        yPosition += 12;

        try {
          // Method 1: Direct canvas capture (preferred for Chart.js)
          const imgData = canvas.toDataURL('image/png', 1.0);
          const imgWidth = 170;
          const aspectRatio = canvas.height / canvas.width;
          const imgHeight = Math.min(imgWidth * aspectRatio, 90);
          
          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 15;
          chartCount++;
          
        } catch (error) {
          console.warn('Direct canvas capture failed, trying html2canvas:', error);
          
          try {
            // Method 2: html2canvas fallback
            const canvasElement = await html2canvas(container, {
              backgroundColor: '#ffffff',
              scale: 2,
              logging: false,
              useCORS: true
            });
            
            const imgData = canvasElement.toDataURL('image/png', 0.9);
            const imgWidth = 170;
            const aspectRatio = canvasElement.height / canvasElement.width;
            const imgHeight = Math.min(imgWidth * aspectRatio, 90);
            
            pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 15;
            chartCount++;
            
          } catch (fallbackError) {
            console.warn('html2canvas also failed:', fallbackError);
            pdf.setFontSize(10);
            pdf.setTextColor(150, 150, 150);
            pdf.text('📊 Chart visualization not available in PDF', 25, yPosition);
            yPosition += 20;
          }
        }
      }

      // Add category data table if available
      if (categoryReports.length > 0) {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(16);
        pdf.setTextColor(46, 125, 50);
        pdf.text('📂 Category Analysis', 20, yPosition);
        yPosition += 15;

        // Table headers
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'bold');
        
        const headers = ['Category', 'Total', 'Resolved', 'Pending', 'Rate %', 'Avg Time'];
        const colWidths = [50, 20, 20, 20, 20, 25];
        let xPos = 20;

        // Draw header background
        pdf.setFillColor(240, 240, 240);
        pdf.rect(20, yPosition - 5, 155, 8, 'F');

        headers.forEach((header, index) => {
          pdf.text(header, xPos + 2, yPosition);
          xPos += colWidths[index];
        });
        yPosition += 10;
        pdf.setFont(undefined, 'normal');

        // Table data
        categoryReports.forEach((report, rowIndex) => {
          if (yPosition > pageHeight - 15) {
            pdf.addPage();
            yPosition = 20;
          }

          // Alternate row colors
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(248, 248, 248);
            pdf.rect(20, yPosition - 4, 155, 7, 'F');
          }

          xPos = 20;
          const rowData = [
            report.category.substring(0, 15),
            report.totalCount.toString(),
            report.resolvedCount.toString(),
            report.pendingCount.toString(),
            `${Math.round((report.resolvedCount / report.totalCount) * 100)}%`,
            `${report.averageResolutionTimeHours.toFixed(1)}h`
          ];

          rowData.forEach((data, index) => {
            pdf.text(data, xPos + 2, yPosition);
            xPos += colWidths[index];
          });
          yPosition += 7;
        });
      }

      // Add footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
        pdf.text('Generated by ResolveIt System', 20, pageHeight - 10);
      }

      // Save the PDF
      pdf.save(`complaint_report_with_charts_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setExportingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="reports-container">
        <div className="reports-wrapper">
          <div className="loading-state">
            <div className="loading-icon">📊</div>
            <p>Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-wrapper">
        {/* Header */}
        <div className="reports-header">
          <div className="reports-header-content">
            <div>
              <h1 className="reports-title">
                📊 My Reports & Analytics
              </h1>
              <p className="reports-subtitle">
                Your personal complaint management insights
              </p>
            </div>
            <div className="reports-export-buttons">
              <button
                onClick={exportCSV}
                className="btn-secondary"
              >
                📥 Export CSV
              </button>
              <button
                onClick={exportPDF}
                className="btn-secondary"
                disabled={exportingPDF}
              >
                {exportingPDF ? '📄 Generating PDF...' : '📄 Export PDF'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="reports-tabs">
            {['dashboard', 'categories', 'status', 'trends'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`reports-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab === 'dashboard' && '📊 Dashboard'}
                {tab === 'categories' && '📂 Categories'}
                {tab === 'status' && '📈 Status'}
                {tab === 'trends' && '📉 Trends'}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardStats && (
          <div>
            {/* Stats Cards */}
            <div className="stats-grid">
              <StatCard
                icon="📝"
                title="Total Complaints"
                value={dashboardStats.totalComplaints}
                color="var(--color-primary-500)"
              />
              <StatCard
                icon="✅"
                title="Resolved"
                value={dashboardStats.resolvedComplaints}
                color="var(--color-success-500)"
              />
              <StatCard
                icon="⏳"
                title="Pending"
                value={dashboardStats.pendingComplaints}
                color="var(--color-warning-500)"
              />
              <StatCard
                icon="⚡"
                title="Escalated"
                value={dashboardStats.escalatedComplaints}
                color="var(--color-error-500)"
              />
              <StatCard
                icon="📅"
                title="Recent (7 days)"
                value={dashboardStats.recentComplaints}
                color="var(--color-secondary-500)"
              />
              <StatCard
                icon="⏱️"
                title="Avg Resolution Time"
                value={`${dashboardStats.averageResolutionTimeHours}h`}
                color="var(--color-info-500)"
              />
              <StatCard
                icon="🎯"
                title="Resolution Rate"
                value={`${dashboardStats.resolutionRate}%`}
                color="var(--color-accent-500)"
              />
            </div>

            {/* Charts Section */}
            <div className="charts-section">
              <div className="charts-grid">
                {/* Status Distribution Pie Chart */}
                <div className="chart-container">
                  <h3 className="chart-title">📊 Status Distribution</h3>
                  <div className="chart-wrapper">
                    <Pie
                      data={{
                        labels: statusReports.map(report => report.status),
                        datasets: [{
                          data: statusReports.map(report => report.count),
                          backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40'
                          ],
                          borderWidth: 2,
                          borderColor: '#fff'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 20,
                              usePointStyle: true
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const percentage = statusReports[context.dataIndex]?.percentage || 0;
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Category Performance Bar Chart */}
                <div className="chart-container">
                  <h3 className="chart-title">📂 Category Performance</h3>
                  <div className="chart-wrapper">
                    <Bar
                      data={{
                        labels: categoryReports.map(report => report.category),
                        datasets: [
                          {
                            label: 'Total',
                            data: categoryReports.map(report => report.totalCount),
                            backgroundColor: 'rgba(54, 162, 235, 0.8)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                          },
                          {
                            label: 'Resolved',
                            data: categoryReports.map(report => report.resolvedCount),
                            backgroundColor: 'rgba(75, 192, 192, 0.8)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                          },
                          {
                            label: 'Pending',
                            data: categoryReports.map(report => report.pendingCount),
                            backgroundColor: 'rgba(255, 206, 86, 0.8)',
                            borderColor: 'rgba(255, 206, 86, 1)',
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: false
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(0,0,0,0.1)'
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Resolution Rate Doughnut */}
              <div className="chart-container full-width">
                <h3 className="chart-title">🎯 Resolution Performance</h3>
                <div className="performance-charts">
                  <div className="chart-wrapper small">
                    <Doughnut
                      data={{
                        labels: ['Resolved', 'Pending'],
                        datasets: [{
                          data: [
                            dashboardStats.resolvedComplaints,
                            dashboardStats.pendingComplaints
                          ],
                          backgroundColor: ['#4CAF50', '#FF9800'],
                          borderWidth: 3,
                          borderColor: '#fff'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }}
                    />
                    <div className="chart-center-text">
                      <div className="center-percentage">{dashboardStats.resolutionRate}%</div>
                      <div className="center-label">Resolution Rate</div>
                    </div>
                  </div>
                  
                  <div className="performance-stats">
                    <div className="performance-stat">
                      <div className="stat-number">{dashboardStats.averageResolutionTimeHours}h</div>
                      <div className="stat-label">Avg Resolution Time</div>
                    </div>
                    <div className="performance-stat">
                      <div className="stat-number">{dashboardStats.recentComplaints}</div>
                      <div className="stat-label">Recent (7 days)</div>
                    </div>
                    <div className="performance-stat">
                      <div className="stat-number">{dashboardStats.escalatedComplaints}</div>
                      <div className="stat-label">Escalated</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Analytics Section */}
              <div className="advanced-charts-section">
                <h3 className="section-title">🔬 Advanced Analytics</h3>
                
                <div className="charts-grid advanced">
                  {/* Performance Radar Chart */}
                  <div className="chart-container">
                    <h4 className="chart-title">📡 Performance Radar</h4>
                    <div className="chart-wrapper">
                      <Radar
                        data={{
                          labels: [
                            'Resolution Speed',
                            'Response Time',
                            'User Satisfaction',
                            'Category Coverage',
                            'Escalation Rate',
                            'Follow-up Rate'
                          ],
                          datasets: [{
                            label: 'Current Performance',
                            data: [
                              Math.min(100, (100 - dashboardStats.averageResolutionTimeHours * 2)),
                              85, // Mock response time score
                              Math.min(100, dashboardStats.resolutionRate + 10),
                              Math.min(100, categoryReports.length * 15),
                              Math.max(0, 100 - (dashboardStats.escalatedComplaints * 10)),
                              75 // Mock follow-up rate
                            ],
                            backgroundColor: 'rgba(99, 102, 241, 0.2)',
                            borderColor: 'rgba(99, 102, 241, 1)',
                            borderWidth: 2,
                            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          },
                          scales: {
                            r: {
                              beginAtZero: true,
                              max: 100,
                              grid: {
                                color: 'rgba(0,0,0,0.1)'
                              },
                              angleLines: {
                                color: 'rgba(0,0,0,0.1)'
                              },
                              pointLabels: {
                                font: {
                                  size: 12
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Category Distribution Polar Area */}
                  <div className="chart-container">
                    <h4 className="chart-title">🌐 Category Distribution</h4>
                    <div className="chart-wrapper">
                      <PolarArea
                        data={{
                          labels: categoryReports.map(report => report.category),
                          datasets: [{
                            data: categoryReports.map(report => report.totalCount),
                            backgroundColor: [
                              'rgba(255, 99, 132, 0.7)',
                              'rgba(54, 162, 235, 0.7)',
                              'rgba(255, 205, 86, 0.7)',
                              'rgba(75, 192, 192, 0.7)',
                              'rgba(153, 102, 255, 0.7)',
                              'rgba(255, 159, 64, 0.7)'
                            ],
                            borderColor: [
                              'rgba(255, 99, 132, 1)',
                              'rgba(54, 162, 235, 1)',
                              'rgba(255, 205, 86, 1)',
                              'rgba(75, 192, 192, 1)',
                              'rgba(153, 102, 255, 1)',
                              'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 2
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                padding: 15,
                                usePointStyle: true
                              }
                            }
                          },
                          scales: {
                            r: {
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0,0,0,0.1)'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Resolution Time vs Complexity Scatter */}
                  <div className="chart-container full-width">
                    <h4 className="chart-title">⚡ Resolution Time Analysis</h4>
                    <div className="chart-wrapper">
                      <Scatter
                        data={{
                          datasets: [{
                            label: 'Complaints',
                            data: categoryReports.map((report, index) => ({
                              x: report.averageResolutionTimeHours,
                              y: report.totalCount,
                              category: report.category
                            })),
                            backgroundColor: 'rgba(99, 102, 241, 0.6)',
                            borderColor: 'rgba(99, 102, 241, 1)',
                            borderWidth: 2,
                            pointRadius: 8,
                            pointHoverRadius: 12
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              callbacks: {
                                title: function(context) {
                                  const point = context[0];
                                  return categoryReports[point.dataIndex]?.category || 'Category';
                                },
                                label: function(context) {
                                  return [
                                    `Resolution Time: ${context.parsed.x}h`,
                                    `Total Complaints: ${context.parsed.y}`
                                  ];
                                }
                              }
                            }
                          },
                          scales: {
                            x: {
                              title: {
                                display: true,
                                text: 'Average Resolution Time (hours)'
                              },
                              grid: {
                                color: 'rgba(0,0,0,0.1)'
                              }
                            },
                            y: {
                              title: {
                                display: true,
                                text: 'Number of Complaints'
                              },
                              beginAtZero: true,
                              grid: {
                                color: 'rgba(0,0,0,0.1)'
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="reports-content">
            <div className="section-header">
              <h2>📂 Category Analysis</h2>
              <p>Detailed breakdown of complaints by category</p>
            </div>
            
            {/* Category Chart */}
            <div className="chart-container">
              <div className="chart-wrapper large">
                <Bar
                  data={{
                    labels: categoryReports.map(report => report.category),
                    datasets: [
                      {
                        label: 'Total Complaints',
                        data: categoryReports.map(report => report.totalCount),
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                      },
                      {
                        label: 'Resolved',
                        data: categoryReports.map(report => report.resolvedCount),
                        backgroundColor: 'rgba(34, 197, 94, 0.8)',
                        borderColor: 'rgba(34, 197, 94, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          padding: 20,
                          usePointStyle: true
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                          stepSize: 1
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Additional Category Analytics */}
            <div className="category-analytics">
              <div className="charts-grid">
                {/* Category Efficiency Radar */}
                <div className="chart-container">
                  <h4 className="chart-title">⚡ Category Efficiency</h4>
                  <div className="chart-wrapper">
                    <Radar
                      data={{
                        labels: categoryReports.slice(0, 6).map(report => report.category),
                        datasets: [{
                          label: 'Resolution Rate (%)',
                          data: categoryReports.slice(0, 6).map(report => 
                            Math.round((report.resolvedCount / report.totalCount) * 100)
                          ),
                          backgroundColor: 'rgba(34, 197, 94, 0.2)',
                          borderColor: 'rgba(34, 197, 94, 1)',
                          borderWidth: 2,
                          pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                          pointBorderColor: '#fff',
                          pointHoverBackgroundColor: '#fff',
                          pointHoverBorderColor: 'rgba(34, 197, 94, 1)'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        },
                        scales: {
                          r: {
                            beginAtZero: true,
                            max: 100,
                            grid: {
                              color: 'rgba(0,0,0,0.1)'
                            },
                            angleLines: {
                              color: 'rgba(0,0,0,0.1)'
                            },
                            pointLabels: {
                              font: {
                                size: 11
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Category Volume Doughnut */}
                <div className="chart-container">
                  <h4 className="chart-title">📊 Volume Distribution</h4>
                  <div className="chart-wrapper">
                    <Doughnut
                      data={{
                        labels: categoryReports.map(report => report.category),
                        datasets: [{
                          data: categoryReports.map(report => report.totalCount),
                          backgroundColor: [
                            '#FF6384',
                            '#36A2EB', 
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40',
                            '#FF6384',
                            '#C9CBCF'
                          ],
                          borderWidth: 3,
                          borderColor: '#fff',
                          hoverBorderWidth: 4
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '50%',
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              padding: 15,
                              usePointStyle: true,
                              font: {
                                size: 12
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const total = categoryReports.reduce((sum, report) => sum + report.totalCount, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Table */}
            <div className="table-container">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total</th>
                    <th>Resolved</th>
                    <th>Pending</th>
                    <th>Resolution Rate</th>
                    <th>Avg Time (hrs)</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryReports.map((report, index) => (
                    <tr key={index}>
                      <td>
                        <div className="category-cell">
                          <span className="category-icon">{getCategoryIcon(report.category)}</span>
                          {report.category}
                        </div>
                      </td>
                      <td>
                        <span className="count-badge total">{report.totalCount}</span>
                      </td>
                      <td>
                        <span className="count-badge resolved">{report.resolvedCount}</span>
                      </td>
                      <td>
                        <span className="count-badge pending">{report.pendingCount}</span>
                      </td>
                      <td>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${(report.resolvedCount / report.totalCount * 100)}%`,
                              backgroundColor: getProgressColor(report.resolvedCount / report.totalCount * 100)
                            }}
                          ></div>
                          <span className="progress-text">
                            {Math.round(report.resolvedCount / report.totalCount * 100)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="time-badge">
                          {report.averageResolutionTimeHours.toFixed(1)}h
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && (
          <div className="reports-content">
            <div className="section-header">
              <h2>📈 Status Distribution</h2>
              <p>Current status breakdown of all complaints</p>
            </div>

            <div className="status-charts">
              {/* Status Pie Chart */}
              <div className="chart-container">
                <h3 className="chart-title">Status Overview</h3>
                <div className="chart-wrapper">
                  <Pie
                    data={{
                      labels: statusReports.map(report => report.status),
                      datasets: [{
                        data: statusReports.map(report => report.count),
                        backgroundColor: [
                          '#3B82F6', // Blue
                          '#10B981', // Green  
                          '#F59E0B', // Yellow
                          '#EF4444', // Red
                          '#8B5CF6', // Purple
                          '#F97316'  // Orange
                        ],
                        borderWidth: 3,
                        borderColor: '#fff',
                        hoverBorderWidth: 4
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                              size: 14
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const percentage = statusReports[context.dataIndex]?.percentage || 0;
                              return `${context.label}: ${context.parsed} complaints (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Status Grid */}
            <div className="status-grid">
              {statusReports.map((report, index) => (
                <div key={index} className="status-card enhanced">
                  <div className="status-header">
                    <div className="status-icon">
                      {getStatusIcon(report.status)}
                    </div>
                    <div className="status-info">
                      <div className="status-count">{report.count}</div>
                      <div className="status-name">{report.status}</div>
                    </div>
                  </div>
                  <div className="status-footer">
                    <div className="status-percentage">{report.percentage}%</div>
                    <div className="status-bar">
                      <div 
                        className="status-fill" 
                        style={{ 
                          width: `${report.percentage}%`,
                          backgroundColor: getStatusColor(report.status)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="reports-content">
            <div className="section-header">
              <h2>📉 Complaint Trends</h2>
              <p>Historical data and trend analysis</p>
            </div>

            {trendData.length > 0 ? (
              <div className="chart-container">
                <div className="chart-wrapper large">
                  <Line
                    data={{
                      labels: trendData.map(item => item.date),
                      datasets: [
                        {
                          label: 'New Complaints',
                          data: trendData.map(item => item.newComplaints),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderWidth: 3,
                          fill: true,
                          tension: 0.4,
                          pointBackgroundColor: 'rgb(59, 130, 246)',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 6
                        },
                        {
                          label: 'Resolved',
                          data: trendData.map(item => item.resolvedComplaints),
                          borderColor: 'rgb(34, 197, 94)',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          borderWidth: 3,
                          fill: true,
                          tension: 0.4,
                          pointBackgroundColor: 'rgb(34, 197, 94)',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 6
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      plugins: {
                        legend: {
                          position: 'top',
                          labels: {
                            padding: 20,
                            usePointStyle: true
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0,0,0,0.1)'
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="no-data-message">
                <div className="no-data-icon">📈</div>
                <h3>No Trend Data Available</h3>
                <p>Trend data will appear here once you have more complaint history.</p>
              </div>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="back-section">
          <Link to="/officer-dashboard" className="modern-link">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="stat-card" style={{ '--stat-color': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">
        {value}
      </div>
      <div className="stat-title">{title}</div>
    </div>
  );
}

function getStatusIcon(status) {
  const icons = {
    'New': '🆕',
    'Under Review': '👀',
    'In Progress': '⚙️',
    'Resolved': '✅',
    'Escalated': '⚡'
  };
  return icons[status] || '📋';
}

function getCategoryIcon(category) {
  const icons = {
    'Infrastructure': '🏗️',
    'Public Services': '🏛️',
    'Safety': '🛡️',
    'Environment': '🌱',
    'Transportation': '🚌',
    'Other': '📋'
  };
  return icons[category] || '📂';
}

function getStatusColor(status) {
  const colors = {
    'New': '#3B82F6',
    'Under Review': '#8B5CF6',
    'In Progress': '#F59E0B',
    'Resolved': '#10B981',
    'Escalated': '#EF4444'
  };
  return colors[status] || '#6B7280';
}

function getProgressColor(percentage) {
  if (percentage >= 80) return '#10B981'; // Green
  if (percentage >= 60) return '#F59E0B'; // Yellow
  if (percentage >= 40) return '#F97316'; // Orange
  return '#EF4444'; // Red
}