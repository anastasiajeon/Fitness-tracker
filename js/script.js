// Основной файл приложения
document.addEventListener('DOMContentLoaded', function() {
    // Переменные для состояния приложения
    let workoutToDelete = null;
    
    // ==================== УТИЛИТАРНЫЕ ФУНКЦИИ ====================
    
    // Показать уведомление
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                  type === 'error' ? 'exclamation-circle' : 
                                  'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" aria-label="Закрыть уведомление">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Проверяем, нет ли уже такого уведомления
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Добавление стилей для уведомления, если их еще нет
        if (!document.querySelector('.notification-styles')) {
            const style = document.createElement('style');
            style.className = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                    padding: 18px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 300px;
                    max-width: 400px;
                    z-index: 10000;
                    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-left: 5px solid #6366f1;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .notification-success {
                    border-left-color: #10b981;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), white);
                }
                
                .notification-error {
                    border-left-color: #ef4444;
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), white);
                }
                
                .notification-info {
                    border-left-color: #3b82f6;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), white);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-grow: 1;
                }
                
                .notification-content i {
                    font-size: 1.3rem;
                }
                
                .notification-success .notification-content i {
                    color: #10b981;
                }
                
                .notification-error .notification-content i {
                    color: #ef4444;
                }
                
                .notification-info .notification-content i {
                    color: #3b82f6;
                }
                
                .notification-content span {
                    font-weight: 500;
                    color: #1f2937;
                    font-size: 1.05rem;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: #6b7280;
                    cursor: pointer;
                    font-size: 1rem;
                    margin-left: 20px;
                    padding: 4px;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                
                .notification-close:hover {
                    background: #f3f4f6;
                    color: #1f2937;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Добавление уведомления на страницу
        document.body.appendChild(notification);
        
        // Закрытие уведомления по кнопке
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
        
        // Автоматическое закрытие уведомления через 5 секунд
        const autoCloseTimer = setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
        
        // Сохраняем таймер для возможной отмены
        notification._autoCloseTimer = autoCloseTimer;
    }
    
    // Форматирование даты для отображения
    function formatDisplayDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return dateString;
            }
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        } catch (e) {
            return dateString;
        }
    }
    
    // Получение иконки для типа тренировки
    function getWorkoutIcon(type) {
        const icons = {
            'cardio': 'running',
            'strength': 'dumbbell',
            'flexibility': 'spa',
            'endurance': 'tachometer-alt',
            'other': 'heartbeat'
        };
        return icons[type] || 'dumbbell';
    }
    
    // Показать приветственное уведомление
    function showWelcomeNotification() {
        setTimeout(() => {
            const workouts = DataManager.getWorkouts();
            if (workouts.length > 0) {
                showNotification(`Добро пожаловать! У вас ${workouts.length} тренировок`, 'info');
            } else {
                showNotification('Добро пожаловать! Добавьте свою первую тренировку', 'info');
            }
        }, 1000);
    }
    
    // ==================== НАВИГАЦИЯ С ЯКОРЯМИ ====================
    
    function initNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                const href = this.getAttribute('href');
                
                // Если это обычный переход по якорю, обрабатываем его
                if (href && href.startsWith('#')) {
                    // Прокручиваем к нужной секции
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        // Плавная прокрутка с учетом высоты шапки
                        const headerHeight = document.querySelector('.header').offsetHeight;
                        const targetPosition = targetElement.offsetTop - headerHeight - 20;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
                
                // Удаление активного класса у всех кнопок
                navButtons.forEach(btn => btn.classList.remove('active'));
                
                // Добавление активного класса текущей кнопке
                this.classList.add('active');
                
                // Скрываем все секции
                document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
                
                // Показываем нужную секцию
                const tabElement = document.getElementById(tabId);
                if (tabElement) {
                    tabElement.classList.add('active');
                    
                    // Загружаем данные для текущей вкладки
                    switch(tabId) {
                        case 'dashboard':
                            loadDashboard();
                            break;
                        case 'statistics':
                            loadStatistics();
                            break;
                        case 'history':
                            loadHistory();
                            break;
                    }
                }
                
                // Обновляем URL без перезагрузки страницы
                history.pushState(null, null, href);
            });
        });
        
        // Обработка навигации по истории браузера
        window.addEventListener('popstate', function() {
            const hash = window.location.hash;
            if (hash) {
                const tabId = hash.substring(1);
                const tabElement = document.getElementById(tabId);
                if (tabElement) {
                    // Обновляем активные кнопки и секции
                    navButtons.forEach(btn => btn.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
                    
                    const activeButton = document.querySelector(`[href="${hash}"]`);
                    if (activeButton) {
                        activeButton.classList.add('active');
                    }
                    
                    tabElement.classList.add('active');
                    
                    // Загружаем данные если нужно
                    switch(tabId) {
                        case 'dashboard':
                            loadDashboard();
                            break;
                        case 'statistics':
                            loadStatistics();
                            break;
                        case 'history':
                            loadHistory();
                            break;
                    }
                }
            }
        });
    }
    
    // ==================== ФОРМА ДОБАВЛЕНИЯ ТРЕНИРОВКИ ====================
    
    function initForm() {
        const form = document.getElementById('workout-form');
        const clearButton = document.getElementById('clear-form');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                saveWorkout();
            });
        }
        
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                if (form) form.reset();
                const dateInput = document.getElementById('workout-date');
                if (dateInput) {
                    const today = new Date();
                    const formattedDate = today.toISOString().split('T')[0];
                    dateInput.value = formattedDate;
                }
                document.getElementById('workout-intensity').value = 'medium';
                updateFormPreview();
                showNotification('Форма очищена', 'info');
            });
        }
    }
    
    // Настройка предпросмотра формы в реальном времени
    function setupFormPreview() {
        const formInputs = document.querySelectorAll('#workout-form input, #workout-form select, #workout-form textarea');
        
        formInputs.forEach(input => {
            input.addEventListener('input', updateFormPreview);
            input.addEventListener('change', updateFormPreview);
        });
        
        // Первоначальное обновление предпросмотра
        updateFormPreview();
    }
    
    // Обновление предпросмотра формы
    function updateFormPreview() {
        const type = document.getElementById('workout-type')?.value || '';
        const date = document.getElementById('workout-date')?.value || '';
        const duration = document.getElementById('workout-duration')?.value || '0';
        const calories = document.getElementById('calories-burned')?.value || '0';
        const intensity = document.getElementById('workout-intensity')?.value || 'medium';
        const notes = document.getElementById('workout-notes')?.value || '';
        
        // Обновление предпросмотра
        const previewType = document.getElementById('preview-type');
        const previewDate = document.getElementById('preview-date');
        const previewDuration = document.getElementById('preview-duration');
        const previewCalories = document.getElementById('preview-calories');
        const previewIntensity = document.getElementById('preview-intensity');
        const previewNotes = document.getElementById('preview-notes');
        
        if (previewType) previewType.textContent = type ? DataManager.getTypeName(type) : 'Выберите тип тренировки';
        if (previewDate) previewDate.textContent = date ? formatDisplayDate(date) : 'Сегодня';
        if (previewDuration) previewDuration.textContent = duration;
        if (previewCalories) previewCalories.textContent = calories;
        if (previewIntensity) previewIntensity.textContent = DataManager.getIntensityName(intensity);
        if (previewNotes) previewNotes.textContent = notes || 'Пока нет заметок';
    }
    
    // Сохранение тренировки
    function saveWorkout() {
        const type = document.getElementById('workout-type')?.value;
        const date = document.getElementById('workout-date')?.value;
        const duration = document.getElementById('workout-duration')?.value;
        const calories = document.getElementById('calories-burned')?.value;
        const intensity = document.getElementById('workout-intensity')?.value;
        const notes = document.getElementById('workout-notes')?.value;
        
        // Валидация
        if (!type) {
            showNotification('Пожалуйста, выберите тип тренировки', 'error');
            document.getElementById('workout-type').focus();
            return;
        }
        
        if (!date) {
            showNotification('Пожалуйста, укажите дату тренировки', 'error');
            document.getElementById('workout-date').focus();
            return;
        }
        
        if (!duration || parseInt(duration) <= 0) {
            showNotification('Пожалуйста, укажите корректную длительность', 'error');
            document.getElementById('workout-duration').focus();
            return;
        }
        
        if (parseInt(duration) > 300) {
            showNotification('Длительность тренировки не может превышать 300 минут', 'error');
            document.getElementById('workout-duration').focus();
            return;
        }
        
        if (!calories || parseInt(calories) <= 0) {
            showNotification('Пожалуйста, укажите корректное количество калорий', 'error');
            document.getElementById('calories-burned').focus();
            return;
        }
        
        // Ограничение в 2000 калорий
        if (parseInt(calories) > 2000) {
            showNotification('Количество калорий не может превышать 2000', 'error');
            document.getElementById('calories-burned').focus();
            return;
        }
        
        const workout = {
            type: type,
            typeName: DataManager.getTypeName(type),
            date: date,
            duration: parseInt(duration),
            calories: parseInt(calories),
            intensity: intensity || 'medium',
            notes: notes || ''
        };
        
        DataManager.addWorkout(workout);
        
        // Оповещение пользователя
        showNotification('Тренировка успешно сохранена!', 'success');
        
        // Сброс формы
        const form = document.getElementById('workout-form');
        if (form) {
            form.reset();
            const dateInput = document.getElementById('workout-date');
            if (dateInput) {
                const today = new Date();
                const formattedDate = today.toISOString().split('T')[0];
                dateInput.value = formattedDate;
            }
            document.getElementById('workout-intensity').value = 'medium';
        }
        
        updateFormPreview();
        
        // Обновление дашборда
        loadDashboard();
        
        // Переход на вкладку истории
        const historyTab = document.querySelector('[href="#history"]');
        if (historyTab) {
            historyTab.click();
        }
    }
    
    // ==================== ДАШБОРД ====================
    
    function loadDashboard() {
        console.log('Загрузка дашборда...');
        const workouts = DataManager.getWorkouts();
        console.log('Найдено тренировок:', workouts.length);
        
        const stats = DataManager.getStatistics(workouts);
        const bestWorkout = DataManager.getBestWorkout();
        
        // Обновление карточек
        const totalCaloriesEl = document.getElementById('total-calories');
        const totalWorkoutsEl = document.getElementById('total-workouts');
        const avgDurationEl = document.getElementById('avg-duration');
        const bestWorkoutEl = document.getElementById('best-workout');
        
        if (totalCaloriesEl) {
            totalCaloriesEl.textContent = stats.totalCalories;
            console.log('Общие калории:', stats.totalCalories);
        }
        
        if (totalWorkoutsEl) {
            totalWorkoutsEl.textContent = stats.totalWorkouts;
            console.log('Всего тренировок:', stats.totalWorkouts);
        }
        
        if (avgDurationEl) {
            avgDurationEl.textContent = stats.avgDuration;
            console.log('Средняя длительность:', stats.avgDuration);
        }
        
        // ИСПРАВЛЕНИЕ: Отображаем только число и "ккал"
        if (bestWorkoutEl) {
            if (bestWorkout) {
                bestWorkoutEl.textContent = bestWorkout.calories;
                console.log('Лучшая тренировка:', bestWorkout.calories, 'ккал');
            } else {
                bestWorkoutEl.textContent = '0';
            }
        }
        
        // Обновление графиков
        Charts.updateDashboardCharts();
        
        console.log('Дашборд загружен успешно');
    }
    
    // ==================== СТАТИСТИКА ====================
    
    function initStatisticsFilters() {
        const periodSelect = document.getElementById('stats-period');
        const typeSelect = document.getElementById('stats-type');
        
        if (periodSelect) {
            periodSelect.addEventListener('change', loadStatistics);
        }
        
        if (typeSelect) {
            typeSelect.addEventListener('change', loadStatistics);
        }
    }
    
    function loadStatistics() {
        const period = document.getElementById('stats-period')?.value || '30';
        const type = document.getElementById('stats-type')?.value || 'all';
        
        const stats = Charts.updateStatisticsCharts(period, type);
        
        // Обновление статистических данных
        const statsElements = {
            'stats-total-workouts': stats.totalWorkouts,
            'stats-total-calories': stats.totalCalories,
            'stats-total-time': Math.round(stats.totalTime / 60),
            'stats-avg-duration': stats.avgDuration,
            'stats-avg-calories': stats.avgCalories,
            'stats-longest': stats.longestWorkout
        };
        
        for (const [id, value] of Object.entries(statsElements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
    }
    
    // ==================== ИСТОРИЯ ТРЕНИРОВОК ====================
    
    function initHistory() {
        const searchInput = document.getElementById('history-search');
        const clearButton = document.getElementById('clear-history');
        
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                loadHistory(this.value);
            });
        }
        
        if (clearButton) {
            clearButton.addEventListener('click', function() {
                if (confirm('Вы уверены, что хотите удалить всю историю тренировок?\nЭто действие нельзя отменить.')) {
                    DataManager.clearAllWorkouts();
                    loadHistory();
                    loadDashboard();
                    Charts.destroyAllCharts();
                    showNotification('История тренировок очищена', 'info');
                }
            });
        }
        
        // Обработка кликов по кнопкам "Добавить тренировку"
        document.addEventListener('click', function(e) {
            if (e.target.closest('.go-to-add')) {
                e.preventDefault();
                const addWorkoutTab = document.querySelector('[href="#add-workout"]');
                if (addWorkoutTab) {
                    addWorkoutTab.click();
                }
            }
        });
    }
    
    function loadHistory(search = '') {
        const historyContainer = document.getElementById('workout-history');
        if (!historyContainer) return;
        
        const workouts = DataManager.filterWorkouts({search});
        
        if (workouts.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-dumbbell"></i>
                    <p>${search ? 'По вашему запросу ничего не найдено' : 'У вас пока нет добавленных тренировок<br>Начните отслеживать свой прогресс прямо сейчас!'}</p>
                    <button class="btn btn-primary">
                        <i class="fas fa-plus-circle"></i> Добавить первую тренировку
                    </button>
                </div>
            `;
            
            // Добавление обработчика для кнопки
            const addButton = historyContainer.querySelector('.btn-primary');
            if (addButton) {
                addButton.addEventListener('click', function() {
                    const addWorkoutTab = document.querySelector('[href="#add-workout"]');
                    if (addWorkoutTab) {
                        addWorkoutTab.click();
                    }
                });
            }
            
            return;
        }
        
        let historyHTML = '';
        
        workouts.forEach(workout => {
            historyHTML += `
                <div class="workout-item" data-id="${workout.id}">
                    <div class="workout-info">
                        <div class="workout-header">
                            <span class="workout-type">
                                <i class="fas fa-${getWorkoutIcon(workout.type)}"></i>
                                ${workout.typeName}
                            </span>
                            <span class="workout-date">${formatDisplayDate(workout.date)}</span>
                        </div>
                        <div class="workout-details">
                            <div class="workout-detail">
                                <i class="fas fa-clock"></i>
                                <span>${workout.duration} мин</span>
                            </div>
                            <div class="workout-detail">
                                <i class="fas fa-fire"></i>
                                <span>${workout.calories} ккал</span>
                            </div>
                            <div class="workout-detail">
                                <i class="fas fa-bolt"></i>
                                <span>${DataManager.getIntensityName(workout.intensity)}</span>
                            </div>
                        </div>
                        ${workout.notes ? `<div class="workout-notes">${workout.notes}</div>` : ''}
                    </div>
                    <div class="workout-actions">
                        <button class="action-btn delete-btn" data-id="${workout.id}" title="Удалить тренировку">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        historyContainer.innerHTML = historyHTML;
        
        // Добавление обработчиков для кнопок удаления
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const id = parseFloat(this.getAttribute('data-id'));
                showDeleteModal(id);
            });
        });
    }
    
    // ==================== МОДАЛЬНОЕ ОКНО ====================
    
    function initModal() {
        const modal = document.getElementById('delete-modal');
        const confirmButton = document.getElementById('confirm-delete');
        const cancelButton = document.getElementById('cancel-delete');
        
        if (confirmButton) {
            confirmButton.addEventListener('click', function() {
                if (workoutToDelete) {
                    const success = DataManager.deleteWorkout(workoutToDelete);
                    
                    if (success) {
                        showNotification('Тренировка удалена', 'success');
                        loadHistory(document.getElementById('history-search')?.value || '');
                        loadDashboard();
                        
                        // Если мы на вкладке статистики, обновляем ее
                        if (document.getElementById('statistics')?.classList.contains('active')) {
                            loadStatistics();
                        }
                    } else {
                        showNotification('Не удалось удалить тренировку', 'error');
                    }
                    
                    hideModal();
                    workoutToDelete = null;
                }
            });
        }
        
        if (cancelButton) {
            cancelButton.addEventListener('click', hideModal);
        }
        
        // Закрытие модального окна при клике вне его
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    hideModal();
                }
            });
        }
        
        // Закрытие модального окна по клавише Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal?.classList.contains('active')) {
                hideModal();
            }
        });
    }
    
    function showDeleteModal(id) {
        workoutToDelete = id;
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.classList.add('active');
            // Фокусируемся на кнопке отмены для доступности
            document.getElementById('cancel-delete')?.focus();
        }
    }
    
    function hideModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // ==================== ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ ====================
    
    function initApp() {
        console.log('Инициализация приложения...');
        
        // Инициализация данных
        DataManager.initData();
        
        // Инициализация навигации
        initNavigation();
        
        // Инициализация формы
        initForm();
        
        // Инициализация фильтров статистики
        initStatisticsFilters();
        
        // Инициализация истории
        initHistory();
        
        // Инициализация модального окна
        initModal();
        
        // Установка текущей даты в форме
        const dateInput = document.getElementById('workout-date');
        if (dateInput) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            dateInput.value = formattedDate;
            dateInput.max = formattedDate;
        }
        
        // Установка ограничения калорий в 2000
        const caloriesInput = document.getElementById('calories-burned');
        if (caloriesInput) {
            caloriesInput.max = 2000; // Ограничение 2000 калорий
        }
        
        // Обновление предпросмотра в реальном времени
        setupFormPreview();
        
        // Показываем приветственное уведомление
        showWelcomeNotification();
        
        // Загрузка начальных данных для активной вкладки
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            const tabId = activeTab.id;
            switch(tabId) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'statistics':
                    loadStatistics();
                    break;
                case 'history':
                    loadHistory();
                    break;
            }
        } else {
            // Если нет активной вкладки, загружаем дашборд
            loadDashboard();
        }
        
        // Проверяем хэш в URL при загрузке
        if (window.location.hash) {
            const tabId = window.location.hash.substring(1);
            const tabElement = document.getElementById(tabId);
            if (tabElement && tabElement.classList.contains('tab-content')) {
                // Обновляем активные элементы
                document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
                
                const activeButton = document.querySelector(`[href="${window.location.hash}"]`);
                if (activeButton) {
                    activeButton.classList.add('active');
                }
                
                tabElement.classList.add('active');
                
                // Загружаем данные если нужно
                switch(tabId) {
                    case 'dashboard':
                        loadDashboard();
                        break;
                    case 'statistics':
                        loadStatistics();
                        break;
                    case 'history':
                        loadHistory();
                        break;
                }
                
                // Прокручиваем к секции
                setTimeout(() => {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = tabElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }
        
        console.log('Фитнес-трекер успешно инициализирован!');
    }
    
    // Запуск приложения
    initApp();
});