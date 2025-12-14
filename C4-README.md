# C4 Диаграммы для Flight Search System

Этот файл содержит C4 диаграммы для системы поиска авиабилетов, созданные в формате Structurizr DSL.

## Структура системы

### Компоненты:
- **Flight Search Application** - Node.js приложение с GraphQL API (4 пода)
- **PostgreSQL** - База данных для хранения предложений
- **Traefik** - Reverse proxy и load balancer
- **Traefik Dashboard** - Веб-интерфейс для мониторинга
- **Prometheus** - Система сбора метрик
- **Grafana** - Визуализация метрик
- **Docker Registry** - Хранилище Docker образов
- **k6** - Инструмент нагрузочного тестирования

### Домены и стратегии балансировки:
- `main.cutemiya.ru` - Round Robin (через Kubernetes Ingress)
- `least.cutemiya.ru` - Least Time (через IngressRoute)
- `random.cutemiya.ru` - Power of Two Choices (через IngressRoute)

## Уровни диаграмм

### Level 1: System Context
Показывает систему в контексте пользователей и внешних систем.

### Level 2: Container Diagram
Показывает основные контейнеры системы и их взаимодействие.

### Level 3: Component Diagram
Показывает внутреннюю структуру приложения и Traefik.

## Использование

### Онлайн редактор Structurizr
1. Откройте https://structurizr.com/dsl
2. Скопируйте содержимое файла `c4-diagram.dsl`
3. Вставьте в редактор
4. Диаграммы будут автоматически сгенерированы

### Structurizr CLI
```bash
# Установка Structurizr CLI
npm install -g @structurizr/cli

# Генерация диаграмм
structurizr export -workspace c4-diagram.dsl -format plantuml
```

### Structurizr Lite (локально)
```bash
# Запуск Structurizr Lite
docker run -it --rm -p 8080:8080 -v $(pwd):/usr/local/structurizr/workspace structurizr/lite

# Откройте http://localhost:8080
# Загрузите файл c4-diagram.dsl
```

## Файлы

- `c4-diagram.dsl` - Основной файл с диаграммами в формате Structurizr DSL

