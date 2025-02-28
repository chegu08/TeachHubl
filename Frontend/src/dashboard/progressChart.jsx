import './progressChart.css'
import { Bar } from 'react-chartjs-2'
import { Chart, LinearScale, CategoryScale, BarElement, Legend, Tooltip, plugins } from 'chart.js'

Chart.register(LinearScale, CategoryScale, BarElement, Legend, Tooltip);

function ProgressChart() {

    const DataSet = {
        data: [40, 55, 20, 30, 40, 50, 60],
        backgroundColor: "orange",
        borderWidth: 0.5,
        borderRadius: 25,
        barThickness: 20,
        order: 1,
        categoryPercentage: 1
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // Allows better control of bar spacing
        plugins: {
            legend: {
                display: false,

            }
        },
        scales: {
            x: {
                grid: { display: false },
                categoryPercentage: 0.6,  // Reduce space between bars (default 0.8)
                barPercentage: 0.5,     // Increase bar width
                stacked: true
            },
            y: {
                beginAtZero: true,
                stacked: true,
                min: 0,       // Start from 0
                max: 60,     // End at 100
                ticks: {
                    stepSize: 10 // Increments of 10
                }
            }
        }
    };
    const data = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [DataSet]
    }
    return (
        <div style={{ height: "200px", width: "400px", margin: "auto" }}>
            <Bar data={data} options={options} />
        </div>

    );
}

export default ProgressChart