const Offer = require('../../src/models/Offer');
const db = require('../../src/db');

// Мокируем базу данных
jest.mock('../../src/db');

describe('Offer Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('должен создавать новое предложение', async () => {
      const offerData = {
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

      const mockResult = {
        rows: [{
          id: 1,
          arrival_city: offerData.arrival,
          departure_city: offerData.departure,
          arrival_date: new Date(offerData.arrivalDate),
          departure_date: new Date(offerData.departureDate),
          marketing_company: offerData.marketingCompany,
          operating_company: offerData.operatingCompany,
          base_price: offerData.price.base,
          tax_price: offerData.price.tax,
          total_price: offerData.price.total,
          currency: offerData.currency,
          flight_number: offerData.flightNumber,
          flight_duration: offerData.flightDuration,
          stops: offerData.stops,
          aircraft_type: null,
          created_at: new Date(),
          updated_at: new Date()
        }]
      };

      db.query.mockResolvedValue(mockResult);

      const result = await Offer.create(offerData);

      expect(result).toEqual(mockResult.rows[0]);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO offers'),
        expect.arrayContaining([
          offerData.arrival,
          offerData.departure,
          offerData.arrivalDate,
          offerData.departureDate,
          offerData.marketingCompany,
          offerData.operatingCompany,
          offerData.price.base,
          offerData.price.tax,
          offerData.price.total
        ])
      );
    });

    it('должен использовать значения по умолчанию для опциональных полей', async () => {
      const offerData = {
        departure: 'Москва',
        arrival: 'Стамбул',
        departureDate: '2024-06-01T10:00:00Z',
        arrivalDate: '2024-06-01T14:00:00Z',
        marketingCompany: 'Аэрофлот',
        price: {
          base: 300,
          tax: 50,
          total: 350
        }
      };

      db.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await Offer.create(offerData);

      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['USD', undefined, undefined, 0, undefined])
      );
    });
  });

  describe('search', () => {
    it('должен выполнять поиск без фильтров', async () => {
      const mockResult = {
        rows: [
          {
            id: 1,
            departure_city: 'Москва',
            arrival_city: 'Стамбул'
          }
        ]
      };

      db.query.mockResolvedValue(mockResult);

      const result = await Offer.search({});

      expect(result).toEqual(mockResult.rows);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM offers WHERE 1=1'),
        expect.any(Array)
      );
    });

    it('должен применять фильтр по городу отправления', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await Offer.search({ departure: 'Москва' });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('departure_city ILIKE'),
        expect.arrayContaining(['%Москва%'])
      );
    });

    it('должен применять фильтр по максимальной цене', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await Offer.search({ maxPrice: 500 });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('total_price <='),
        expect.arrayContaining([500])
      );
    });

    it('должен применять фильтр по диапазону цен', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await Offer.search({
        price: {
          min: 100,
          max: 500
        }
      });

      const callArgs = db.query.mock.calls[0];
      expect(callArgs[0]).toContain('total_price >=');
      expect(callArgs[0]).toContain('total_price <=');
      expect(callArgs[1]).toContain(100);
      expect(callArgs[1]).toContain(500);
    });

    it('должен применять сортировку по цене', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await Offer.search({ sortBy: 'price' });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY'),
        expect.any(Array)
      );
      const query = db.query.mock.calls[0][0];
      expect(query).toContain('total_price ASC');
    });

    it('должен применять сортировку по длительности', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await Offer.search({ sortBy: 'duration' });

      const query = db.query.mock.calls[0][0];
      expect(query).toContain('flight_duration ASC');
    });

    it('должен применять пагинацию', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await Offer.search({ limit: 10, offset: 20 });

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT'),
        expect.arrayContaining([10, 20])
      );
    });

    it('должен использовать значения по умолчанию для пагинации', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await Offer.search({});

      const callArgs = db.query.mock.calls[0];
      expect(callArgs[0]).toContain('LIMIT');
      expect(callArgs[1]).toContain(50); // значение по умолчанию
      expect(callArgs[1]).toContain(0); // offset по умолчанию
    });
  });

  describe('findById', () => {
    it('должен находить предложение по ID', async () => {
      const mockResult = {
        rows: [{
          id: 1,
          departure_city: 'Москва',
          arrival_city: 'Стамбул'
        }]
      };

      db.query.mockResolvedValue(mockResult);

      const result = await Offer.findById(1);

      expect(result).toEqual(mockResult.rows[0]);
      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM offers WHERE id = $1',
        [1]
      );
    });

    it('должен возвращать undefined если предложение не найдено', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await Offer.findById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('должен обновлять предложение', async () => {
      const updates = {
        arrival_city: 'Париж',
        total_price: 500
      };

      const mockResult = {
        rows: [{
          id: 1,
          arrival_city: 'Париж',
          total_price: 500,
          updated_at: new Date()
        }]
      };

      db.query.mockResolvedValue(mockResult);

      const result = await Offer.update(1, updates);

      expect(result).toEqual(mockResult.rows[0]);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE offers'),
        expect.arrayContaining([500, 1])
      );
    });

    it('должен обновлять поле updated_at', async () => {
      const updates = { arrival_city: 'Париж' };

      db.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await Offer.update(1, updates);

      const callArgs = db.query.mock.calls[0];
      expect(callArgs[0]).toContain('updated_at');
      expect(callArgs[1][callArgs[1].length - 1]).toBe(1); // id должен быть последним
    });

    it('должен игнорировать неразрешенные поля', async () => {
      const updates = {
        arrival_city: 'Париж',
        invalid_field: 'should be ignored'
      };

      db.query.mockResolvedValue({ rows: [{ id: 1 }] });

      await Offer.update(1, updates);

      const query = db.query.mock.calls[0][0];
      expect(query).not.toContain('invalid_field');
    });
  });

  describe('delete', () => {
    it('должен удалять предложение', async () => {
      const mockResult = {
        rows: [{
          id: 1,
          departure_city: 'Москва',
          arrival_city: 'Стамбул'
        }]
      };

      db.query.mockResolvedValue(mockResult);

      const result = await Offer.delete(1);

      expect(result).toEqual(mockResult.rows[0]);
      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM offers WHERE id = $1 RETURNING *',
        [1]
      );
    });
  });
});
