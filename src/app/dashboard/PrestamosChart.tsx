"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function PrestamosChart({
  labels,
  data
}: {
  labels: string[];
  data: number[];
}) {
  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: "Préstamos",
            data,
            backgroundColor: "#00450d"
          }
        ]
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }}
      height={200}
    />
  );
}
