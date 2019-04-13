import { Router } from 'express';
import _ from 'lodash';
import removeAccents from 'remove-accents';

import City from '../models/City';

const routes = Router();

async function findCountries(tokens) {
  const promises = Promise.all(
    tokens.map(token => {
      const t = token.trim();
      return City.findOne({
        $or: [{ twoCharCountryCode: t }, { countryName: t }]
      });
    })
  );

  // remove null entries
  const cities = _.compact(await promises);

  // map field
  return cities.map(city => {
    const { countryName } = city;
    return countryName;
  });
}

async function findCities(tokens) {
  const promises = Promise.all(
    tokens.map(token => {
      const t = token.trim();
      return City.findOne({
        cityName: t
      });
    })
  );

  // remove null entries
  const cities = _.compact(await promises);

  // map field
  const cities2 = cities.map(city => {
    const { cityName } = city;
    return cityName;
  });

  const countries = cities.map(city => {
    const { countryName } = city;
    return countryName;
  });

  return { cities: cities2, countries };
}

routes.post('/decode', async (req, res, next) => {
  const { query } = req.body;
  if (!query) {
    return res.json({ cities: [], countries: [] });
  }
  let tokens = query.split(',') || [];
  tokens = tokens.map(t => {
    return t.trim().toLowerCase();
  });

  let tokens2 = query.split(' ') || [];
  tokens2 = tokens2.map(t => {
    return t.trim().toLowerCase();
  });

  tokens = _.union(tokens, tokens2);
  tokens = tokens.map(t => removeAccents(t));
  console.log(tokens);

  const countryNames = await findCountries(tokens);
  const { cities, countries } = await findCities(tokens);

  res.json({
    countryNames: _.uniq(_.union(countryNames, countries)),
    cityNames: _.uniq(cities)
  });
});

routes.post('/nearest', async (req, res, next) => {
  const { city, country, distance } = req.body;

  if (!city) {
    return res.json('Please specify a city.');
  }

  const citySanitized = city.trim().toLowerCase();
  const countrySanitized = (country || '').trim().toLowerCase();
  const distSanitized = parseInt(distance, 10);

  const query = {
    cityName: citySanitized
  };

  // add if available
  if (country) {
    query.countryName = countrySanitized;
  }

  const rootCity = await City.findOne(query);

  if (!rootCity) {
    return res.json({ error: 'No such city!', cities: [] });
  }

  const { coordinates } = rootCity.loc;

  const nearestCities = await City.find({
    loc: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $minDistance: 0,
        $maxDistance: distSanitized
      }
    }
  });

  return res.json({ cities: nearestCities });
});

export default routes;
