workspace "Flight Search System" "C4 диаграмма для системы поиска авиабилетов" {

    !identifiers hierarchical

    model {
        # Actors
        user = person "Пользователь" "Конечный пользователь системы поиска авиабилетов\n• Использует домены: main.cutemiya.ru, least.cutemiya.ru, random.cutemiya.ru\n• Выполняет GraphQL запросы через HTTPS (порт 443)\n• Просматривает предложения авиабилетов через веб-интерфейс" {
            tags "Person"
        }
        admin = person "Администратор системы" "Системный администратор, управляющий инфраструктурой\n• Мониторит систему через Grafana (grafana.cutemiya.ru:3000)\n• Управляет Traefik через Dashboard (traefik.cutemiya.ru:8080)\n• Настраивает балансировку (Round Robin, Least Time, P2C)\n• Управляет масштабированием через kubectl" {
            tags "Person"
        }
        developer = person "Разработчик" "Разработчик приложения, работающий с Docker образами\n• Загружает образы в Docker Registry (registry.cutemiya.ru)\n• Использует образ: registry.cutemiya.ru/flight-search-app:latest\n• Деплоит через Kubernetes манифесты" {
            tags "Person"
        }

        # System
        flightSearchSystem = softwareSystem "Flight Search System" "Система поиска авиабилетов с GraphQL API" {
            # Containers
            webApp = container "Flight Search Application" "Node.js приложение с GraphQL API\n• Порт: 4000 (HTTP)\n• Реплики: 4 пода (управляется HPA: 4-7 реплик)\n• Namespace: flight-search\n• Endpoints: /graphql (GraphQL API), /health (Health Check)\n• Ресурсы: 128Mi-256Mi RAM, 100m-200m CPU\n• Image: registry.cutemiya.ru/flight-search-app:latest" "Node.js, Express, GraphQL, Kubernetes" {
                # Components
                graphqlApi = component "GraphQL API" "GraphQL endpoint для запросов\n• Endpoint: /graphql\n• GraphiQL включен (GRAPHIQL_ENABLED=true)\n• Типы: Offer, Flight, Airport" "GraphQL" {
                }
                resolvers = component "GraphQL Resolvers" "Обработчики GraphQL запросов\n• Query: offers, searchOffers\n• Обработка фильтров и пагинации" "JavaScript" {
                }
                databaseClient = component "Database Connection Pool" "Пул соединений с базой данных PostgreSQL\n• Библиотека: pg (node-postgres)\n• Подключение: postgres-service:5432\n• База: flightdb" "pg (node-postgres)" {
                }
            }
            
            postgres = container "PostgreSQL Database" "Реляционная база данных для хранения предложений авиабилетов\n• Порт: 5432 (PostgreSQL Protocol)\n• Namespace: flight-search\n• Service: postgres-service (ClusterIP)\n• StatefulSet: Управление персистентным хранилищем\n• База данных: flightdb" "PostgreSQL 15, Kubernetes StatefulSet" {
                tags "Database"
            }
            
            traefik = container "Traefik Ingress Controller" "Reverse proxy и load balancer для маршрутизации трафика\n• Порты: 80 (HTTP), 443 (HTTPS), 8080 (Dashboard)\n• Namespace: kube-system\n• External IP: 83.217.223.112\n• Домены:\n  - main.cutemiya.ru (Ingress, Round Robin)\n  - least.cutemiya.ru (IngressRoute, Least Time)\n  - random.cutemiya.ru (IngressRoute, P2C)\n• TLS: Let's Encrypt (cert-manager)\n• EntryPoints: web (80), websecure (443)" "Traefik, Kubernetes Ingress, Let's Encrypt" {
                # Components
                ingressController = component "Ingress Controller" "Управление входящим трафиком через Kubernetes Ingress\n• Домен: main.cutemiya.ru\n• Стратегия: Round Robin (по умолчанию)\n• EntryPoint: websecure (443)\n• TLS: Let's Encrypt" "Kubernetes Ingress" {
                }
                ingressRoute = component "IngressRoute" "Управление маршрутизацией через Traefik IngressRoute\n• least.cutemiya.ru (Least Time стратегия)\n• random.cutemiya.ru (P2C стратегия)\n• EntryPoint: websecure (443)\n• TLS: Let's Encrypt" "Traefik IngressRoute" {
                }
                loadBalancer = component "Load Balancer" "Балансировка нагрузки между 4 подами\n• Round Robin (main.cutemiya.ru)\n• Least Time (least.cutemiya.ru)\n• P2C (random.cutemiya.ru)\n• Service: flight-app-service:80" "Traefik LB" {
                }
                tlsTermination = component "TLS Termination" "Обработка SSL/TLS сертификатов\n• Let's Encrypt через cert-manager\n• Автоматическое обновление сертификатов\n• EntryPoint: websecure (443)" "Let's Encrypt, cert-manager" {
                }
            }
            
            traefikDashboard = container "Traefik Dashboard" "Веб-интерфейс для мониторинга Traefik\n• Порт: 8080 (HTTP)\n• Домен: traefik.cutemiya.ru\n• Namespace: kube-system\n• Показывает статистику маршрутизации и балансировки" "Traefik Dashboard" {
            }
            
            prometheus = container "Prometheus" "Система мониторинга и сбора метрик\n• Namespace: monitoring\n• Endpoint: /metrics (HTTP)\n• Собирает метрики от Traefik и Flight App\n• PromQL для запросов метрик" "Prometheus, Kubernetes, PromQL" {
            }
            
            grafana = container "Grafana" "Визуализация метрик и дашборды\n• Порт: 3000 (HTTP)\n• Namespace: monitoring\n• Домен: grafana.cutemiya.ru\n• Источник данных: Prometheus (PromQL)\n• Дашборды для мониторинга Traefik и приложения" "Grafana, Kubernetes" {
            }
            
            dockerRegistry = container "Docker Registry" "Хранилище Docker образов\n• Домен: registry.cutemiya.ru\n• Хранит образы: flight-search-app:latest\n• Используется для деплоя в Kubernetes" "Docker Registry" {
            }
            
            k6 = container "k6" "Инструмент нагрузочного тестирования\n• Генерирует HTTP запросы для тестирования балансировки\n• Тестирует все три домена с разными стратегиями" "k6" {
            }
        }

        # Relationships - Level 1: System Context
        user -> flightSearchSystem "Ищет авиабилеты через GraphQL API\nДомены: main.cutemiya.ru, least.cutemiya.ru, random.cutemiya.ru" "HTTPS (443)"
        admin -> flightSearchSystem "Мониторит систему через Grafana\ngrafana.cutemiya.ru:3000" "HTTPS (443)"
        developer -> flightSearchSystem "Разрабатывает и деплоит приложение\nЗагружает образы в registry.cutemiya.ru" "HTTPS (443)"
        
        # Relationships - Level 2: Containers
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
        
        # Domain routing details (более конкретные связи)
        traefik -> webApp "main.cutemiya.ru\n(Ingress, Round Robin)\n4 пода, равномерное распределение" "HTTP (80)"
        traefik -> webApp "least.cutemiya.ru\n(IngressRoute, Least Time)\nВыбор пода с минимальным временем отклика" "HTTP (80)"
        traefik -> webApp "random.cutemiya.ru\n(IngressRoute, P2C)\nPower of Two Choices алгоритм" "HTTP (80)"
        
        # Relationships - Level 3: Components
        graphqlApi -> resolvers "Обрабатывает GraphQL запросы\nQuery: offers, searchOffers"
        resolvers -> databaseClient "Выполняет SQL запросы через пул соединений"
        databaseClient -> postgres "SQL запросы к PostgreSQL\npostgres-service:5432/flightdb" "PostgreSQL Protocol (5432)"
        
        ingressController -> loadBalancer "Управляет балансировкой Round Robin\nmain.cutemiya.ru -> 4 пода"
        ingressRoute -> loadBalancer "Настраивает стратегии балансировки\nLeast Time (least.cutemiya.ru)\nP2C (random.cutemiya.ru)"
        loadBalancer -> webApp "Распределяет нагрузку между 4 подами\nflight-app-service:80 -> pod:4000"
        tlsTermination -> ingressController "Обеспечивает HTTPS для main.cutemiya.ru\nLet's Encrypt сертификат"
        tlsTermination -> ingressRoute "Обеспечивает HTTPS для IngressRoute доменов\nLet's Encrypt сертификат"
    }

    views {
        systemContext flightSearchSystem "SystemContext" {
            include *
            autolayout lr
            title "Level 1: System Context - Flight Search System"
            description "Контекст системы с акторами: Пользователь (поиск билетов через 3 домена), Администратор (мониторинг через Grafana и Traefik Dashboard), Разработчик (деплой через Docker Registry)"
        }

        container flightSearchSystem "Containers" {
            include *
            autolayout lr
            title "Level 2: Container Diagram - Flight Search System"
            description "Контейнеры: Flight App (4 пода, порт 4000), PostgreSQL (5432), Traefik (80/443/8080), Prometheus, Grafana (3000), Docker Registry, k6"
        }

        component webApp "Components" {
            include *
            autolayout lr
            title "Level 3: Component Diagram - Flight Search Application & Traefik"
            description "Компоненты приложения: GraphQL API (/graphql), Resolvers, Database Client. Компоненты Traefik: Ingress Controller, IngressRoute, Load Balancer, TLS Termination"
        }

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

