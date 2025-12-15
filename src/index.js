const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const cors = require('cors');
const schema = require('./schema');
const resolvers = require('./resolvers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: resolvers,
  graphiql: true,
  customFormatErrorFn: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      locations: error.locations,
      path: error.path
    };
  }
}));

app.get('/pod-info', (req, res) => {
  res.json({
    pod: process.env.HOSTNAME || 'unknown',
    timestamp: new Date().toISOString(),
    strategy: req.headers.host
  });
});

app.get('/api/offers', async (req, res) => {
  try {
    const { departure, arrival, date, maxPrice } = req.query;
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Flight Search API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: ['GraphQL', 'PostgreSQL', 'Search', 'Filtering', 'Sorting']
  });
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Flight Search API ✈️</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          background: linear-gradient(135deg, #eb0dffff 0%, #26d0ce 100%);
          color: white;
          min-height: 100vh;
          padding: 20px;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        header {
          text-align: center;
          padding: 40px 20px;
        }
        
        h1 {
          font-size: 3.5em;
          margin-bottom: 20px;
          background: linear-gradient(45deg, #fff, #4facfe);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          display: inline-block;
        }
        
        .subtitle {
          font-size: 1.2em;
          opacity: 0.9;
          margin-bottom: 40px;
        }
        
        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 30px;
          transition: transform 0.3s, box-shadow 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
        }
        
        .card h2 {
          margin-bottom: 15px;
          font-size: 1.5em;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .card h2 i {
          font-size: 1.2em;
        }
        
        .endpoints {
          margin-top: 20px;
        }
        
        .endpoint {
          background: rgba(0, 0, 0, 0.3);
          padding: 12px 15px;
          border-radius: 8px;
          margin-bottom: 10px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
          border-left: 4px solid #4facfe;
        }
        
        .examples {
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 10px;
          margin-top: 15px;
          font-size: 0.9em;
        }
        
        .buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 30px;
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 15px 30px;
          background: white;
          color: #1a2980;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1.1em;
          transition: all 0.3s;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .btn:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        
        .btn-primary {
          background: linear-gradient(45deg, #4facfe, #00f2fe);
          color: white;
        }
        
        .info {
          text-align: center;
          margin-top: 40px;
          opacity: 0.8;
          font-size: 0.9em;
        }
        
        .status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 15px;
          background: rgba(0, 255, 0, 0.2);
          border-radius: 20px;
          margin-left: 10px;
        }
        
        .status::before {
          content: '';
          width: 8px;
          height: 8px;
          background: #00ff00;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @media (max-width: 768px) {
          h1 { font-size: 2.5em; }
          .cards { grid-template-columns: 1fr; }
          .btn { padding: 12px 24px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>✈️ Flight Search API</h1>
          <div class="subtitle">
            GraphQL API для поиска авиабилетов с фильтрацией, сортировкой и пагинацией
            <span class="status">Работает</span>
          </div>
        </header>
        
        <div class="cards">
          <div class="card">
            <h2><i>🔍</i> Поиск билетов</h2>
            <p>Ищите авиабилеты по городам вылета/прибытия, датам, авиакомпаниям и ценам</p>
            
            <div class="examples">
              <strong>Пример GraphQL запроса:</strong>
              <pre style="margin-top: 10px; color: #4facfe; overflow-x: auto;">
query {
  searchOffers(
    departure: "Москва"
    arrival: "Стамбул"
    departureDate: "2024-06-01"
    maxPrice: 500
    sortBy: "price"
    limit: 10
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
}</pre>
            </div>
          </div>
          
          <div class="card">
            <h2><i>📊</i> Статистика</h2>
            <p>Получайте статистику по предложениям, городам и авиакомпаниям</p>
            
            <div class="examples">
              <strong>Пример запроса статистики:</strong>
              <pre style="margin-top: 10px; color: #4facfe; overflow-x: auto;">
query {
  stats {
    totalOffers
    departureCities
    arrivalCities
    airlines
    minPrice
    avgPrice
  }
  
  cities(type: "departure")
  airlines
}</pre>
            </div>
          </div>
          
          <div class="card">
            <h2><i>⚡</i> CRUD операции</h2>
            <p>Создание, чтение, обновление и удаление предложений авиабилетов</p>
            
            <div class="examples">
              <strong>Пример создания предложения:</strong>
              <pre style="margin-top: 10px; color: #4facfe; overflow-x: auto;">
mutation {
  createOffer(input: {
    departure: "Москва"
    arrival: "Париж"
    departureDate: "2024-06-15T10:00:00Z"
    arrivalDate: "2024-06-15T14:30:00Z"
    marketingCompany: "Аэрофлот"
    operatingCompany: "Аэрофлот"
    price: {
      base: 300
      tax: 50
      total: 350
    }
    flightNumber: "SU123"
    stops: 0
  }) {
    id
    price {
      total
    }
  }
}</pre>
            </div>
          </div>
        </div>
        
        <div class="endpoints">
          <div class="endpoint">POST /graphql - GraphQL endpoint с GraphiQL</div>
          <div class="endpoint">GET /health - Проверка здоровья сервиса</div>
          <div class="endpoint">GET /api/offers - REST API для обратной совместимости</div>
        </div>
        
        <div class="buttons">
          <a href="/graphql" class="btn btn-primary">
            <i>🎮</i> Открыть GraphiQL Sandbox
          </a>
          <a href="/health" class="btn">
            <i>💚</i> Проверить Health Status
          </a>
        </div>
        
        <div class="info">
          <p>Порт: ${PORT} | База данных: PostgreSQL | Тестовых предложений: 50+</p>
          <p>Используйте GraphiQL для тестирования API с автодополнением и документацией</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`
  ✈️  Flight Search API запущен!
  
  📍 Локальный сервер: http://localhost:${PORT}
  🔗 GraphQL Endpoint: http://localhost:${PORT}/graphql
  📊 GraphiQL Sandbox: http://localhost:${PORT}/graphql (открыть в браузере)
  💚 Health Check: http://localhost:${PORT}/health
  
  🐳 Docker команды:
  • Запуск: docker-compose up
  • Фоновый режим: docker-compose up -d
  • Остановка: docker-compose down
  • Перезапуск: docker-compose restart
  • Логи: docker-compose logs -f app
  
  📋 Тестовые данные:
  • Запустить seed: npm run seed
  • Тестовые города: Москва, СПб, Сочи, Стамбул, Париж, Лондон
  • Авиакомпании: Аэрофлот, S7, Turkish Airlines, Lufthansa
  `);
});
