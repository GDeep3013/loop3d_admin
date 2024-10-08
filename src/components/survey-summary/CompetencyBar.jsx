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
import axios from 'axios';

// Register the necessary Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const CompetencyBar = ({ data, pdf = false ,survey_id,savedImages}) => {
    const chartRef1 = useRef(null);
    const [chartImage1, setChartImage1] = useState(null); // State for the first chart image

    // Extract competency names as labels
    const labels = Object.keys(data); // Competencies like 'Communication', 'Leadership', 'Problem Solving'

    // console.log(labels);
    // Create datasets for each rater category using 'averageWeightage'
    const chartData = {
        labels, // Competency names on the y-axis
        datasets: [
            {
                label: 'Self',
                data: labels.map((competency) => data[competency]?.Self?.averageWeightage || 0),
                backgroundColor: 'rgb(23,74,109)',
            },
            {
                label: 'Direct Report',
                data: labels.map((competency) => data[competency]?.['Direct Report']?.averageWeightage || 0),
                backgroundColor: 'rgb(122,188,219)', 
            },
            {
                label: 'Teammate',
                data: labels.map((competency) => data[competency]?.Teammate?.averageWeightage || 0),
                backgroundColor: 'rgb(204,204,204)', 
            },
            {
                label: 'Supervisor',
                data: labels.map((competency) => data[competency]?.Supervisor?.averageWeightage || 0),
                backgroundColor: 'rgb(0,0,0)', 
            },
            {
                label: 'Other',
                data: labels.map((competency) => data[competency]?.Other?.averageWeightage || 0),
                backgroundColor: 'rgb(153,153,153)', 
            },
        ],
    };

    // Chart options configuration
    const options = {
        indexAxis: 'y', // Horizontal bars
        responsive: true,
        maintainAspectRatio: false, // Disable aspect ratio to manage height manually
        scales: {
            x: {
                beginAtZero: true, // Ensure the chart starts at 0
            },
            y: {
                beginAtZero: true, // Ensure the y-axis starts at 0
                grid: {
                    display: false, // Hide grid lines for a cleaner look
                },
            },
        },
        plugins: {
            legend: {
                position: 'top', // Position legend at the top of the chart
            },
            title: {
                display: true,
                text: 'Competency Chart by Rater Type', // Clear title indicating the data
            },
        },
    };


    const [chartClassName, setChartClassName] = useState(''); 
    const [chartWidth, setChartWidth] = useState(700); // Initialize chartWidth state
    const [chartHeight, setChartHeight] = useState(400);

    useEffect(() => {
        const handleResize = () => {
            // Calculate the new chart width based on screen size
            const windowWidth = window.innerWidth;

            if (windowWidth <= 768) {
                // Apply mobile styling if screen width is less than or equal to 768 pixels
                setChartClassName('mobile-chart');
                setChartWidth(300); // Adjust as needed for mobile
                setChartHeight(300); // Adjust as needed for mobile
            } else {
                // Use default styling for larger screens
                setChartClassName('');
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

    const saveChartImageToDB = async (chartImage, surveyId) => {
        try {
            const url = `/api/images/save-chart-image`;
            const payload = {
                survey_id: surveyId,  // Pass the survey ID
                chart_image: chartImage,  // Base64 image data
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
    
    const generateChartImage = (chartRef, setChartImage) => {
        if (chartRef.current) {
            const chartInstance = chartRef.current;
            const canvas = chartInstance.canvas;
    
            // Delay the generation slightly to ensure the chart has rendered
            setTimeout(() => {
                const image = canvas.toDataURL('image/png');
                setChartImage(image);
                console.log(savedImages?.chart_image);
                if (!savedImages?.chart_image) {
                    saveChartImageToDB(image, survey_id);
                }
            }, 500); // Delay for 500ms to ensure the chart is rendered
        }
    };

    useEffect(() => {
        if (data && chartRef1.current) {
            generateChartImage(chartRef1, setChartImage1); // Generate image for the first chart
        }
    }, [data, chartRef1]);
 
    return (
        <div className={`graph_inner ${chartClassName}`}>
            {!pdf && (<Bar data={chartData} ref={chartRef1} options={options} width={pdf ? "100%" : chartWidth} height={pdf ? "100%" : chartHeight} />)}
            {(pdf) && (
                <img src={`/public/uploads/${savedImages?.chart_image}`} alt="First Chart as Image" style={{ maxWidth: '100%', width: '100%',height:"240px" }} />
            )}
        </div>
    );
};

export default CompetencyBar;
