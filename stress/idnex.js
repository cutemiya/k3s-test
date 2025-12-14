import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const searchOffersTrend = new Trend('search_offers_duration');

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Разогрев
    { duration: '20s', target: 50 },    // Средняя нагрузка
    { duration: '30s', target: 100 },   // Пиковая нагрузка
    { duration: '10s', target: 0 }    // Спад
  ],
  thresholds: {
    errors: ['rate<0.1'],              // Меньше 10% ошибок
    http_req_duration: ['p(95)<2000'], // 95% запросов < 2 секунд
    http_req_failed: ['rate<0.1']     // Меньше 10% неудачных
  },
  noConnectionReuse: false,
  userAgent: 'k6-stress-test/1.0'
};

const BASE_URL = 'https://main.cutemiya.ru';

const SEARCH_OFFERS_QUERY = `
query SearchOffers(
  $departure: String
  $arrival: String
  $departureDate: String
  $maxPrice: Float
  $sortBy: String
  $limit: Int
) {
  searchOffers(
    departure: $departure
    arrival: $arrival
    departureDate: $departureDate
    maxPrice: $maxPrice
    sortBy: $sortBy
    limit: $limit
  ) {
    offers {
      id
      departure
      arrival
      departureDate
      price {
        total
      }
      marketingCompany
      stops
    }
    total
    pages
  }
}`;

// Параметры для запросов
const testQueries = [
  {
    name: 'Москва-Стамбул',
    variables: {
      departure: 'Москва',
      arrival: 'Стамбул',
      departureDate: '2024-06-01',
      maxPrice: 500,
      sortBy: 'price',
      limit: 10
    }
  },
  {
    name: 'Без фильтров',
    variables: {
      sortBy: 'price',
      limit: 10
    }
  },
  {
    name: 'Много данных',
    variables: {
      sortBy: 'price',
      limit: 50
    }
  }
];

// Основная функция
export default function () {
  group('Flight Search Stress Test', function () {
    // Выбираем случайный запрос
    const queryConfig = testQueries[Math.floor(Math.random() * testQueries.length)];

    // Формируем GraphQL запрос
    const payload = JSON.stringify({
      query: SEARCH_OFFERS_QUERY,
      variables: queryConfig.variables,
      operationName: 'SearchOffers'
    });

    const params = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'k6-stress-test'
      },
      tags: {
        query_name: queryConfig.name,
        test_type: 'graphql'
      },
      timeout: '30s'
    };

    const startTime = Date.now();

    // Отправляем запрос
    const response = http.post(`${BASE_URL}/graphql`, payload, params);

    const duration = Date.now() - startTime;
    searchOffersTrend.add(duration);

    console.log(response);
    // Проверяем результат
    const checkResult = check(response, {
      'status is 200': (r) => r.status === 200,
      'response has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && body.data.searchOffers;
        } catch (e) {
          return false;
        }
      },
      'response time < 5s': (r) => r.timings.duration < 5000
    });

    errorRate.add(!checkResult);

    // Логируем ошибки
    if (!checkResult) {
      console.error(`Error in query "${queryConfig.name}":`, response.status, response.body.substring(0, 200));
    }

    // Небольшая пауза между запросами
    sleep(Math.random() * 1 + 0.5);
  });
}

// Функция для теста доступности (setup)
export function setup() {
  console.log('Starting stress test for flight search service...');
  console.log(`Target URL: ${BASE_URL}/graphql`);

  // Проверяем доступность сервиса
  const healthCheck = http.get(`${BASE_URL}/ping`);
  check(healthCheck, {
    'service is available': (r) => r.status === 200
  });

  return { startTime: new Date().toISOString() };
}

// Функция для очистки (teardown)
export function teardown(data) {
  console.log(`Test completed at: ${new Date().toISOString()}`);
  console.log(`Test started at: ${data.startTime}`);
}
