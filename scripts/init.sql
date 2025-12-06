-- Создание таблицы предложений авиабилетов
CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    arrival_city VARCHAR(100) NOT NULL,
    departure_city VARCHAR(100) NOT NULL,
    arrival_date TIMESTAMP NOT NULL,
    departure_date TIMESTAMP NOT NULL,
    marketing_company VARCHAR(100) NOT NULL,
    operating_company VARCHAR(100),
    base_price DECIMAL(10, 2) NOT NULL,
    tax_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    flight_number VARCHAR(20),
    flight_duration INTEGER, -- в минутах
    stops INTEGER DEFAULT 0,
    aircraft_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX idx_offers_departure_city ON offers(departure_city);
CREATE INDEX idx_offers_arrival_city ON offers(arrival_city);
CREATE INDEX idx_offers_departure_date ON offers(departure_date);
CREATE INDEX idx_offers_total_price ON offers(total_price);
CREATE INDEX idx_offers_marketing_company ON offers(marketing_company);

-- Создание таблицы авиакомпаний
CREATE TABLE IF NOT EXISTS airlines (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    iata_code VARCHAR(3),
    icao_code VARCHAR(4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы городов/аэропортов
CREATE TABLE IF NOT EXISTS airports (
    id SERIAL PRIMARY KEY,
    iata_code VARCHAR(3) UNIQUE NOT NULL,
    icao_code VARCHAR(4),
    name VARCHAR(200) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    timezone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка тестовых данных авиакомпаний
INSERT INTO airlines (code, name, country, iata_code, icao_code) VALUES
('SU', 'Аэрофлот', 'Россия', 'SU', 'AFL'),
('S7', 'S7 Airlines', 'Россия', 'S7', 'SBI'),
('UT', 'UTair', 'Россия', 'UT', 'UTA'),
('U6', 'Уральские авиалинии', 'Россия', 'U6', 'SVR'),
('DP', 'Победа', 'Россия', 'DP', 'PBD'),
('TK', 'Turkish Airlines', 'Турция', 'TK', 'THY'),
('LH', 'Lufthansa', 'Германия', 'LH', 'DLH'),
('AF', 'Air France', 'Франция', 'AF', 'AFR'),
('BA', 'British Airways', 'Великобритания', 'BA', 'BAW')
ON CONFLICT (code) DO NOTHING;

-- Вставка тестовых данных аэропортов
INSERT INTO airports (iata_code, icao_code, name, city, country) VALUES
('SVO', 'UUEE', 'Шереметьево', 'Москва', 'Россия'),
('DME', 'UUDD', 'Домодедово', 'Москва', 'Россия'),
('VKO', 'UUWW', 'Внуково', 'Москва', 'Россия'),
('LED', 'ULLI', 'Пулково', 'Санкт-Петербург', 'Россия'),
('IST', 'LTFM', 'Стамбул', 'Стамбул', 'Турция'),
('FRA', 'EDDF', 'Франкфурт', 'Франкфурт', 'Германия'),
('CDG', 'LFPG', 'Шарль-де-Голль', 'Париж', 'Франция'),
('LHR', 'EGLL', 'Хитроу', 'Лондон', 'Великобритания')
ON CONFLICT (iata_code) DO NOTHING;