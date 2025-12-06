// // const express = require('express');
// // const { graphqlHTTP } = require('express-graphql');
// // const cors = require('cors');
// // const schema = require('./schema');
// // const resolvers = require('./resolvers');
// // require('dotenv').config();

// // const app = express();
// // const PORT = process.env.PORT || 4000;

// // // Middleware
// // app.use(cors());
// // app.use(express.json());

// // // GraphQL endpoint
// // app.use('/graphql', graphqlHTTP({
// //     schema: schema,
// //     rootValue: resolvers,
// //     graphiql: true, // Включаем GraphiQL (песочница)
// //     customFormatErrorFn: (error) => {
// //         console.error('GraphQL Error:', error);
// //         return {
// //             message: error.message,
// //             locations: error.locations,
// //             path: error.path
// //         };
// //     }
// // }));

// // // Health check endpoint
// // app.get('/health', (req, res) => {
// //     res.json({
// //         status: 'ok',
// //         timestamp: new Date().toISOString(),
// //         service: 'Express GraphQL API',
// //         version: '1.0.0',
// //         database: 'PostgreSQL'
// //     });
// // });

// // // API info endpoint
// // app.get('/', (req, res) => {
// //     res.send(`
// //     <!DOCTYPE html>
// //     <html>
// //     <head>
// //       <title>Express GraphQL API</title>
// //       <style>
// //         body {
// //           font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
// //           max-width: 1200px;
// //           margin: 0 auto;
// //           padding: 20px;
// //           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// //           min-height: 100vh;
// //           color: white;
// //         }
// //         .container {
// //           background: rgba(255, 255, 255, 0.1);
// //           backdrop-filter: blur(10px);
// //           border-radius: 20px;
// //           padding: 40px;
// //           margin-top: 20px;
// //         }
// //         h1 {
// //           color: white;
// //           text-align: center;
// //           font-size: 2.5em;
// //           margin-bottom: 30px;
// //         }
// //         .card {
// //           background: rgba(255, 255, 255, 0.15);
// //           border-radius: 10px;
// //           padding: 20px;
// //           margin-bottom: 20px;
// //           transition: transform 0.3s;
// //         }
// //         .card:hover {
// //           transform: translateY(-5px);
// //         }
// //         .endpoint {
// //           font-family: 'Courier New', monospace;
// //           background: rgba(0, 0, 0, 0.3);
// //           padding: 10px;
// //           border-radius: 5px;
// //           margin: 10px 0;
// //         }
// //         .btn {
// //           display: inline-block;
// //           background: white;
// //           color: #667eea;
// //           padding: 12px 30px;
// //           border-radius: 50px;
// //           text-decoration: none;
// //           font-weight: bold;
// //           margin: 10px 5px;
// //           transition: all 0.3s;
// //         }
// //         .btn:hover {
// //           background: #f8f9fa;
// //           transform: scale(1.05);
// //         }
// //         .links {
// //           display: flex;
// //           justify-content: center;
// //           flex-wrap: wrap;
// //           margin-top: 30px;
// //         }
// //       </style>
// //     </head>
// //     <body>
// //       <h1>🚀 Express GraphQL API</h1>
      
// //       <div class="container">
// //         <div class="card">
// //           <h2>📊 Доступные эндпоинты:</h2>
// //           <div class="endpoint">POST /graphql</div>
// //           <p>GraphQL API endpoint с поддержкой GraphiQL</p>
          
// //           <div class="endpoint">GET /health</div>
// //           <p>Проверка здоровья приложения</p>
// //         </div>
        
// //         <div class="card">
// //           <h2>📝 Примеры GraphQL запросов:</h2>
          
// //           <h3>Запросы (Query):</h3>
// //           <pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; overflow-x: auto;">
// // query {
// //   tasks {
// //     id
// //     title
// //     completed
// //     priority
// //   }
  
// //   stats {
// //     total
// //     completed
// //     pending
// //   }
// // }</pre>
          
// //           <h3>Мутации (Mutation):</h3>
// //           <pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; overflow-x: auto;">
// // mutation {
// //   createTask(
// //     title: "Новая задача"
// //     description: "Описание задачи"
// //     priority: 1
// //   ) {
// //     id
// //     title
// //     completed
// //   }
// // }</pre>
// //         </div>
        
// //         <div class="card">
// //           <h2>⚙️ Технологии:</h2>
// //           <ul>
// //             <li>Express.js - Веб-фреймворк</li>
// //             <li>GraphQL - Язык запросов API</li>
// //             <li>PostgreSQL - База данных</li>
// //             <li>Docker - Контейнеризация</li>
// //             <li>Docker Compose - Оркестрация</li>
// //           </ul>
// //         </div>
// //       </div>
      
// //       <div class="links">
// //         <a href="/graphql" class="btn">🎮 Открыть GraphiQL</a>
// //         <a href="/health" class="btn">💚 Проверить здоровье</a>
// //       </div>
      
// //       <div style="text-align: center; margin-top: 40px; opacity: 0.8;">
// //         <p>Порт: ${PORT} | База данных: PostgreSQL | Режим: ${process.env.NODE_ENV}</p>
// //       </div>
// //     </body>
// //     </html>
// //   `);
// // });

// // // Запуск сервера
// // app.listen(PORT, () => {
// //     console.log(`
// //   🚀 Сервер запущен!
  
