const Offer = require('./models/Offer');

const resolvers = {
  // Запросы (Query)
  searchOffers: async ({
    departure,
    arrival,
    departureDate,
    returnDate,
    maxPrice,
    airline,
    maxStops,
    sortBy,
    page = 1,
    limit = 20
  }) => {
    const filters = {};
    
    if (departure) filters.departure = departure;
    if (arrival) filters.arrival = arrival;
    if (departureDate) filters.departureDate = departureDate;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (airline) filters.airline = airline;
    if (maxStops !== undefined) filters.maxStops = maxStops;
    if (sortBy) filters.sortBy = sortBy;
    
    filters.limit = limit;
    filters.offset = (page - 1) * limit;
    
    const offers = await Offer.search(filters);
    
    // Получаем общее количество для пагинации
    const totalResult = await Offer.search({ ...filters, limit: null, offset: 0 });
    const total = totalResult.length;
    const pages = Math.ceil(total / limit);
    
    return {
      offers: offers.map(formatOffer),
      total,
      page,
      pages
    };
  },
  
  offer: async ({ id }) => {
    const offer = await Offer.findById(id);
    return offer ? formatOffer(offer) : null;
  },
  
  stats: async () => {
    const stats = await Offer.getStats();
    return {
      totalOffers: parseInt(stats.total_offers),
      departureCities: parseInt(stats.departure_cities),
      arrivalCities: parseInt(stats.arrival_cities),
      airlines: parseInt(stats.airlines),
      minPrice: parseFloat(stats.min_price),
      maxPrice: parseFloat(stats.max_price),
      avgPrice: parseFloat(stats.avg_price),
      avgDuration: parseFloat(stats.avg_duration)
    };
  },
  
  cities: async ({ type = 'all' }) => {
    return await Offer.getCities(type);
  },
  
  airlines: async () => {
    return await Offer.getAirlines();
  },
  
  popularDestinations: async ({ limit = 10 }) => {
    // Здесь можно реализовать логику популярных направлений
    // Для простоты вернем пустой массив
    return [];
  },
  
  // Мутации (Mutation)
  createOffer: async ({ input }) => {
    const offer = await Offer.create(input);
    return formatOffer(offer);
  },
  
  updateOffer: async ({ id, input }) => {
    // Конвертируем input в формат базы данных
    const updates = {};
    
    if (input.arrival) updates.arrival_city = input.arrival;
    if (input.departure) updates.departure_city = input.departure;
    if (input.arrivalDate) updates.arrival_date = input.arrivalDate;
    if (input.departureDate) updates.departure_date = input.departureDate;
    if (input.marketingCompany) updates.marketing_company = input.marketingCompany;
    if (input.operatingCompany) updates.operating_company = input.operatingCompany;
    if (input.price) {
      updates.base_price = input.price.base;
      updates.tax_price = input.price.tax;
      updates.total_price = input.price.total;
    }
    if (input.currency) updates.currency = input.currency;
    if (input.flightNumber) updates.flight_number = input.flightNumber;
    if (input.flightDuration) updates.flight_duration = input.flightDuration;
    if (input.stops !== undefined) updates.stops = input.stops;
    if (input.aircraftType) updates.aircraft_type = input.aircraftType;
    
    const updatedOffer = await Offer.update(id, updates);
    return formatOffer(updatedOffer);
  },
  
  deleteOffer: async ({ id }) => {
    const offer = await Offer.delete(id);
    return formatOffer(offer);
  },
  
  importOffers: async ({ offers }) => {
    const createdOffers = [];
    for (const offerInput of offers) {
      const offer = await Offer.create(offerInput);
      createdOffers.push(formatOffer(offer));
    }
    return createdOffers;
  }
};

// Вспомогательная функция для форматирования предложения
function formatOffer(dbOffer) {
  return {
    id: dbOffer.id,
    arrival: dbOffer.arrival_city,
    departure: dbOffer.departure_city,
    arrivalDate: dbOffer.arrival_date.toISOString(),
    departureDate: dbOffer.departure_date.toISOString(),
    marketingCompany: dbOffer.marketing_company,
    operatingCompany: dbOffer.operating_company,
    price: {
      base: parseFloat(dbOffer.base_price),
      tax: parseFloat(dbOffer.tax_price),
      total: parseFloat(dbOffer.total_price)
    },
    currency: dbOffer.currency,
    flightNumber: dbOffer.flight_number,
    flightDuration: dbOffer.flight_duration,
    stops: dbOffer.stops,
    aircraftType: dbOffer.aircraft_type,
    createdAt: dbOffer.created_at.toISOString(),
    updatedAt: dbOffer.updated_at.toISOString()
  };
}

module.exports = resolvers;