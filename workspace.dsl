workspace "Flight Search System" "C4 Model для системы поиска авиабилетов" {

    model {
        # ============================================
        # PEOPLE AND SOFTWARE SYSTEMS
        # ============================================
        
        user = person "Пользователь" "Конечный пользователь системы поиска авиабилетов\n• Использует домены: main.cutemiya.ru, least.cutemiya.ru, random.cutemiya.ru\n• Выполняет GraphQL запросы через HTTPS (порт 443)\n• Просматривает предложения авиабилетов" {
            tags "Person"
        }
        
        admin = person "Администратор системы" "Системный администратор, управляющий инфраструктурой\n• Мониторит систему через Grafana (grafana.cutemiya.ru:3000)\n• Управляет Traefik через Dashboard (traefik.cutemiya.ru:8080)\n• Настраивает балансировку и масштабирование\n• Использует kubectl для управления Kubernetes" {
            tags "Person"
        }
        
        flightSearchSystem = softwareSystem "Flight Search System" "Система поиска и управления авиабилетами с GraphQL API" {
            tags "System"
            
            # ============================================
            # LEVEL 2: CONTAINER DIAGRAM
            # ============================================
            
            webApplication = container "Flight Search Application" "Node.js приложение с Express и GraphQL API\n• Порт: 4000 (HTTP)\n• Реплики: 4 пода (управляется HPA: 4-7 реплик)\n• Namespace: flight-search\n• Endpoints: /graphql (GraphQL API), /health (Health Check)\n• Ресурсы: 128Mi-256Mi RAM, 100m-200m CPU\n• Image: registry.cutemiya.ru/flight-search-app:latest" "Node.js, Express, GraphQL, Kubernetes" {
                tags "Container"
                
                # ============================================
                # LEVEL 3: COMPONENT DIAGRAM
                # ============================================
                
                expressServer = component "Express Server" "HTTP сервер для обработки запросов" "Express.js" {
                    tags "Component"
                }
                
                graphqlSchema = component "GraphQL Schema" "Схема GraphQL с типами и запросами\n• Endpoint: /graphql\n• GraphiQL включен (GRAPHIQL_ENABLED=true)\n• Типы: Offer, Flight, Airport" "GraphQL" {
                    tags "Component"
                }
                
                graphqlResolvers = component "GraphQL Resolvers" "Резолверы для обработки GraphQL запросов\n• Query: offers, searchOffers\n• Обработка фильтров и пагинации" "JavaScript" {
                    tags "Component"
                }
                
                offerModel = component "Offer Model" "Модель данных для работы с предложениями авиабилетов" "JavaScript" {
                    tags "Component"
                }
                
                dbConnection = component "Database Connection Pool" "Пул соединений с базой данных PostgreSQL\n• Библиотека: pg (node-postgres)\n• Подключение: postgres-service:5432\n• База: flightdb" "pg (node-postgres)" {
                    tags "Component"
                }
                
                # Relationships для Component уровня
                expressServer -> graphqlSchema "Использует схему" "JavaScript"
                expressServer -> graphqlResolvers "Вызывает резолверы" "JavaScript"
                graphqlResolvers -> offerModel "Использует модель" "JavaScript"
                offerModel -> dbConnection "Выполняет SQL запросы" "JavaScript"
            }
            
            database = container "PostgreSQL Database" "Реляционная база данных для хранения предложений авиабилетов\n• Порт: 5432 (PostgreSQL Protocol)\n• Namespace: flight-search\n• Service: postgres-service (ClusterIP)\n• StatefulSet: Управление персистентным хранилищем\n• База данных: flightdb" "PostgreSQL 15, Kubernetes StatefulSet" {
                tags "Container,Database"
            }
            
            traefik = container "Traefik Ingress Controller" "Reverse proxy и load balancer для маршрутизации трафика\n• Порты: 80 (HTTP), 443 (HTTPS), 8080 (Dashboard)\n• Namespace: kube-system\n• External IP: 83.217.223.112\n• Домены:\n  - main.cutemiya.ru (Ingress, Round Robin)\n  - least.cutemiya.ru (IngressRoute, Least Time)\n  - random.cutemiya.ru (IngressRoute, P2C)\n• TLS: Let's Encrypt (cert-manager)\n• EntryPoints: web (80), websecure (443)" "Traefik, Kubernetes Ingress, Let's Encrypt" {
                tags "Container"
            }
            
            prometheus = container "Prometheus" "Система мониторинга и сбора метрик\n• Namespace: monitoring\n• Endpoint: /metrics (HTTP)\n• Собирает метрики от Traefik и Flight App\n• PromQL для запросов метрик" "Prometheus, Kubernetes, PromQL" {
                tags "Container"
            }
            
            grafana = container "Grafana" "Визуализация метрик и дашборды\n• Порт: 3000 (HTTP)\n• Namespace: monitoring\n• Домен: grafana.cutemiya.ru\n• Источник данных: Prometheus (PromQL)\n• Дашборды для мониторинга Traefik и приложения" "Grafana, Kubernetes" {
                tags "Container"
            }
        }
        
        # Kubernetes Infrastructure как отдельная система
        kubernetes = softwareSystem "Kubernetes Cluster" "Оркестратор контейнеров, управляющий развертыванием и масштабированием" "Kubernetes" {
            tags "System"
            
            k8sIngress = container "Kubernetes Ingress" "Управление входящим трафиком через Ingress ресурсы" "Kubernetes Ingress" {
                tags "Container"
            }
            
            k8sService = container "Kubernetes Service" "Service discovery и load balancing для подов" "Kubernetes Service" {
                tags "Container"
            }
            
            k8sHPA = container "Horizontal Pod Autoscaler" "Автоматическое масштабирование подов на основе метрик CPU/Memory" "Kubernetes HPA" {
                tags "Container"
            }
            
            k8sDeployment = container "Kubernetes Deployment" "Управление репликами приложения (4-7 реплик)" "Kubernetes Deployment" {
                tags "Container"
            }
            
            k8sStatefulSet = container "Kubernetes StatefulSet" "Управление Stateful приложениями (PostgreSQL)" "Kubernetes StatefulSet" {
                tags "Container"
            }
        }
        
        # ============================================
        # LEVEL 1: SYSTEM CONTEXT
        # ============================================
        
        user -> flightSearchSystem "Ищет авиабилеты через GraphQL API\nДомены: main.cutemiya.ru, least.cutemiya.ru, random.cutemiya.ru" "HTTPS (443)"
        admin -> flightSearchSystem "Мониторит систему через Grafana\ngrafana.cutemiya.ru:3000" "HTTPS (443)"
        admin -> kubernetes "Управляет развертыванием и масштабированием\nkubectl CLI, HPA настройки" "kubectl"
        
        # Relationships для Container уровня
        user -> traefik "Запросы через домены:\n• main.cutemiya.ru (Round Robin)\n• least.cutemiya.ru (Least Time)\n• random.cutemiya.ru (P2C)" "HTTPS (443)"
        admin -> traefik "Доступ к Traefik Dashboard\ntraefik.cutemiya.ru:8080" "HTTPS (443)"
        traefik -> k8sIngress "Маршрутизация через Kubernetes Ingress\nmain.cutemiya.ru (Round Robin)" "HTTP (80)"
        k8sIngress -> k8sService "Маршрутизация к flight-app-service\nClusterIP, порт 80 -> 4000" "HTTP (80)"
        k8sService -> webApplication "Load balancing между 4 подами\nRound Robin (по умолчанию)" "HTTP (4000)"
        webApplication -> database "SQL запросы к PostgreSQL\npostgres-service:5432, база flightdb" "PostgreSQL Protocol (5432)"
        webApplication -> prometheus "Экспорт метрик через /metrics endpoint" "HTTP/metrics"
        prometheus -> grafana "Предоставление данных через PromQL запросы" "HTTP/PromQL"
        admin -> grafana "Просмотр дашбордов мониторинга\ngrafana.cutemiya.ru:3000" "HTTPS (443)"
        
        # Kubernetes инфраструктурные связи
        k8sHPA -> k8sDeployment "Автоматическое масштабирование" "Kubernetes API"
        k8sDeployment -> webApplication "Управление репликами" "Kubernetes"
        k8sStatefulSet -> database "Управление StatefulSet" "Kubernetes"
        
        # Relationship для Component уровня
        dbConnection -> database "Подключение через пул соединений\npostgres-service:5432/flightdb" "PostgreSQL Protocol (5432)"
        
        # ============================================
        # DEPLOYMENT ENVIRONMENT
        # ============================================
        
        production = deploymentEnvironment "Production" {
            kubernetesCluster = deploymentNode "Kubernetes Cluster" "Production Kubernetes кластер" "Kubernetes" {
                tags "DeploymentNode"
                
                flightSearchNamespace = deploymentNode "flight-search namespace" "Namespace для приложения" "Kubernetes Namespace" {
                    tags "DeploymentNode"
                    
                    flightAppDeployment = deploymentNode "Flight App Deployment" "Deployment с 4-7 репликами, управляется HPA" "Kubernetes Deployment" {
                        tags "DeploymentNode"
                        
                        flightAppInstance1 = containerInstance webApplication "Pod 1"
                        flightAppInstance2 = containerInstance webApplication "Pod 2"
                        flightAppInstance3 = containerInstance webApplication "Pod 3"
                        flightAppInstance4 = containerInstance webApplication "Pod 4"
                    }
                    
                    postgresStatefulSet = deploymentNode "PostgreSQL StatefulSet" "StatefulSet для базы данных" "Kubernetes StatefulSet" {
                        tags "DeploymentNode"
                        
                        postgresInstance = containerInstance database "PostgreSQL Pod"
                    }
                    
                    flightAppService = infrastructureNode "Flight App Service" "flight-app-service: Load balancing для подов приложения" "Kubernetes Service"
                    postgresService = infrastructureNode "PostgreSQL Service" "postgres-service: Service discovery для PostgreSQL" "Kubernetes Service"
                    flightAppIngress = infrastructureNode "Flight App Ingress" "flight-app-ingress: Маршрутизация входящего трафика" "Kubernetes Ingress"
                    flightAppHPA = infrastructureNode "Flight App HPA" "flight-app-hpa: Автомасштабирование 4-7 реплик" "Kubernetes HPA"
                }
                
                traefikNamespace = deploymentNode "traefik namespace" "Namespace для Traefik" "Kubernetes Namespace" {
                    tags "DeploymentNode"
                    
                    traefikDeployment = deploymentNode "Traefik Deployment" "Traefik Ingress Controller" "Kubernetes Deployment" {
                        tags "DeploymentNode"
                        
                        traefikInstance = containerInstance traefik "Traefik Pod"
                    }
                }
                
                monitoringNamespace = deploymentNode "monitoring namespace" "Namespace для мониторинга" "Kubernetes Namespace" {
                    tags "DeploymentNode"
                    
                    prometheusDeployment = deploymentNode "Prometheus Deployment" "Prometheus для сбора метрик" "Kubernetes Deployment" {
                        tags "DeploymentNode"
                        
                        prometheusInstance = containerInstance prometheus "Prometheus Pod"
                    }
                    
                    grafanaDeployment = deploymentNode "Grafana Deployment" "Grafana для визуализации" "Kubernetes Deployment" {
                        tags "DeploymentNode"
                        
                        grafanaInstance = containerInstance grafana "Grafana Pod"
                    }
                }
            }
        }
        
    }

    views {
        # ============================================
        # LEVEL 1: SYSTEM CONTEXT DIAGRAM
        # ============================================
        systemContext flightSearchSystem "SystemContext" {
            include *
            autolayout lr
            title "Level 1: System Context - Flight Search System"
            description "Контекст системы с акторами: Пользователь (поиск билетов), Администратор (мониторинг)"
        }
        
        # ============================================
        # LEVEL 2: CONTAINER DIAGRAM
        # ============================================
        container flightSearchSystem "Containers" {
            include *
            autolayout lr
            title "Level 2: Container Diagram - Flight Search System"
            description "Контейнеры: Flight App (4 пода, порт 4000), PostgreSQL (5432), Traefik (80/443/8080), Prometheus, Grafana (3000)"
        }
        
        # ============================================
        # LEVEL 3: COMPONENT DIAGRAM
        # ============================================
        component webApplication "Components" {
            include *
            autolayout lr
            title "Level 3: Component Diagram - Flight Search Application"
            description "Компоненты: Express Server, GraphQL Schema (/graphql), Resolvers, Offer Model, Database Connection Pool"
        }
        
        # ============================================
        # DEPLOYMENT VIEW (Kubernetes Infrastructure)
        # ============================================
        deployment flightSearchSystem production "ProductionDeployment" {
            include *
            autolayout lr
            title "Deployment View - Kubernetes Production Environment"
        }
        
        # Стили для улучшения визуализации
        styles {
            element "Person" {
                color #ffffff
                shape Person
            }
            element "System" {
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
            element "DeploymentNode" {
                background #999999
                color #ffffff
                shape Box
            }
        }
    }
    
}
