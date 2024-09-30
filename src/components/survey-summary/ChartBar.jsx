import React, { useEffect, useState } from 'react';
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

// Register the necessary Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ChartBar = ({ competency, data }) => {
   
    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: 'Average Weightage',
                data: Object.values(data).map((item) => item.averageWeightage),
                backgroundColor: 'rgb(23,74,109)',
            },
            {
                label: 'Total Questions',
                data: Object.values(data).map((item) => item.totalQuestions),
                backgroundColor: 'rgb(122,188,219)',
            },
            {
                label: 'Total Weightage',
                data: Object.values(data).map((item) => item.totalWeightage),
                backgroundColor: 'rgb(158,179,194)',
            },
        ],
    };

    const options = {
        indexAxis: 'y', // This makes the bars horizontal
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

    return (
        <div>
            <h3 className="text-custom-color text-lg sm:text-xl font-poppins font-extrabold uppercase">
                            Competency: {competency}
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-gray-600 font-poppins mt-4 mb-4">
            The {competency} competency is the proactive and empathetic approach leaders take to understand...
        </p>
        <div className={`graph_inner bottom_graph ${chartClassName}`} style={{ width: '40%', }}>
            <Bar data={chartData} options={options}  width={chartWidth} height={chartHeight}/>
            </div>
        </div>
    );
};

export default ChartBar;