// //   📍 Локальный: http://localhost:${PORT}
// //   🔗 GraphQL: http://localhost:${PORT}/graphql
// //   💚 Health: http://localhost:${PORT}/health
  
// //   🐳 Docker Compose команды:
// //   • Запуск: docker-compose up
// //   • Запуск в фоне: docker-compose up -d
// //   • Остановка: docker-compose down
// //   • Логи: docker-compose logs -f app
  
// //   📊 pgAdmin доступен по: http://localhost:5050
// //   Email: admin@admin.com
// //   Пароль: admin
// //   `);
// // });
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const cors = require('cors');
const schema = require('./schema');
const resolvers = require('./resolvers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// GraphQL endpoint
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

// REST API для обратной совместимости
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

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Flight Search API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: ['GraphQL', 'PostgreSQL', 'Search', 'Filtering', 'Sorting']
  });
});

// Главная страница
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
          background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
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
// const express = require('express');
// const { graphqlHTTP } = require('express-graphql');
// const cors = require('cors');
// const helmet = require('helmet');
// const compression = require('compression');
// const rateLimit = require('express-rate-limit');
// const schema = require('./schema');
// const resolvers = require('./resolvers');

// const app = express();
// const PORT = process.env.PORT || 4000;

// // Получаем hostname для идентификации пода
// const podName = process.env.HOSTNAME || 'local';
// const nodeName = process.env.NODE_NAME || 'local-node';

// // Rate limiting для продакшена
// if (process.env.NODE_ENV === 'production') {
//   const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 минут
//     max: 100, // максимум 100 запросов с одного IP
//     standardHeaders: true,
//     legacyHeaders: false,
//     message: 'Слишком много запросов с этого IP, попробуйте позже'
//   });
//   app.use(limiter);
// }

// // Middleware для безопасности
// app.use(helmet({
//   contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
// }));

// app.use(cors());
// app.use(compression());
// app.use(express.json());

// // GraphQL endpoint
// const graphiqlEnabled = process.env.GRAPHIQL_ENABLED === 'true';
// app.use('/graphql', graphqlHTTP({
//   schema: schema,
//   rootValue: resolvers,
//   graphiql: graphiqlEnabled, // Песочница только в одном экземпляре
//   customFormatErrorFn: (error) => {
//     console.error('GraphQL Error:', error);
//     return {
//       message: error.message,
//       locations: error.locations,
//       path: error.path
//     };
//   }
// }));

// // Health check с информацией о поде
// app.get('/health', (req, res) => {
//   const healthInfo = {
//     status: 'healthy',
//     service: 'Flight Search API',
//     timestamp: new Date().toISOString(),
//     pod: podName,
//     node: nodeName,
//     version: '1.0.0',
//     environment: process.env.NODE_ENV,
//     features: ['GraphQL', 'PostgreSQL', 'Search', 'Filtering', 'Sorting'],
//     uptime: process.uptime(),
//     memory: process.memoryUsage(),
//     graphiql: graphiqlEnabled
//   };
  
//   res.json(healthInfo);
// });

// // Ready check для Kubernetes readiness probe
// app.get('/ready', (req, res) => {
//   // Здесь можно добавить проверку подключения к БД
//   res.json({ 
//     status: 'ready',
//     pod: podName,
//     timestamp: new Date().toISOString()
//   });
// });

// // Главная страница
// app.get('/', (req, res) => {
//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <title>Flight Search API ✈️ [${podName}]</title>
//       <style>
//         body {
//           font-family: Arial, sans-serif;
//           padding: 20px;
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           color: white;
//           min-height: 100vh;
//         }
//         .container {
//           max-width: 800px;
//           margin: 0 auto;
//           background: rgba(255,255,255,0.1);
//           padding: 30px;
//           border-radius: 10px;
//         }
//         .pod-info {
//           background: rgba(0,0,0,0.2);
//           padding: 10px;
//           border-radius: 5px;
//           margin-bottom: 20px;
//         }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <h1>✈️ Flight Search API</h1>
//         <div class="pod-info">
//           <strong>Pod:</strong> ${podName}<br>
//           <strong>Node:</strong> ${nodeName}<br>
//           <strong>Environment:</strong> ${process.env.NODE_ENV}
//         </div>
//         <p><a href="/graphql" style="color: #4facfe;">GraphiQL Sandbox</a></p>
//         <p><a href="/health" style="color: #4facfe;">Health Check</a></p>
//         <p><a href="/ready" style="color: #4facfe;">Ready Check</a></p>
//       </div>
//     </body>
//     </html>
//   `;
//   res.send(html);
// });

// // Обработка сигналов для graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM received, shutting down gracefully');
//   server.close(() => {
//     console.log('Server closed');
//     process.exit(0);
//   });
// });

// process.on('SIGINT', () => {
//   console.log('SIGINT received, shutting down');
//   server.close(() => {
//     console.log('Server closed');
//     process.exit(0);
//   });
// });

// const server = app.listen(PORT, () => {
//   console.log(`
//   ✈️  Flight Search API запущен!
  
//   Pod: ${podName}
//   Node: ${nodeName}
//   Port: ${PORT}
//   Environment: ${process.env.NODE_ENV}
//   GraphiQL: ${graphiqlEnabled ? 'Enabled' : 'Disabled'}
  
//   Endpoints:
//   - http://localhost:${PORT}/graphql
//   - http://localhost:${PORT}/health
//   - http://localhost:${PORT}/ready
//   `);
// });

// module.exports = server; // Для тестов