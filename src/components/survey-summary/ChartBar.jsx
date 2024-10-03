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

const ChartBar = ({ competency, data, chart2Data, pdf }) => {
    const chartRef1 = useRef(null); // Ref for the first chart
    const chartRef2 = useRef(null); // Ref for the second chart
    const [chartImage1, setChartImage1] = useState(null); // State for the first chart image
    const [chartImage2, setChartImage2] = useState(null); // State for the second chart image

    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: 'Average Weightage',
                data: Object.values(data).map((item) => item.averageWeightage),
                backgroundColor: 'rgb(23,74,109)',
            }
        ],
    };

    const chartData2 = {
        labels: chart2Data.map((item) => item.question),
        datasets: [
            {
                label: 'Self',
                data: Object.values(chart2Data).map((item) => item.self_average),
                backgroundColor: 'rgb(23,74,109)',
            },
            {
                label: 'Total others',
                data: Object.values(chart2Data).map((item) => item.other_average),
                backgroundColor: 'rgb(122,188,219)',
            }
        ],
    };

    const options = {
        indexAxis: 'y',
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                
            },
            title: {
                display: true,
                text: 'Competency Chart',
            },
        },
    };
    function wrapLabel(label, maxWidth) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '14px Arial'; // Adjust font size and family to match your chart
    
        const words = label.split(' ');
        let lines = [];
        let currentLine = '';
    
        words.forEach((word) => {
            const testLine = currentLine + word + ' ';
            const testWidth = context.measureText(testLine).width;
    
            // If the test line exceeds the max width, push the current line and start a new one
            if (testWidth > maxWidth) {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        });
    
        lines.push(currentLine.trim()); // Push the last line
        return lines.join('\n'); // Return the lines as a single string
    }
    
    
    const options2 = {
        indexAxis: 'y',
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
                text: 'Competency Chart',
                font: {
                    size: 24,
                    weight: 'bold',
                    family: 'Arial',
                    color: '#174A6D',
                },
                padding: {
                    top: 20,
                    bottom: 20,
                },
            },
        },
        scales: {
            x: {
                ticks: {
                    color: '#555',
                    font: {
                        size: 14,
                    },
                },
            },
            y: {
                ticks: {
                    color: '#555',
                    font: {
                        size: 14,
                    },
                    callback: function(value) {
                        // Get the label for the current value
                        const label = this.getLabelForValue(value);
                        
                        // Wrap the label to a specific width
                        return wrapLabel(label, 100); // Adjust the width based on your needs
                    },
                },
            },
        },
    };


    const [chartWidth, setChartWidth] = useState(700);
    const [chartHeight, setChartHeight] = useState(400);
    useEffect(() => {
        const handleResize = () => {
            // Calculate the new chart width based on screen size
            const windowWidth = window.innerWidth;

            if (windowWidth <= 768) {
                setChartWidth(300); // Adjust as needed for mobile
                setChartHeight(300); // Adjust as needed for mobile
            } else {
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

    // Function to generate chart image from canvas
    const generateChartImage = (chartRef, setChartImage) => {
        if (chartRef.current) {
            const chartInstance = chartRef.current;
            const canvas = chartInstance.canvas;
            const image = canvas.toDataURL('image/png');
            setChartImage(image);
        }
    };

    useEffect(() => {
        generateChartImage(chartRef1, setChartImage1); // Generate image for the first chart
        generateChartImage(chartRef2, setChartImage2); // Generate image for the second chart
    }, [data, chart2Data]); // Run on data changes

    return (
        <div>
            <h3 className="text-white fw-normal font-frank mt-3" style={{ fontSize: '19px', lineHeight: '30px' }}>
                <span>Competency:</span> {competency}
            </h3>
            <p className="text-sm text-white font-poppins mt-1" style={pdf ? { fontSize: '14px', marginBottom: '14px' } : { fontSize:'14px', marginBottom:'17px'}}>
                The {competency} competency is the proactive and empathetic approach leaders take to understand...
            </p>
            <div className="graph_inner bottom_graph">
                <div className="row">
                    {!pdf && <div className="col-12 col-lg-6">
                        {/* Chart.js Bar chart */}
                        {!pdf && (
                            <div className="graph-box mb-3" style={{ width: '100%', height: '400px', backgroundColor: '#fff', borderRadius: '10px', padding: '20px 30px' }}>
                                <Bar
                                    ref={chartRef1} // Attach the ref for the first chart
                                    data={chartData}
                                    options={options}
                                    width={chartWidth}
                                    height={chartHeight}
                                />
                            </div>
                        )}
                        
                    </div>}
                 
                     {
                    (chartImage1 && pdf)&& (
                        <div className="col-12 mt-4 p-4" style={chartImage1 && pdf ? { backgroundColor: '#ffffff', borderRadius: '10px' } : {}}>
                                <img src={chartImage1} alt="First Chart as Image" style={{ maxWidth: '100%', width: '100%'}} />
                                </div>
                    )
                    }
                    {!pdf && <div className="col-12 col-lg-6">
                        {/* Chart.js Bar chart */}
                        {!pdf && (
                            <div className="graph-box mb-3" style={{ width: '100%', height: '400px', backgroundColor: '#fff', borderRadius: '10px', padding: '20px 30px' }}>
                                <Bar
                                    ref={chartRef2} // Attach the ref for the second chart
                                    data={chartData2}
                                    options={options2}
                                    width={chartWidth}
                                    height={chartHeight}
                                />
                            </div>
                        )}
                      
                    </div>}
                
                    {(chartImage2 && pdf)&& (
                        <div className="col-12 mt-4 p-4" style={chartImage2 && pdf ? { backgroundColor: '#ffffff', borderRadius: '10px' } : {}}>
                            <img src={chartImage2} alt="Second Chart as Image" style={{ maxWidth: '100%', width: '100%' }} />
                        </div>
                    )
                    }
                </div>
            </div>
        </div>
    );
};

export default ChartBar;
