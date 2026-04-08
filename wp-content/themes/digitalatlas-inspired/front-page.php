<?php get_header(); ?>

<section class="hero">
    <div class="container hero__inner">
        <div>
            <p class="eyebrow">Digital geospatial platform</p>
            <h1>Национальный цифровой атлас нового поколения</h1>
            <p class="lead">Единая среда для картографии, аналитики, 3D-визуализации и совместной работы ведомств, бизнеса и исследовательских команд.</p>
            <div class="hero__actions">
                <a class="btn btn--primary" href="<?php echo esc_url(home_url('/platform')); ?>">Посмотреть платформу</a>
                <a class="btn btn--ghost" href="<?php echo esc_url(home_url('/contact')); ?>">Запросить демо</a>
            </div>
        </div>
        <div class="hero-card">
            <h3>Что внутри</h3>
            <ul>
                <li>Интерактивные базовые карты и тематические слои</li>
                <li>ИИ-поиск по объектам и геокодирование</li>
                <li>Панель KPI для отраслевых сценариев</li>
                <li>3D/terrain-модели и цифровые двойники</li>
            </ul>
        </div>
    </div>
</section>

<section class="section">
    <div class="container">
        <p class="eyebrow">Возможности</p>
        <h2>Функции, похожие на enterprise-геопорталы</h2>
        <div class="grid grid--3">
            <article class="card">
                <h3>Data Hub</h3>
                <p>Загрузка, валидация и версия геоданных в одном реестре с доступом по ролям.</p>
            </article>
            <article class="card">
                <h3>Spatial AI</h3>
                <p>Автоматическая классификация, прогнозирование и анализ паттернов на карте.</p>
            </article>
            <article class="card">
                <h3>Scenario Studio</h3>
                <p>Сценарный анализ инфраструктуры, логистики, экологии и рисков с презентацией для ЛПР.</p>
            </article>
        </div>
    </div>
</section>

<section class="section section--alt">
    <div class="container">
        <p class="eyebrow">Отрасли</p>
        <h2>Решения под конкретные задачи</h2>
        <div class="grid grid--2">
            <article class="card">
                <h3>Госсектор</h3>
                <p>Планирование территорий, мониторинг активов и публичные сервисы на единой карте.</p>
            </article>
            <article class="card">
                <h3>Нефтегаз и энергетика</h3>
                <p>Коридоры инфраструктуры, производственные метрики и управление выездными работами.</p>
            </article>
            <article class="card">
                <h3>Транспорт и логистика</h3>
                <p>Маршрутизация, тепловые карты спроса и оптимизация времени доставки.</p>
            </article>
            <article class="card">
                <h3>Умные города</h3>
                <p>Слои IoT, безопасность, мобильность и устойчивость городской среды.</p>
            </article>
        </div>
    </div>
</section>

<?php get_footer(); ?>
