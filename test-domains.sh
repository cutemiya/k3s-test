#!/bin/bash

echo "ТЕСТИРОВАНИЕ БАЛАНСИРОВКИ - 30 ЗАПРОСОВ НА ДОМЕН"
echo "===================================================="
echo ""

DOMAINS=("main.cutemiya.ru" "least.cutemiya.ru" "random.cutemiya.ru")
TRAEFIK_IP="83.217.223.112"  # IP из DNS
PORT="443"
REQUESTS=30

test_domain() {
    local domain=$1
    echo "ДОМЕН: $domain"
    echo "──────────────────────────────────────────"
    
    # Создаем ассоциативный массив для подсчета
    declare -A pod_counts
    
    # Выполняем запросы
    for ((i=1; i<=$REQUESTS; i++)); do
        # Прогресс-бар
        if (( i % 5 == 0 )); then
            echo -n "."
        fi
        
        # Делаем запрос
        response=$(timeout 5 curl -s -k -H "Host: $domain" https://$TRAEFIK_IP:$PORT/pod-info 2>/dev/null)
        
        if [ $? -ne 0 ] || [ -z "$response" ]; then
            echo -n "E"  # Ошибка
            continue
        fi
        
        # Парсим JSON и извлекаем имя пода
        pod_name=$(echo "$response" | grep -o '"pod":"[^"]*"' | cut -d'"' -f4)
        
        if [ -n "$pod_name" ]; then
            ((pod_counts[$pod_name]++))
        fi
        
        # Пауза чтобы не заDDOSить
        sleep 0.05
    done
    
    echo ""
    echo ""
    
    # Выводим статистику
    echo "СТАТИСТИКА для $domain:"
    echo "-------------------------"
    
    if [ ${#pod_counts[@]} -eq 0 ]; then
        echo "Нет ответов от сервера"
        echo ""
        return
    fi
    
    # Сортируем по количеству запросов
    for pod in $(echo "${!pod_counts[@]}" | tr ' ' '\n' | sort); do
        count=${pod_counts[$pod]}
        percentage=$(echo "scale=1; $count * 100 / $REQUESTS" | bc)
        echo " $pod: $count раз ($percentage%)"
    done
    
    # Распределение
    total_pods=${#pod_counts[@]}
    if [ $total_pods -gt 0 ]; then
        average=$(echo "scale=1; $REQUESTS / $total_pods" | bc)
        echo ""
        echo " Среднее: $average запросов на под"
        
        # Проверяем равномерность
        echo " Распределение:"
        for pod in "${!pod_counts[@]}"; do
            count=${pod_counts[$pod]}
            diff=$(echo "$count - $average" | bc)
            if (( $(echo "$diff > 1" | bc -l) )); then
                echo "   $pod: +$diff от среднего"
            elif (( $(echo "$diff < -1" | bc -l) )); then
                echo "   $pod: $diff от среднего"
            else
                echo "   $pod: равномерно"
            fi
        done
    fi
    
    # Количество уникальных pods
    echo ""
    echo "Использовано pods: ${#pod_counts[@]}"
    echo ""
    echo "════════════════════════════════════════════════"
    echo ""
}

# Запускаем тесты для всех доменов
for domain in "${DOMAINS[@]}"; do
    test_domain "$domain"
done

echo " ТЕСТИРОВАНИЕ ЗАВЕРШЕНО"
