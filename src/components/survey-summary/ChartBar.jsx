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

const ChartBar = ({ competency, data,pdf=false }) => {

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
                pdf?setChartWidth(300):setChartWidth(700);
                pdf?setChartHeight(200):setChartHeight(400); // Default height for larger screens
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
            <h3 className="text-white fw-normal font-frank mt-3" style={{ fontSize:'25px', lineHeight:'30px' }}>
               <span>Competency:</span> {competency}
            </h3>
            <p className="text-sm text-white font-poppins mt-1 mb-4">
                The {competency} competency is the proactive and empathetic approach leaders take to understand...
            </p>
            <div className={`graph_inner bottom_graph ${chartClassName}`}>
                <div className="row">
                    <div className={pdf?"col-12":"col-lg-6"}>
                        {/* graph box */}
                        <div className="graph-box mb-3" style={{width:pdf?"100%":"", height:pdf?"500px":"", backgroundColor: '#fff', borderRadius: '10px', padding: '20px 30px' }}>
                            <Bar data={chartData} options={options} width={pdf?"100%":chartWidth} height={pdf?"100%":chartHeight} />
                        </div>
                    </div>
                    <div className={pdf?"col-12":"col-lg-6"}>
                        <div className="graph-box mb-3" style={{ width:pdf?"100%":"", height:pdf?"500px":"", backgroundColor: '#fff', borderRadius: '10px', padding: '20px 30px' }}>
                            <Bar data={chartData} options={options} width={pdf?"100%":chartWidth} height={pdf?"100%":chartHeight} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ChartBar;
