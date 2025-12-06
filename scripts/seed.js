const { Pool } = require('pg');
const faker = require('faker');
faker.locale = 'ru';

const pool = new Pool({
    connectionString: 'postgresql://postgres:password@localhost:5432/flightdb'
});

const airlines = ['Аэрофлот', 'S7 Airlines', 'UTair', 'Уральские авиалинии', 'Turkish Airlines', 'Lufthansa', 'Air France'];
const cities = ['Москва', 'Санкт-Петербург', 'Сочи', 'Екатеринбург', 'Новосибирск', 'Казань', 'Стамбул', 'Париж', 'Лондон', 'Берлин'];
const aircrafts = ['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A350', 'Sukhoi Superjet 100'];

async function seed() {
    try {
        // Очистка таблицы
        await pool.query('TRUNCATE offers RESTART IDENTITY');

        const offers = [];

        // Генерация 50 тестовых предложений
        for (let i = 0; i < 50; i++) {
            const departureCity = faker.random.arrayElement(cities);
            let arrivalCity;

            // Гарантируем, что город прибытия отличается от города вылета
            do {
                arrivalCity = faker.random.arrayElement(cities);
            } while (arrivalCity === departureCity);

            const departureDate = faker.date.future();
            const arrivalDate = new Date(departureDate.getTime() + faker.datatype.number({ min: 1, max: 10 }) * 60 * 60 * 1000);

            const basePrice = faker.datatype.number({ min: 50, max: 500 });
            const taxPrice = faker.datatype.number({ min: 10, max: 100 });
            const totalPrice = basePrice + taxPrice;

            const marketingCompany = faker.random.arrayElement(airlines);
            const operatingCompany = Math.random() > 0.2 ? marketingCompany : faker.random.arrayElement(airlines);

            offers.push({
                arrival_city: arrivalCity,
                departure_city: departureCity,
                arrival_date: arrivalDate,
                departure_date: departureDate,
                marketing_company: marketingCompany,
                operating_company: operatingCompany,
                base_price: basePrice,
                tax_price: taxPrice,
                total_price: totalPrice,
                currency: 'USD',
                flight_number: `${faker.random.alpha({ count: 2, upcase: true })}${faker.datatype.number({ min: 100, max: 999 })}`,
                flight_duration: faker.datatype.number({ min: 60, max: 600 }),
                stops: faker.datatype.number({ min: 0, max: 2 }),
                aircraft_type: faker.random.arrayElement(aircrafts)
            });
        }

        // Вставка данных
        for (const offer of offers) {
            await pool.query(`
        INSERT INTO offers (
          arrival_city, departure_city, arrival_date, departure_date,
          marketing_company, operating_company, base_price, tax_price,
          total_price, currency, flight_number, flight_duration,
          stops, aircraft_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
                offer.arrival_city,
                offer.departure_city,
                offer.arrival_date,
                offer.departure_date,
                offer.marketing_company,
                offer.operating_company,
                offer.base_price,
                offer.tax_price,
                offer.total_price,
                offer.currency,
                offer.flight_number,
                offer.flight_duration,
                offer.stops,
                offer.aircraft_type
            ]);
        }

        console.log('✅ Тестовые данные успешно загружены!');
        console.log(`📊 Создано ${offers.length} предложений авиабилетов`);

    } catch (error) {
        console.error('❌ Ошибка при загрузке тестовых данных:', error);
    } finally {
        await pool.end();
    }
}

seed();

// "scripts": {
//   "start": "node src/index.js",
//   "dev": "nodemon src/index.js",
//   "seed": "node scripts/seed.js"
// },
// "dependencies": {
//   "express": "^4.18.2",
//   "graphql": "^15.8.0",
//   "express-graphql": "^0.12.0",
//   "pg": "^8.11.0",
//   "dotenv": "^16.0.3",
//   "cors": "^2.8.5",
//   "faker": "^5.5.3"
// },
// "devDependencies": {
//   "nodemon": "^2.0.22"
// },