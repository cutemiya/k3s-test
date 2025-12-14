workspace "Flight Search System" "C4 диаграмма для системы поиска авиабилетов" {

    !identifiers hierarchical

    model {
        # ============================================
        # ACTORS (PERSONS)
        # ============================================
        user = person "Пользователь" "Конечный пользователь системы поиска авиабилетов\n• Использует домены: main.cutemiya.ru, least.cutemiya.ru, random.cutemiya.ru\n• Выполняет GraphQL запросы через HTTPS (порт 443)\n• Просматривает предложения авиабилетов через веб-интерфейс" {
            tags "Person"
        }
        
        admin = person "Администратор системы" "Системный администратор, управляющий инфраструктурой\n• Мониторит систему через Grafana (grafana.cutemiya.ru:3000)\n• Управляет Traefik через Dashboard (traefik.cutemiya.ru:8080)\n• Настраивает балансировку (Round Robin, Least Time, P2C)\n• Управляет масштабированием через kubectl" {
            tags "Person"
        }
        
        developer = person "Разработчик" "Разработчик приложения, работающий с Docker образами\n• Загружает образы в Docker Registry (registry.cutemiya.ru)\n• Использует образ: registry.cutemiya.ru/flight-search-app:latest\n• Деплоит через Kubernetes манифесты" {
            tags "Person"
        }

        # ============================================
        # SOFTWARE SYSTEM
        # ============================================
        flightSearchSystem = softwareSystem "Flight Search System" "Система поиска авиабилетов с GraphQL API\n• Развернута в Kubernetes кластере\n• Использует Traefik для балансировки нагрузки\n• Мониторинг через Prometheus и Grafana" {
            tags "Software System"
            
            # ============================================
            # CONTAINERS
            # ============================================
            
            webApp = container "Flight Search Application" "Node.js приложение с GraphQL API\n• Порт: 4000 (HTTP)\n• Реплики: 4 пода (управляется HPA: 4-7 реплик)\n• Namespace: flight-search\n• Endpoints: /graphql (GraphQL API), /health (Health Check)\n• Ресурсы: 128Mi-256Mi RAM, 100m-200m CPU\n• Image: registry.cutemiya.ru/flight-search-app:latest" "Node.js, Express, GraphQL, Kubernetes" {
                tags "Container"
                
                # Components
                expressServer = component "Express Server" "HTTP сервер для обработки запросов\n• Обрабатывает HTTP запросы на порту 4000\n• Middleware: CORS, JSON parsing\n• Routes: /graphql, /health, /api/offers, /" "Express.js" {
                    tags "Component"
                }
                
                graphqlApi = component "GraphQL API" "GraphQL endpoint для запросов\n• Endpoint: /graphql\n• GraphiQL включен (GRAPHIQL_ENABLED=true)\n• Типы: Offer, Flight, Airport, Price\n• Query: searchOffers, offer, stats, cities, airlines\n• Mutation: createOffer, updateOffer, deleteOffer" "GraphQL" {
                    tags "Component"
                }
                
                resolvers = component "GraphQL Resolvers" "Обработчики GraphQL запросов\n• Query resolvers: searchOffers, offer, stats\n• Mutation resolvers: createOffer, updateOffer, deleteOffer\n• Обработка фильтров и пагинации\n• Валидация входных данных" "JavaScript" {
                    tags "Component"
                }
                
                offerModel = component "Offer Model" "Модель данных для работы с предложениями авиабилетов\n• Методы: search(), findById(), create(), update(), delete()\n• Фильтрация по городам, датам, ценам, авиакомпаниям\n• Сортировка и пагинация" "JavaScript" {
                    tags "Component"
                }
                
                dbConnection = component "Database Connection Pool" "Пул соединений с базой данных PostgreSQL\n• Библиотека: pg (node-postgres)\n• Подключение: postgres-service:5432\n• База: flightdb\n• Управление пулом соединений" "pg (node-postgres)" {
                    tags "Component"
                }
            }
            
            postgres = container "PostgreSQL Database" "Реляционная база данных для хранения предложений авиабилетов\n• Порт: 5432 (PostgreSQL Protocol)\n• Namespace: flight-search\n• Service: postgres-service (ClusterIP)\n• StatefulSet: Управление персистентным хранилищем\n• База данных: flightdb\n• Ресурсы: 256Mi-512Mi RAM, 250m-500m CPU" "PostgreSQL 15, Kubernetes StatefulSet" {
                tags "Container,Database"
            }
            
            traefik = container "Traefik Ingress Controller" "Reverse proxy и load balancer для маршрутизации трафика\n• Порты: 80 (HTTP), 443 (HTTPS), 8080 (Dashboard)\n• Namespace: kube-system\n• External IP: 83.217.223.112\n• Домены:\n  - main.cutemiya.ru (Ingress, Round Robin)\n  - least.cutemiya.ru (IngressRoute, Least Time)\n  - random.cutemiya.ru (IngressRoute, P2C)\n• TLS: Let's Encrypt (cert-manager)\n• EntryPoints: web (80), websecure (443)" "Traefik, Kubernetes Ingress, Let's Encrypt" {
                tags "Container"
                
                # Components
                ingressController = component "Ingress Controller" "Управление входящим трафиком через Kubernetes Ingress\n• Домен: main.cutemiya.ru\n• Стратегия: Round Robin (по умолчанию)\n• EntryPoint: websecure (443)\n• TLS: Let's Encrypt\n• Маршрутизация через Kubernetes Ingress ресурсы" "Kubernetes Ingress" {
                    tags "Component"
                }
                
                ingressRoute = component "IngressRoute" "Управление маршрутизацией через Traefik IngressRoute\n• least.cutemiya.ru (Least Time стратегия)\n• random.cutemiya.ru (P2C стратегия)\n• EntryPoint: websecure (443)\n• TLS: Let's Encrypt\n• Динамическая маршрутизация" "Traefik IngressRoute" {
                    tags "Component"
                }
                
                loadBalancer = component "Load Balancer" "Балансировка нагрузки между 4 подами\n• Round Robin (main.cutemiya.ru)\n• Least Time (least.cutemiya.ru)\n• P2C (random.cutemiya.ru)\n• Service: flight-app-service:80\n• Health checks для подов" "Traefik LB" {
                    tags "Component"
                }
                
                tlsTermination = component "TLS Termination" "Обработка SSL/TLS сертификатов\n• Let's Encrypt через cert-manager\n• Автоматическое обновление сертификатов\n• EntryPoint: websecure (443)\n• Поддержка SNI" "Let's Encrypt, cert-manager" {
                    tags "Component"
                }
            }
            
            traefikDashboard = container "Traefik Dashboard" "Веб-интерфейс для мониторинга Traefik\n• Порт: 8080 (HTTP)\n• Домен: traefik.cutemiya.ru\n• Namespace: kube-system\n• Показывает статистику маршрутизации и балансировки\n• Метрики запросов и ответов" "Traefik Dashboard" {
                tags "Container"
            }
            
            prometheus = container "Prometheus" "Система мониторинга и сбора метрик\n• Namespace: monitoring\n• Endpoint: /metrics (HTTP)\n• Собирает метрики от Traefik и Flight App\n• PromQL для запросов метрик\n• Хранение временных рядов" "Prometheus, Kubernetes, PromQL" {
                tags "Container"
            }
            
            grafana = container "Grafana" "Визуализация метрик и дашборды\n• Порт: 3000 (HTTP)\n• Namespace: monitoring\n• Домен: grafana.cutemiya.ru\n• Источник данных: Prometheus (PromQL)\n• Дашборды для мониторинга Traefik и приложения\n• Алерты и уведомления" "Grafana, Kubernetes" {
                tags "Container"
            }
            
            dockerRegistry = container "Docker Registry" "Хранилище Docker образов\n• Домен: registry.cutemiya.ru\n• Хранит образы: flight-search-app:latest\n• Используется для деплоя в Kubernetes\n• Версионирование образов" "Docker Registry" {
                tags "Container"
            }
            
            k6 = container "k6" "Инструмент нагрузочного тестирования\n• Генерирует HTTP запросы для тестирования балансировки\n• Тестирует все три домена с разными стратегиями\n• Измеряет производительность и отклик" "k6" {
                tags "Container"
            }
        }

        # ============================================
        # RELATIONSHIPS - LEVEL 1: SYSTEM CONTEXT
        # ============================================
        user -> flightSearchSystem "Ищет авиабилеты через GraphQL API\nДомены: main.cutemiya.ru, least.cutemiya.ru, random.cutemiya.ru" "HTTPS (443)"
        admin -> flightSearchSystem "Мониторит систему через Grafana\ngrafana.cutemiya.ru:3000" "HTTPS (443)"
        developer -> flightSearchSystem "Разрабатывает и деплоит приложение\nЗагружает образы в registry.cutemiya.ru" "HTTPS (443)"
        
        # ============================================
        # RELATIONSHIPS - LEVEL 2: CONTAINERS
        # ============================================
        user -> traefik "Запросы через домены:\n• main.cutemiya.ru (Ingress, Round Robin)\n• least.cutemiya.ru (IngressRoute, Least Time)\n• random.cutemiya.ru (IngressRoute, P2C)" "HTTPS (443)"
        admin -> traefikDashboard "Мониторит трафик и балансировку\ntraefik.cutemiya.ru:8080" "HTTPS (443)"
        admin -> grafana "Просматривает метрики и дашборды\ngrafana.cutemiya.ru:3000" "HTTPS (443)"
        developer -> dockerRegistry "Загружает Docker образы\nregistry.cutemiya.ru\nImage: flight-search-app:latest" "HTTPS (443)"
        
        traefik -> webApp "Маршрутизирует запросы к 4 подам\nService: flight-app-service:80 -> 4000" "HTTP (80)"
        traefik -> traefikDashboard "Отображает статистику маршрутизации" "HTTP (8080)"
        webApp -> postgres "SQL запросы к PostgreSQL\npostgres-service:5432, база flightdb" "PostgreSQL Protocol (5432)"
        
        prometheus -> traefik "Собирает метрики через /metrics endpoint" "HTTP/metrics"
        prometheus -> webApp "Собирает метрики через /metrics endpoint" "HTTP/metrics"
        grafana -> prometheus "Запрашивает метрики через PromQL запросы" "HTTP/PromQL"
        
        k6 -> traefik "Генерирует нагрузку для тестирования балансировки\nТестирует все три домена" "HTTP (80)"
        
        # Domain routing details
        traefik -> webApp "main.cutemiya.ru\n(Ingress, Round Robin)\n4 пода, равномерное распределение" "HTTP (80)"
        traefik -> webApp "least.cutemiya.ru\n(IngressRoute, Least Time)\nВыбор пода с минимальным временем отклика" "HTTP (80)"
        traefik -> webApp "random.cutemiya.ru\n(IngressRoute, P2C)\nPower of Two Choices алгоритм" "HTTP (80)"
        
        # ============================================
        # RELATIONSHIPS - LEVEL 3: COMPONENTS
        # ============================================
        # Flight Search Application components
        expressServer -> graphqlApi "Обрабатывает GraphQL запросы\nRoute: /graphql"
        expressServer -> resolvers "Вызывает резолверы для обработки запросов"
        graphqlApi -> resolvers "Обрабатывает GraphQL запросы\nQuery: offers, searchOffers"
        resolvers -> offerModel "Использует модель для работы с данными\nМетоды: search(), findById(), create()"
        offerModel -> dbConnection "Выполняет SQL запросы через пул соединений"
        dbConnection -> postgres "SQL запросы к PostgreSQL\npostgres-service:5432/flightdb" "PostgreSQL Protocol (5432)"
        
        # Traefik components
        ingressController -> loadBalancer "Управляет балансировкой Round Robin\nmain.cutemiya.ru -> 4 пода"
        ingressRoute -> loadBalancer "Настраивает стратегии балансировки\nLeast Time (least.cutemiya.ru)\nP2C (random.cutemiya.ru)"
        loadBalancer -> webApp "Распределяет нагрузку между 4 подами\nflight-app-service:80 -> pod:4000" "HTTP (80)"
        tlsTermination -> ingressController "Обеспечивает HTTPS для main.cutemiya.ru\nLet's Encrypt сертификат"
        tlsTermination -> ingressRoute "Обеспечивает HTTPS для IngressRoute доменов\nLet's Encrypt сертификат"
    }

    views {
        # ============================================
        # LEVEL 1: SYSTEM CONTEXT DIAGRAM
        # ============================================
        systemContext flightSearchSystem "SystemContext" {
            include *
            autolayout lr
            title "Level 1: System Context - Flight Search System"
            description "Контекстная диаграмма системы - показывает систему в окружении пользователей и внешних систем"
        }
        
        # ============================================
        # LEVEL 2: CONTAINER DIAGRAM
        # ============================================
        container flightSearchSystem "Containers" {
            include *
            autolayout lr
            title "Level 2: Container Diagram - Flight Search System"
            description "Диаграмма контейнеров - показывает основные компоненты системы и их взаимодействие"
        }
        
        # ============================================
        # LEVEL 3: COMPONENT DIAGRAMS
        # ============================================
        
        # Flight Search Application Component Diagram
        component webApp "FlightAppComponents" {
            include *
            autolayout lr
            title "Level 3: Component Diagram - Flight Search Application"
            description "Диаграмма компонентов - показывает внутреннюю структуру приложения Flight Search Application"
        }
        
        # Traefik Component Diagram
        component traefik "TraefikComponents" {
            include *
            autolayout lr
            title "Level 3: Component Diagram - Traefik Ingress Controller"
            description "Диаграмма компонентов - показывает внутреннюю структуру Traefik Ingress Controller"
        }

        # ============================================
        # STYLES
        # ============================================
        styles {
            element "Person" {
                color #ffffff
                shape Person
            }
            element "Software System" {
                background #1168bd
                color #ffffff
            }
            element "Container" {
                background #438dd5
                color #ffffff
            }
            element "Component" {
                background #85bbf0
                color #000000
            }
            element "Database" {
                shape Cylinder
                background #438dd5
                color #ffffff
            }
            element "Boundary" {
                strokeWidth 5
            }
            relationship "Relationship" {
                thickness 4
            }
        }
    }
    
    configuration {
        scope softwaresystem
    }
}

