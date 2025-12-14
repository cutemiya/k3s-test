const resolvers = require('../src/resolvers');
const Offer = require('../src/models/Offer');

// Мокируем модель Offer
jest.mock('../src/models/Offer');

describe('Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchOffers', () => {
    it('должен возвращать результаты поиска с пагинацией', async () => {
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

      const result = await resolvers.searchOffers({
        departure: 'Москва',
        arrival: 'Стамбул',
        page: 1,
        limit: 20
      });

      expect(result).toHaveProperty('offers');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('pages');
      expect(result.offers).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(Offer.search).toHaveBeenCalled();
    });

    it('должен применять фильтры поиска', async () => {
      Offer.search.mockResolvedValue([]);

      await resolvers.searchOffers({
        departure: 'Москва',
        maxPrice: 500,
        airline: 'Аэрофлот',
        maxStops: 1,
        sortBy: 'price'
      });

      expect(Offer.search).toHaveBeenCalledWith(
        expect.objectContaining({
          departure: 'Москва',
          maxPrice: 500,
          airline: 'Аэрофлот',
          maxStops: 1,
          sortBy: 'price'
        })
      );
    });
  });

  describe('offer', () => {
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

      const result = await resolvers.offer({ id: '1' });

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.departure).toBe('Москва');
      expect(result.arrival).toBe('Стамбул');
      expect(Offer.findById).toHaveBeenCalledWith('1');
    });

    it('должен возвращать null если предложение не найдено', async () => {
      Offer.findById.mockResolvedValue(null);

      const result = await resolvers.offer({ id: '999' });

      expect(result).toBeNull();
    });
  });

  describe('stats', () => {
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

      const result = await resolvers.stats();

      expect(result).toHaveProperty('totalOffers', 100);
      expect(result).toHaveProperty('departureCities', 10);
      expect(result).toHaveProperty('arrivalCities', 15);
      expect(result).toHaveProperty('airlines', 5);
      expect(result).toHaveProperty('minPrice', 100);
      expect(result).toHaveProperty('maxPrice', 1000);
      expect(result).toHaveProperty('avgPrice', 500);
    });
  });

  describe('cities', () => {
    it('должен возвращать список городов', async () => {
      const mockCities = ['Москва', 'СПб', 'Сочи'];
      Offer.getCities.mockResolvedValue(mockCities);

      const result = await resolvers.cities({ type: 'departure' });

      expect(result).toEqual(mockCities);
      expect(Offer.getCities).toHaveBeenCalledWith('departure');
    });

    it('должен использовать тип "all" по умолчанию', async () => {
      Offer.getCities.mockResolvedValue([]);

      await resolvers.cities({});

      expect(Offer.getCities).toHaveBeenCalledWith('all');
    });
  });

  describe('airlines', () => {
    it('должен возвращать список авиакомпаний', async () => {
      const mockAirlines = ['Аэрофлот', 'S7', 'Turkish Airlines'];
      Offer.getAirlines.mockResolvedValue(mockAirlines);

      const result = await resolvers.airlines();

      expect(result).toEqual(mockAirlines);
      expect(Offer.getAirlines).toHaveBeenCalled();
    });
  });

  describe('createOffer', () => {
    it('должен создавать новое предложение', async () => {
      const input = {
        departure: 'Москва',
        arrival: 'Стамбул',
        departureDate: '2024-06-01T10:00:00Z',
        arrivalDate: '2024-06-01T14:00:00Z',
        marketingCompany: 'Аэрофлот',
        operatingCompany: 'Аэрофлот',
        price: {
          base: 300,
          tax: 50,
          total: 350
        },
        currency: 'USD',
        flightNumber: 'SU123',
        flightDuration: 180,
        stops: 0
      };

      const mockCreatedOffer = {
        id: 1,
        ...input,
        departure_city: input.departure,
        arrival_city: input.arrival,
        departure_date: new Date(input.departureDate),
        arrival_date: new Date(input.arrivalDate),
        marketing_company: input.marketingCompany,
        operating_company: input.operatingCompany,
        base_price: input.price.base,
        tax_price: input.price.tax,
        total_price: input.price.total,
        flight_number: input.flightNumber,
        flight_duration: input.flightDuration,
        created_at: new Date(),
        updated_at: new Date()
      };

      Offer.create.mockResolvedValue(mockCreatedOffer);

      const result = await resolvers.createOffer({ input });

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(Offer.create).toHaveBeenCalledWith(input);
    });
  });

  describe('updateOffer', () => {
    it('должен обновлять предложение', async () => {
      const updates = {
        arrival: 'Париж',
        price: {
          base: 400,
          tax: 60,
          total: 460
        }
      };

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
        created_at: new Date(),
        updated_at: new Date()
      };

      Offer.update.mockResolvedValue(mockUpdatedOffer);

      const result = await resolvers.updateOffer({
        id: '1',
        input: updates
      });

      expect(result).toBeDefined();
      expect(result.arrival).toBe('Париж');
      expect(Offer.update).toHaveBeenCalled();
    });
  });

  describe('deleteOffer', () => {
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
        created_at: new Date(),
        updated_at: new Date()
      };

      Offer.delete.mockResolvedValue(mockDeletedOffer);

      const result = await resolvers.deleteOffer({ id: '1' });

      expect(result).toBeDefined();
      expect(Offer.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('importOffers', () => {
    it('должен импортировать несколько предложений', async () => {
      const offers = [
        {
          departure: 'Москва',
          arrival: 'Стамбул',
          departureDate: '2024-06-01T10:00:00Z',
          arrivalDate: '2024-06-01T14:00:00Z',
          marketingCompany: 'Аэрофлот',
          price: { base: 300, tax: 50, total: 350 }
        },
        {
          departure: 'СПб',
          arrival: 'Париж',
          departureDate: '2024-06-02T10:00:00Z',
          arrivalDate: '2024-06-02T15:00:00Z',
          marketingCompany: 'S7',
          price: { base: 400, tax: 60, total: 460 }
        }
      ];

      Offer.create
        .mockResolvedValueOnce({
          id: 1,
          departure_city: offers[0].departure,
          arrival_city: offers[0].arrival,
          departure_date: new Date(offers[0].departureDate),
          arrival_date: new Date(offers[0].arrivalDate),
          marketing_company: offers[0].marketingCompany,
          operating_company: offers[0].marketingCompany,
          base_price: offers[0].price.base,
          tax_price: offers[0].price.tax,
          total_price: offers[0].price.total,
          currency: 'USD',
          created_at: new Date(),
          updated_at: new Date()
        })
        .mockResolvedValueOnce({
          id: 2,
          departure_city: offers[1].departure,
          arrival_city: offers[1].arrival,
          departure_date: new Date(offers[1].departureDate),
          arrival_date: new Date(offers[1].arrivalDate),
          marketing_company: offers[1].marketingCompany,
          operating_company: offers[1].marketingCompany,
          base_price: offers[1].price.base,
          tax_price: offers[1].price.tax,
          total_price: offers[1].price.total,
          currency: 'USD',
          created_at: new Date(),
          updated_at: new Date()
        });

      const result = await resolvers.importOffers({ offers });

      expect(result).toHaveLength(2);
      expect(Offer.create).toHaveBeenCalledTimes(2);
    });
  });
});
