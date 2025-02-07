import React, { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ChartBar = ({ competency, index, data, getChartImagesFromDB, chart2Data, survey_id, pdf, images, savedImages }) => {
    // Ref for the second chart
    const [chartImage1, setChartImage1] = useState(null); // State for the first chart image
    const [chartImage2, setChartImage2] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [chartWidth, setChartWidth] = useState(700);
    const [chartHeight, setChartHeight] = useState(400);
    const chartRef1 = useRef([]); // Ref for the first chart
    const chartRef2 = useRef([]);
    const chartData = {
        labels: Object.keys(data).map(label => label === "Self" ? label : label + "s"), // Pluralize except "Self"
        datasets: [
            {
                label: 'Average Weightage',
                data: Object.values(data)?.map((item) => item?.averageWeightage),
                backgroundColor: Object.keys(data).map((_, index) => index === 0 ?'rgb(122,188,219)':'rgb(23,74,109)'),            }
        ],
    };

    const chartData2 = {
        labels: chart2Data?.map((item) => {
            const maxLabelLength = 15; // Set the maximum length for display
            const truncatedLabel = item?.question.length > maxLabelLength
                ? item?.question.substring(0, maxLabelLength) + '...'
                : item?.question;
            return truncatedLabel;
        }),
        datasets: [
            {
                label: 'Self',
                data: Object.values(chart2Data)?.map((item) => 
                    Math.min(item?.self_average, 3) // Cap values at 3
                ),
                backgroundColor: 'rgb(122,188,219)',
                lineWidth: 0,
                tickWidth: 0
            },
            {
                label: 'Total others',
                data: Object.values(chart2Data)?.map((item) => 
                    Math.min(item?.other_average, 3) // Cap values at 3
                ),
                backgroundColor: 'rgb(23,74,109)',
                lineWidth: 0,
                tickWidth: 0
            }
        ],
    };

    const options = {
        indexAxis: isMobile ? 'x' : 'y', // Mobile: horizontal bars, Desktop: vertical bars
        responsive: true,
        maintainAspectRatio: false, // Allow the chart to resize appropriately
    
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: competency,
            },
        },
        scales: {
            x: isMobile
                ? {
                      ticks: {
                          color: '#555',
                          font: {
                              size: 14,
                          },
                      },
                      title: {
                          display: true,
                          color: '#333',
                          font: {
                              size: 14,
                          },
                      },
                  }
                : {
                      ticks: {
                          callback: (value) => {
                              const customTicks = [0, 0.5, 1, 1.5, 2, 2.5, 3];
                              return customTicks.includes(value) ? value : null; // Show only specified ticks
                          },
                          color: '#555',
                          font: {
                              size: 14,
                          },
                      },
                      max: 3.0, // Max value for the x-axis
                      title: {
                          display: true,
                          color: '#333',
                          font: {
                              size: 14,
                          },
                      },
                  },
            y: isMobile
                ? {
                      ticks: {
                          callback: (value) => {
                              const customTicks = [0, 0.5, 1, 1.5, 2, 2.5, 3];
                              return customTicks.includes(value) ? value : null; // Show only specified ticks
                          },
                          color: '#555',
                          font: {
                              size: 14,
                          },
                      },
                      max: 3.0, // Max value for the y-axis
                      title: {
                          display: true,
                          color: '#333',
                          font: {
                              size: 14,
                          },
                      },
                  }
                : {
                      ticks: {
                          color: '#555',
                          font: {
                              size: 14,
                          },
                      },
                      title: {
                          display: true,
                          color: '#333',
                          font: {
                              size: 14,
                          },
                      },
                  },
        },
    };
    function wrapLabel(label, maxLineLength) {
        const words = label.split(' ');
        let wrappedLabel = '';
        let line = '';
    
        words.forEach(word => {
            if (line.length + word.length > maxLineLength) {
                wrappedLabel += line.trim() + '\n'; // Start a new line
                line = ''; // Reset the line
            }
            line += word + ' ';
        });
    
        wrappedLabel += line.trim(); // Add the last line
        return wrappedLabel;
    }
    
    
    const options2 = {
        indexAxis: isMobile ? 'x' : 'y',
        responsive: true,
        maintainAspectRatio: false, // Allow the chart to take the full height
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                        family: 'Arial',
                        weight: 'normal',
                        color: '#555',
                    },
                },
            },
            title: {
                display: true,
                text: competency + ` Survey Items`,
                font: {
                    size: 14,
                    weight: 'bold',
                    family: 'Arial',
                    color: '#174A6D',
                },
                padding: {
                    top: 20,
                    bottom: 20,
                },
            },
            // tooltip: {
            //     callbacks: {
            //         label: function (tooltipItem) {
            //             const questionIndex = tooltipItem.dataIndex;
            //             const datasetIndex = tooltipItem.datasetIndex;
            //             const fullQuestion = chart2Data[questionIndex]?.question;
            //             let score = tooltipItem.raw; // Get the score from the dataset
            
            //             // Ensure score does not exceed 3 and round to 2 decimal places
            //             score = Math.min(score, 3).toFixed(2);
            //             return [`${fullQuestion}`, `Score: ${score}`]
            //             // Return the full question prefixed with the score
            //             return `${fullQuestion}\nScore: ${score}`;                    },
            //     },
            // },
        },
        scales: {
            x: isMobile
                ? {
                      ticks: {
                          color: '#555',
                          font: {
                              size: 14,
                          },
                      },
                      title: {
                          display: true,
                          color: '#333',
                          font: {
                              size: 14,
                          },
                    },
                    callback: function (value, index) {
                        const question = chart2Data[index]?.question; // Get the full question
                        return wrapLabel(question, 30); // Wrap the label (adjust the maxLineLength as needed)
                    },
                  }
                : {
                      ticks: {
                          callback: (value) => {
                              const customTicks = [0, 0.5, 1, 1.5, 2, 2.5, 3];
                              return customTicks.includes(value) ? value : null; // Show only specified ticks
                          },
                          color: '#555',
                          font: {
                              size: 14,
                          },
                      },
                      max: 3.0, // Max value for the x-axis
                      title: {
                          display: true,
                          color: '#333',
                          font: {
                              size: 14,
                          },
                    },
                  
                  },
            y: isMobile
                ? {
                      ticks: {
                          callback: (value) => {
                              const customTicks = [0, 0.5, 1, 1.5, 2, 2.5, 3];
                              return customTicks.includes(value) ? value : null; // Show only specified ticks
                          },
                          color: '#555',
                          font: {
                              size: 14,
                          },
                      },
                      max: 3.0, // Max value for the y-axis
                      title: {
                          display: true,
                          color: '#333',
                          font: {
                              size: 14,
                          },
                      },
                  }
                : {
                      ticks: {
                          color: '#555',
                          font: {
                              size: 14,
                          },
                      },
                      title: {
                          display: true,
                          color: '#333',
                          font: {
                              size: 14,
                          },
                    },
                    callback: function (value, index) {
                        const question = chart2Data[index]?.question; // Get the full question
                        return wrapLabel(question, 30); // Wrap the label (adjust the maxLineLength as needed)
                    },
                  },
        },
    };


    
    useEffect(() => {
        const handleResize = () => {
            // Calculate the new chart width based on screen size
            const windowWidth = window.innerWidth;

            if (windowWidth <= 768) {
                setIsMobile(true);
                setChartWidth(300); // Adjust as needed for mobile
                setChartHeight(300); // Adjust as needed for mobile
            } else {
                setIsMobile(false);
                setChartWidth(700);
                setChartHeight(400);; // Default height for larger screens
            }
        };

        // Add an event listener to window resize
        window.addEventListener('resize', handleResize);

        // Call handleResize initially to set the initial dimensions
        handleResize();

        // Remove the event listener when the component unmounts
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

  
    const generateChartImage = (chartRef, setChartImage, type) => {

        if (chartRef) {
            const chartInstance = chartRef;
            const canvas = chartInstance.canvas;
            const image = canvas.toDataURL('image/png');
                
            // Check if the image is not empty
            if (image && image.length > 50) {  // Usually, a base64 image string will be much longer than 50 characters
                setChartImage(image);

                images[type].push(image);
                if (images.chartRef1.length > 2 && images.chartRef2.length > 2 && savedImages == undefined) {
                    saveChartImageToDB(images, survey_id)
                }
            } else {
                console.error('Failed to generate a valid image');
            }
        }
   
    };

    useEffect(() => {
      
        setTimeout(() => {
            if (data && chart2Data && chartRef1.current && chartRef2.current) {
                if (chartRef1.current[index] && chartRef2.current[index]) {
                    // Generate chart images after the charts have rendered
                    generateChartImage(chartRef1.current[index], setChartImage1, "chartRef1");
                    generateChartImage(chartRef2.current[index], setChartImage2, "chartRef2");
                }
            }
        }, 1000);
    
        
    }, [data, chart2Data, index]);
    const saveChartImageToDB = async (chartImage, surveyId) => {
        try {
            const url = `/api/images/save-chart-image`;
            const payload = {
                survey_id: surveyId,  // Pass the survey ID
                summaries_by_competency: chartImage,  // Base64 image data
            };
        
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_X_API_KEY
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                getChartImagesFromDB(surveyId);
                return await response.json();
            } else {
                console.error('Failed to create AssignCompetency');
                return false;
            }
        } catch (error) {
            console.error('Error creating AssignCompetency:', error);
            return false;
        }
    };

    return (
        <div className='pdfContent page-break'>
        <div>
            <h3 className="text-white fw-normal font-frank mt-3" style={{ fontSize: '19px', lineHeight: '30px' }}>
                <span>Competency:</span> {competency}
            </h3>
            <p className="text-sm text-white font-poppins mt-1" style={pdf ? { fontSize: '14px', marginBottom: '14px' } : { fontSize:'14px', marginBottom:'17px'}}>
                The {competency} competency is the proactive and empathetic approach leaders take to understand...
            </p>
            <div className="graph_inner bottom_graph ">
                <div className="row">
                    {!pdf && <div className="col-12 col-lg-6">
                        {/* Chart.js Bar chart */}
                        {!pdf && (
                            <div className="graph-box mb-3" style={{ width: '100%', height: '400px', backgroundColor: '#fff', borderRadius: '10px', padding: '20px 30px' }}>
                                <Bar
                                    ref={(el) => (chartRef1.current[index] = el)}
                                    data={chartData}
                                    options={options}
                                    width={chartWidth}
                                    height={chartHeight}
                                />
                            </div>
                        )}
                        
                    </div>}
                 
                     {
                    (pdf)&& (
                        <div className="col-12 mt-4 p-4 pt-4" style={chartImage1 && pdf ? { backgroundColor: '#ffffff', borderRadius: '10px' } : {}}>
                                <img src={`/public/uploads/${savedImages?.[0]?.['chartRef1']?.[index]}`} alt="First Chart as Image" style={{ maxWidth: '100%', width: '70%'}} />
                                </div>
                    )
                    }
                    {!pdf && <div className="col-12 col-lg-6">
                        {/* Chart.js Bar chart */}
                        {!pdf && (
                            <div className="graph-box mb-3" style={{ width: '100%', height: '400px', backgroundColor: '#fff', borderRadius: '10px', padding: '20px 30px' }}>
                                <Bar
                                    ref={(el) => (chartRef2.current[index] = el)} // Attach the ref for the second chart
                                    data={chartData2}
                                    options={options2}
                                    width={chartWidth}
                                    height={chartHeight}
                                />
                            </div>
                        )}
                      
                    </div>}
                
                    {(pdf)&& (
                        <div className="col-12 mt-4 p-4 pt-4" style={chartImage2 && pdf ? { backgroundColor: '#ffffff', borderRadius: '10px' } : {}}>
                            <img src={`/public/uploads/${savedImages?.[0]?.['chartRef2']?.[index]}`} alt="Second Chart as Image"  style={{ maxWidth: '100%', width: '100%' }} />
                        </div>
                    )
                    }
                </div>
            </div>
            </div>
            </div>
    );
};

export default ChartBar;
