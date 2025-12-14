const request = require('supertest');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('../../src/schema');
const resolvers = require('../../src/resolvers');
const Offer = require('../../src/models/Offer');

// Мокируем модель Offer для интеграционных тестов
jest.mock('../../src/models/Offer');

describe('API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/graphql', graphqlHTTP({
      schema: schema,
      rootValue: resolvers,
      graphiql: false
    }));

    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        service: 'Flight Search API',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    app.get('/pod-info', (req, res) => {
      res.json({
        pod: process.env.HOSTNAME || 'unknown',
        timestamp: new Date().toISOString(),
        strategy: req.headers.host
      });
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Health Endpoint', () => {
    it('GET /health должен возвращать статус OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'Flight Search API');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Pod Info Endpoint', () => {
    it('GET /pod-info должен возвращать информацию о поде', async () => {
      const response = await request(app)
        .get('/pod-info')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('pod');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('strategy');
    });
  });

  describe('GraphQL Endpoint', () => {
    describe('Query: searchOffers', () => {
      it('должен выполнять поиск предложений', async () => {
        const mockOffers = [
          {
            id: 1,
            departure_city: 'Москва',
            arrival_city: 'Стамбул',
            departure_date: new Date('2024-06-01'),
            arrival_date: new Date('2024-06-01'),
            marketing_company: 'Аэрофлот',
            operating_company: 'Аэрофлот',
            base_price: 300,
            tax_price: 50,
            total_price: 350,
            currency: 'USD',
            flight_number: 'SU123',
            flight_duration: 180,
            stops: 0,
            aircraft_type: 'Boeing 737',
            created_at: new Date(),
            updated_at: new Date()
          }
        ];

        Offer.search.mockResolvedValue(mockOffers);

        const query = `
          query {
            searchOffers(departure: "Москва", arrival: "Стамбул") {
              offers {
                id
                departure
                arrival
                price {
                  total
                }
              }
              total
              page
              pages
            }
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data).toBeDefined();
        expect(response.body.data.searchOffers).toBeDefined();
        expect(response.body.data.searchOffers.offers).toHaveLength(1);
        expect(response.body.data.searchOffers.offers[0].id).toBe('1');
        expect(response.body.data.searchOffers.offers[0].departure).toBe('Москва');
      });
    });

    describe('Query: offer', () => {
      it('должен возвращать предложение по ID', async () => {
        const mockOffer = {
          id: 1,
          departure_city: 'Москва',
          arrival_city: 'Стамбул',
          departure_date: new Date('2024-06-01'),
          arrival_date: new Date('2024-06-01'),
          marketing_company: 'Аэрофлот',
          operating_company: 'Аэрофлот',
          base_price: 300,
          tax_price: 50,
          total_price: 350,
          currency: 'USD',
          flight_number: 'SU123',
          flight_duration: 180,
          stops: 0,
          aircraft_type: 'Boeing 737',
          created_at: new Date(),
          updated_at: new Date()
        };

        Offer.findById.mockResolvedValue(mockOffer);

        const query = `
          query {
            offer(id: "1") {
              id
              departure
              arrival
              marketingCompany
            }
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data.offer).toBeDefined();
        expect(response.body.data.offer.id).toBe('1');
        expect(response.body.data.offer.departure).toBe('Москва');
      });
    });

    describe('Query: stats', () => {
      it('должен возвращать статистику', async () => {
        const mockStats = {
          total_offers: '100',
          departure_cities: '10',
          arrival_cities: '15',
          airlines: '5',
          min_price: '100.00',
          max_price: '1000.00',
          avg_price: '500.00',
          avg_duration: '180.00'
        };

        Offer.getStats.mockResolvedValue(mockStats);

        const query = `
          query {
            stats {
              totalOffers
              departureCities
              arrivalCities
              airlines
              minPrice
              maxPrice
              avgPrice
            }
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data.stats).toBeDefined();
        expect(response.body.data.stats.totalOffers).toBe(100);
        expect(response.body.data.stats.departureCities).toBe(10);
      });
    });

    describe('Query: cities', () => {
      it('должен возвращать список городов', async () => {
        Offer.getCities.mockResolvedValue(['Москва', 'СПб', 'Сочи']);

        const query = `
          query {
            cities(type: "departure")
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data.cities).toEqual(['Москва', 'СПб', 'Сочи']);
      });
    });

    describe('Query: airlines', () => {
      it('должен возвращать список авиакомпаний', async () => {
        Offer.getAirlines.mockResolvedValue(['Аэрофлот', 'S7', 'Turkish Airlines']);

        const query = `
          query {
            airlines
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({ query })
          .expect(200);

        expect(response.body.data.airlines).toEqual(['Аэрофлот', 'S7', 'Turkish Airlines']);
      });
    });

    describe('Mutation: createOffer', () => {
      it('должен создавать новое предложение', async () => {
        const mockCreatedOffer = {
          id: 1,
          departure_city: 'Москва',
          arrival_city: 'Стамбул',
          departure_date: new Date('2024-06-01'),
          arrival_date: new Date('2024-06-01'),
          marketing_company: 'Аэрофлот',
          operating_company: 'Аэрофлот',
          base_price: 300,
          tax_price: 50,
          total_price: 350,
          currency: 'USD',
          flight_number: 'SU123',
          flight_duration: 180,
          stops: 0,
          aircraft_type: null,
          created_at: new Date(),
          updated_at: new Date()
        };

        Offer.create.mockResolvedValue(mockCreatedOffer);

        const mutation = `
          mutation {
            createOffer(input: {
              departure: "Москва"
              arrival: "Стамбул"
              departureDate: "2024-06-01T10:00:00Z"
              arrivalDate: "2024-06-01T14:00:00Z"
              marketingCompany: "Аэрофлот"
              price: {
                base: 300
                tax: 50
                total: 350
              }
            }) {
              id
              departure
              arrival
              price {
                total
              }
            }
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({ query: mutation })
          .expect(200);

        expect(response.body.data.createOffer).toBeDefined();
        expect(response.body.data.createOffer.id).toBe('1');
        expect(response.body.data.createOffer.departure).toBe('Москва');
      });
    });

    describe('Mutation: updateOffer', () => {
      it('должен обновлять предложение', async () => {
        const mockUpdatedOffer = {
          id: 1,
          departure_city: 'Москва',
          arrival_city: 'Париж',
          departure_date: new Date('2024-06-01'),
          arrival_date: new Date('2024-06-01'),
          marketing_company: 'Аэрофлот',
          operating_company: 'Аэрофлот',
          base_price: 400,
          tax_price: 60,
          total_price: 460,
          currency: 'USD',
          flight_number: 'SU123',
          flight_duration: 180,
          stops: 0,
          aircraft_type: null,
          created_at: new Date(),
          updated_at: new Date()
        };

        Offer.update.mockResolvedValue(mockUpdatedOffer);

        const mutation = `
          mutation {
            updateOffer(id: "1", input: {
              arrival: "Париж"
              price: {
                base: 400
                tax: 60
                total: 460
              }
            }) {
              id
              arrival
              price {
                total
              }
            }
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({ query: mutation })
          .expect(200);

        expect(response.body.data.updateOffer).toBeDefined();
        expect(response.body.data.updateOffer.arrival).toBe('Париж');
        expect(response.body.data.updateOffer.price.total).toBe(460);
      });
    });

    describe('Mutation: deleteOffer', () => {
      it('должен удалять предложение', async () => {
        const mockDeletedOffer = {
          id: 1,
          departure_city: 'Москва',
          arrival_city: 'Стамбул',
          departure_date: new Date('2024-06-01'),
          arrival_date: new Date('2024-06-01'),
          marketing_company: 'Аэрофлот',
          operating_company: 'Аэрофлот',
          base_price: 300,
          tax_price: 50,
          total_price: 350,
          currency: 'USD',
          flight_number: 'SU123',
          flight_duration: 180,
          stops: 0,
          aircraft_type: null,
          created_at: new Date(),
          updated_at: new Date()
        };

        Offer.delete.mockResolvedValue(mockDeletedOffer);

        const mutation = `
          mutation {
            deleteOffer(id: "1") {
              id
              departure
              arrival
            }
          }
        `;

        const response = await request(app)
          .post('/graphql')
          .send({ query: mutation })
          .expect(200);

        expect(response.body.data.deleteOffer).toBeDefined();
        expect(response.body.data.deleteOffer.id).toBe('1');
      });
    });
  });
});
