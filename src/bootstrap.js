import cities from 'all-the-cities';
import allCountries from 'all-countries';
import sleep from 'await-sleep';

import logger from './logger';
import City from './models/City';
import { Mongoose } from 'mongoose';

function genCountriesMap() {
  const output = {};
  const { getCountryCodes: countryCodes, all: countryNames } = allCountries;
  for (let i = 0; i < countryCodes.length; i++) {
    output[countryCodes[i]] = {
      twoCharCountryCode: countryCodes[i].toLowerCase(),
      countryName: countryNames[i].toLowerCase()
    };
  }
  return output;
}

function genCitiesArr(countriesMap) {
  const output = [];
  for (let i = 0; i < cities.length; i++) {
    const { country: countryCode, name, lat, lon } = cities[i];
    const country = countriesMap[countryCode];

    const loc = {
      type: 'Point',
      coordinates: [lon, lat]
    };

    output.push({
      ...country,
      cityName: name.toLowerCase(),
      loc
    });
  }
  return output;
}

export default function bootstrap() {
  const countriesMap = genCountriesMap();
  const citiesArr = genCitiesArr(countriesMap);

  (async () => {
    logger.info('Clearing cities DB..');
    await City.remove({});
    logger.info('Bootstrapping cities..');
    await City.insertMany(citiesArr).then(() => logger.info('Bootstrapping cities done.'));
  })();
}
