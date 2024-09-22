import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import CanvasJSReact from "@canvasjs/react-charts";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const Healthreport = () => {
  const location = useLocation();
  const { formData } = location.state;
  const [yearlyChartData, setYearlyChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // State for graph data loading
  const [isDownloading, setIsDownloading] = useState(false); // State for download button loading
  const graphsRef = useRef(null);

  useEffect(() => {
    axios
      .post("https://dairycow-health-prediction.onrender.com/healthreportdata", formData)
      .then((res) => {
        let data = res.data.graphdata;
        let yearlyData = [];

        Object.keys(data).forEach((year) => {
          let fatAvgData = [];
          let snfAvgData = [];
          let mon;

          Object.keys(data[year]).forEach((month) => {
            mon = month;
            for (let j = 1; j < 13; j++) {
              if (data[year][month][j]) {
                const { fat_avg, snf_avg } = data[year][month][j];
                fatAvgData.push({ x: new Date(month, j - 1), y: fat_avg });
                snfAvgData.push({ x: new Date(month, j - 1), y: snf_avg });
              }
            }
          });
          if (fatAvgData.length != 0) {
            yearlyData.push({
              year: mon,
              fatAvgData: fatAvgData,
              snfAvgData: snfAvgData,
            });
          }
        });

        setYearlyChartData(yearlyData);
        setIsLoading(false); // Set loading state to false when data is retrieved
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false); // Set loading state to false in case of error
      });
  }, [formData]);

  const downloadReport = () => {
    setIsDownloading(true); // Set download button loading state to true

    const pdf = new jsPDF("landscape"); // Create a new PDF instance with landscape orientation

    yearlyChartData.forEach((yearData, index) => {
      const filename = `health_report_${yearData.year}.pdf`;

      html2canvas(graphsRef.current.children[index]).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");

        pdf.addImage(
          imgData,
          "PNG",
          0,
          0,
          pdf.internal.pageSize.getWidth(),
          pdf.internal.pageSize.getHeight()
        );

        if (index < yearlyChartData.length - 1) {
          pdf.addPage("landscape");
        }

        if (index === yearlyChartData.length - 1) {
          pdf.save("health_report_combined.pdf");
          setIsDownloading(false); // Set download button loading state to false when download is completed
        }
      });
    });
  };

  return (
    <div className="col-12 align-self-center">
      <p className="h4 text-primary font-italic text-center">
        Diary Cow Health Chart
      </p>

      {isLoading ? ( // Render loader while data is being fetched
        <div className="text-center">Loading...</div>
      ) : (
        <div>
          {yearlyChartData.length > 0 ? ( // Check if there is data to display
            <div>
              <div
                ref={graphsRef}
                className="col-12 align-self-center"
                style={{
                  overflowY: "scroll",
                  maxHeight: "70vh",
                  position: "relative",
                }}
              >
                {yearlyChartData.map((yearData, index) => (
                  <div key={yearData.year}>
                    <h3>Cow Health Status of {yearData.year}</h3>
                    <CanvasJSChart
                      options={{
                        animationEnabled: true,
                        axisX: {
                          title: "Month",
                          valueFormatString: "MMM",
                        },
                        axisY: {
                          title: "Deviation",
                        },
                        backgroundColor: "transparent",
                        data: [
                          {
                            type: "spline",
                            name: "Fat Deviation",
                            showInLegend: true,
                            dataPoints: yearData.fatAvgData,
                          },
                          {
                            type: "spline",
                            name: "SNF Deviation",
                            showInLegend: true,
                            dataPoints: yearData.snfAvgData,
                          },
                        ],
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="d-flex justify-content-center">
                <button
                  className="btn-primary btn-block col-6"
                  onClick={downloadReport}
                  disabled={isDownloading} // Disable the button while downloading
                >
                  {isDownloading ? "Downloading..." : "Download the report"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">No data found for any year.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Healthreport;
