// Модуль для управления данными тренировок
const DataManager = (function() {
    // Ключ для localStorage
    const STORAGE_KEY = 'fitness-tracker-workouts';
    
    // Инициализация данных - НЕ генерируем демо-данные
    function initData() {
        const workouts = getWorkouts();
        console.log('Загружено тренировок:', workouts.length);
        return workouts;
    }
    
    // Генерация тестовых данных для демонстрации - УДАЛЕНА
    
    // Получение всех тренировок
    function getWorkouts() {
        const workoutsJSON = localStorage.getItem(STORAGE_KEY);
        if (workoutsJSON) {
            try {
                return JSON.parse(workoutsJSON);
            } catch (e) {
                console.error('Ошибка при парсинге данных:', e);
                return [];
            }
        }
        return [];
    }
    
    // Сохранение всех тренировок
    function saveWorkouts(workouts) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
            console.log('Данные сохранены:', workouts.length, 'тренировок');
        } catch (e) {
            console.error('Ошибка при сохранении данных:', e);
        }
    }
    
    // Добавление новой тренировки
    function addWorkout(workout) {
        const workouts = getWorkouts();
        workout.id = Date.now() + Math.random(); // Генерация уникального ID
        workouts.push(workout);
        saveWorkouts(workouts);
        console.log('Тренировка добавлена:', workout);
        return workout;
    }
    
    // Удаление тренировки по ID
    function deleteWorkout(id) {
        let workouts = getWorkouts();
        const initialLength = workouts.length;
        workouts = workouts.filter(workout => workout.id !== id);
        saveWorkouts(workouts);
        const success = initialLength !== workouts.length;
        console.log('Тренировка удалена:', success ? 'успешно' : 'не найдена');
        return success;
    }
    
    // Очистка всех данных
    function clearAllWorkouts() {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Все данные очищены');
    }
    
    // Фильтрация тренировок по параметрам
    function filterWorkouts({period = 'all', type = 'all', search = ''} = {}) {
        let workouts = getWorkouts();
        
        // Фильтрация по периоду
        if (period !== 'all') {
            const days = parseInt(period);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            workouts = workouts.filter(workout => {
                const workoutDate = new Date(workout.date);
                return workoutDate >= cutoffDate;
            });
        }
        
        // Фильтрация по типу
        if (type !== 'all') {
            workouts = workouts.filter(workout => workout.type === type);
        }
        
        // Фильтрация по поисковому запросу
        if (search.trim() !== '') {
            const searchLower = search.toLowerCase();
            workouts = workouts.filter(workout => 
                workout.notes.toLowerCase().includes(searchLower) || 
                workout.typeName.toLowerCase().includes(searchLower)
            );
        }
        
        // Сортировка по дате (сначала новые)
        workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return workouts;
    }
    
    // Получение статистики
    function getStatistics(workouts) {
        if (workouts.length === 0) {
            return {
                totalWorkouts: 0,
                totalCalories: 0,
                totalTime: 0,
                avgDuration: 0,
                avgCalories: 0,
                longestWorkout: 0,
                caloriesByDay: [],
                caloriesByType: {}
            };
        }
        
        const totalWorkouts = workouts.length;
        const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0);
        const totalTime = workouts.reduce((sum, workout) => sum + workout.duration, 0);
        const avgDuration = Math.round(totalTime / totalWorkouts);
        const avgCalories = Math.round(totalCalories / totalWorkouts);
        const longestWorkout = Math.max(...workouts.map(w => w.duration));
        
        // Группировка калорий по дням (последние 7 дней)
        const caloriesByDay = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const dayWorkouts = workouts.filter(w => w.date === dateString);
            const dayCalories = dayWorkouts.reduce((sum, w) => sum + w.calories, 0);
            
            caloriesByDay.push({
                date: dateString,
                calories: dayCalories,
                formattedDate: formatDate(date)
            });
        }
        
        // Группировка калорий по типам тренировок
        const caloriesByType = {};
        workouts.forEach(workout => {
            if (!caloriesByType[workout.typeName]) {
                caloriesByType[workout.typeName] = 0;
            }
            caloriesByType[workout.typeName] += workout.calories;
        });
        
        return {
            totalWorkouts,
            totalCalories,
            totalTime,
            avgDuration,
            avgCalories,
            longestWorkout,
            caloriesByDay,
            caloriesByType
        };
    }
    
    // Форматирование даты
    function formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}.${month}`;
    }
    
    // Получение лучшей тренировки (по калориям)
    function getBestWorkout() {
        const workouts = getWorkouts();
        if (workouts.length === 0) return null;
        
        return workouts.reduce((best, current) => 
            current.calories > best.calories ? current : best
        );
    }
    
    // Получение названия типа тренировки по ключу
    function getTypeName(typeKey) {
        const typeNames = {
            'cardio': 'Кардио',
            'strength': 'Силовая',
            'flexibility': 'Гибкость',
            'endurance': 'Выносливость',
            'other': 'Другое'
        };
        
        return typeNames[typeKey] || 'Неизвестно';
    }
    
    // Получение названия интенсивности по ключу
    function getIntensityName(intensityKey) {
        const intensityNames = {
            'low': 'Низкая',
            'medium': 'Средняя',
            'high': 'Высокая'
        };
        
        return intensityNames[intensityKey] || 'Неизвестно';
    }
    
    return {
        initData,
        getWorkouts,
        addWorkout,
        deleteWorkout,
        clearAllWorkouts,
        filterWorkouts,
        getStatistics,
        getBestWorkout,
        getTypeName,
        getIntensityName
    };
})();