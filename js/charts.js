// Модуль для работы с графиками Chart.js
const Charts = (function() {
    // Цвета для графиков
    const chartColors = {
        primary: '#6366f1',
        secondary: '#10b981',
        accent: '#f59e0b',
        purple: '#9b59b6',
        yellow: '#f1c40f',
        gray: '#95a5a6'
    };
    
    // Типы тренировок и их цвета
    const workoutTypeColors = {
        'Кардио': chartColors.primary,
        'Силовая': chartColors.secondary,
        'Гибкость': chartColors.accent,
        'Выносливость': chartColors.purple,
        'Другое': chartColors.gray
    };
    
    // Инициализация всех графиков
    let caloriesChart = null;
    let workoutTypesChart = null;
    let detailedCaloriesChart = null;
    let efficiencyChart = null;
    
    // Создание графика калорий (последние 7 дней)
    function initCaloriesChart(data) {
        const ctx = document.getElementById('calories-chart');
        if (!ctx) {
            console.error('Canvas элемент calories-chart не найден');
            return;
        }
        
        const context = ctx.getContext('2d');
        
        if (caloriesChart) {
            caloriesChart.destroy();
        }
        
        const labels = data.map(item => item.formattedDate);
        const calories = data.map(item => item.calories);
        
        console.log('Данные для графика калорий:', { labels, calories });
        
        caloriesChart = new Chart(context, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Сожжено калорий',
                    data: calories,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderColor: chartColors.primary,
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: chartColors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw} ккал`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Калории (ккал)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });
        
        console.log('График калорий создан');
    }
    
    // Создание круговой диаграммы типов тренировок
    function initWorkoutTypesChart(data) {
        const ctx = document.getElementById('workout-types-chart');
        if (!ctx) {
            console.error('Canvas элемент workout-types-chart не найден');
            return;
        }
        
        const context = ctx.getContext('2d');
        
        if (workoutTypesChart) {
            workoutTypesChart.destroy();
        }
        
        const labels = Object.keys(data);
        const values = Object.values(data);
        const backgroundColors = labels.map(label => workoutTypeColors[label] || chartColors.gray);
        
        console.log('Данные для диаграммы типов:', { labels, values });
        
        workoutTypesChart = new Chart(context, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: backgroundColors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.raw / total) * 100);
                                return `${context.label}: ${context.raw} ккал (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
        
        console.log('Диаграмма типов тренировок создана');
    }
    
    // Создание детального графика калорий (для статистики)
    function initDetailedCaloriesChart(workouts) {
        const ctx = document.getElementById('detailed-calories-chart');
        if (!ctx) {
            console.error('Canvas элемент detailed-calories-chart не найден');
            return;
        }
        
        const context = ctx.getContext('2d');
        
        if (detailedCaloriesChart) {
            detailedCaloriesChart.destroy();
        }
        
        // Группировка по дням за последние 30 дней
        const caloriesByDay = {};
        const today = new Date();
        
        // Инициализация последних 30 дней
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            caloriesByDay[dateString] = 0;
        }
        
        // Заполнение данными
        workouts.forEach(workout => {
            if (caloriesByDay.hasOwnProperty(workout.date)) {
                caloriesByDay[workout.date] += workout.calories;
            }
        });
        
        const labels = Object.keys(caloriesByDay).map(date => {
            const d = new Date(date);
            return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        });
        
        const data = Object.values(caloriesByDay);
        
        console.log('Данные для детального графика:', { labels, data });
        
        detailedCaloriesChart = new Chart(context, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Сожжено калорий',
                    data: data,
                    backgroundColor: chartColors.secondary,
                    borderColor: chartColors.secondary,
                    borderWidth: 1,
                    borderRadius: 5,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Калории (ккал)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
        
        console.log('Детальный график калорий создан');
    }
    
    // Создание графика эффективности по типам тренировок
    function initEfficiencyChart(workouts) {
        const ctx = document.getElementById('efficiency-chart');
        if (!ctx) {
            console.error('Canvas элемент efficiency-chart не найден');
            return;
        }
        
        const context = ctx.getContext('2d');
        
        if (efficiencyChart) {
            efficiencyChart.destroy();
        }
        
        // Группировка по типам тренировок
        const typeStats = {};
        
        workouts.forEach(workout => {
            if (!typeStats[workout.typeName]) {
                typeStats[workout.typeName] = {
                    totalCalories: 0,
                    totalDuration: 0,
                    count: 0
                };
            }
            
            typeStats[workout.typeName].totalCalories += workout.calories;
            typeStats[workout.typeName].totalDuration += workout.duration;
            typeStats[workout.typeName].count += 1;
        });
        
        const labels = Object.keys(typeStats);
        const caloriesPerMinute = labels.map(type => {
            const stats = typeStats[type];
            return stats.totalDuration > 0 ? Math.round(stats.totalCalories / stats.totalDuration * 10) / 10 : 0;
        });
        
        const backgroundColors = labels.map(label => workoutTypeColors[label] || chartColors.gray);
        
        console.log('Данные для графика эффективности:', { labels, caloriesPerMinute });
        
        efficiencyChart = new Chart(context, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Калорий в минуту',
                    data: caloriesPerMinute,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
                    borderWidth: 1,
                    borderRadius: 5,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw} ккал/мин`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Ккал/мин'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        console.log('График эффективности создан');
    }
    
    // Обновление всех графиков на дашборде
    function updateDashboardCharts() {
        console.log('Обновление графиков дашборда...');
        const workouts = DataManager.getWorkouts();
        const stats = DataManager.getStatistics(workouts);
        
        console.log('Статистика для графиков:', stats);
        
        initCaloriesChart(stats.caloriesByDay);
        initWorkoutTypesChart(stats.caloriesByType);
        
        console.log('Графики дашборда обновлены');
    }
    
    // Обновление графиков в разделе статистики
    function updateStatisticsCharts(period = '30', type = 'all') {
        console.log('Обновление графиков статистики...');
        const filteredWorkouts = DataManager.filterWorkouts({period, type});
        const stats = DataManager.getStatistics(filteredWorkouts);
        
        console.log('Отфильтрованные тренировки:', filteredWorkouts.length);
        
        initDetailedCaloriesChart(filteredWorkouts);
        initEfficiencyChart(filteredWorkouts);
        
        console.log('Графики статистики обновлены');
        return stats;
    }
    
    // Очистка всех графиков (при удалении данных)
    function destroyAllCharts() {
        console.log('Очистка всех графиков...');
        if (caloriesChart) {
            caloriesChart.destroy();
            caloriesChart = null;
        }
        if (workoutTypesChart) {
            workoutTypesChart.destroy();
            workoutTypesChart = null;
        }
        if (detailedCaloriesChart) {
            detailedCaloriesChart.destroy();
            detailedCaloriesChart = null;
        }
        if (efficiencyChart) {
            efficiencyChart.destroy();
            efficiencyChart = null;
        }
        console.log('Все графики очищены');
    }
    
    return {
        updateDashboardCharts,
        updateStatisticsCharts,
        destroyAllCharts
    };
})();