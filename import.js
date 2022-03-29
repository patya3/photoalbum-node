const cities = require('./cities.json');
const { MongoClient, ObjectId } = require('mongodb');

const client = new MongoClient('mongodb://127.0.0.1:27017');

async function run() {
  try {
    await client.connect();
    const database = client.db('photoalbum');
    const collections = {
      cities: database.collection('cities'),
      subcountries: database.collection('subcountries'),
      countries: database.collection('countries'),
    };

    const { cities, countries, subcountries } = collectEntities();
    await collections.countries.insertMany([...countries]);
    await collections.subcountries.insertMany([...subcountries]);
    await collections.cities.insertMany([...cities]);
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
}

run().catch(console.error);

function collectEntities() {
  const entities = {
    cities: [],
    countries: [],
    subcountries: [],
  };
  for (const city of cities) {
    let countryId = new ObjectId();
    let subcountryId = new ObjectId();
    let cityId = new ObjectId();

    if (!entities.countries.some((c) => c.name === city.country)) {
      entities.countries.push({ _id: countryId, name: city.country });
    }
    if (!entities.subcountries.some((s) => s.name === city.subcountry)) {
      entities.subcountries.push({
        _id: subcountryId,
        countryId: countryId.toString(),
        name: city.subcountry,
      });
    }
    if (!entities.cities.some((ci) => ci.name === city.name)) {
      entities.cities.push({
        _id: cityId,
        countryId: countryId.toString(),
        subcountryId: subcountryId.toString(),
        name: city.name,
      });
    }
  }
  return entities;
}
