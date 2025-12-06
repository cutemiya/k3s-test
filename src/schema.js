const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Price {
    base: Float!
    tax: Float!
    total: Float!
  }

  input PriceInput {
    base: Float!
    tax: Float!
    total: Float!
  }

  type Offer {
    id: ID!
    arrival: String!
    departure: String!
    arrivalDate: String!
    departureDate: String!
    marketingCompany: String!
    operatingCompany: String
    price: Price!
    currency: String!
    flightNumber: String
    flightDuration: Int
    stops: Int
    aircraftType: String
    createdAt: String!
    updatedAt: String!
  }

  type SearchResult {
    offers: [Offer!]!
    total: Int!
    page: Int!
    pages: Int!
  }

  type Stats {
    totalOffers: Int!
    departureCities: Int!
    arrivalCities: Int!
    airlines: Int!
    minPrice: Float!
    maxPrice: Float!
    avgPrice: Float!
    avgDuration: Float!
  }

  type Query {
    # Поиск авиабилетов
    searchOffers(
      departure: String
      arrival: String
      departureDate: String
      returnDate: String
      maxPrice: Float
      airline: String
      maxStops: Int
      sortBy: String
      page: Int
      limit: Int
    ): SearchResult!
    
    # Получить предложение по ID
    offer(id: ID!): Offer
    
    # Получить статистику
    stats: Stats!
    
    # Получить список городов
    cities(type: String): [String!]!
    
    # Получить список авиакомпаний
    airlines: [String!]!
    
    # Получить популярные направления
    popularDestinations(limit: Int): [PopularDestination!]!
  }

  type PopularDestination {
    city: String!
    count: Int!
    minPrice: Float!
    avgPrice: Float!
  }

  type Mutation {
    # Создать новое предложение
    createOffer(input: OfferInput!): Offer!
    
    # Обновить предложение
    updateOffer(id: ID!, input: UpdateOfferInput!): Offer!
    
    # Удалить предложение
    deleteOffer(id: ID!): Offer!
    
    # Импортировать несколько предложений
    importOffers(offers: [OfferInput!]!): [Offer!]!
  }

  input OfferInput {
    arrival: String!
    departure: String!
    arrivalDate: String!
    departureDate: String!
    marketingCompany: String!
    operatingCompany: String
    price: PriceInput!
    currency: String
    flightNumber: String
    flightDuration: Int
    stops: Int
    aircraftType: String
  }

  input UpdateOfferInput {
    arrival: String
    departure: String
    arrivalDate: String
    departureDate: String
    marketingCompany: String
    operatingCompany: String
    price: PriceInput
    currency: String
    flightNumber: String
    flightDuration: Int
    stops: Int
    aircraftType: String
  }

  type Subscription {
    # Подписка на новые предложения
    offerCreated: Offer!
    
    # Подписка на обновления цен
    priceUpdated: Offer!
  }
`);

module.exports = schema;