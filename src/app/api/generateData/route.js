import { NextResponse } from 'next/server';
import { fakerDE, fakerRU, fakerPL, faker } from '@faker-js/faker';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get('region');
    const errors = searchParams.get('errors');
    const seed = searchParams.get('seed');
    const page = parseInt(searchParams.get('page'), 10) || 1;

    const recordsPerPage = 20;
    const totalRecords = 100;
    const startIndex = (page - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;

    if (!region || !errors || !seed || !page) {
      throw new Error('Missing query parameters');
    }

    function stringToSeed(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
      }

    const seedNumber = stringToSeed(seed);
    
    let faker;
    if (region === 'pl') {
      faker = fakerPL;
    } else if (region === 'uz') {
      faker = fakerRU;
    } else {
      faker = fakerDE;
    }

    faker.seed(seedNumber);

    const data = [];
for (let i = 0; i < totalRecords; i++) {
  let person = faker.person.fullName();
  let address = faker.location.streetAddress();
  let phone = faker.phone.number();

  person = introduceErrors(person, errors, region);
  address = introduceErrors(address, errors, region);
  phone = introduceErrors(phone, errors, region);

  data.push({
    id: faker.string.uuid(),
    fullName: person,
    address: address,
    phone: phone,
  });
}

    const paginatedData = data.slice(startIndex, endIndex);
    
    return NextResponse.json({ data: paginatedData });
  } catch (error) {
    console.error('Error generating data:', error.message);
    return NextResponse.json({ error: 'Failed to generate data' }, { status: 500 });
  }
}

function introduceErrors(str, errorCount, region) {
    const alphabet = region === 'de' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' :
                     region === 'pl' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' :
                     'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЫЭЮЯабвгдеёжзийклмнопрстуфхцчшщыэюя';
  
    let newStr = str.split('');
  
    for (let i = 0; i < Math.floor(errorCount); i++) {
      newStr = applyRandomError(newStr, alphabet);
      if (newStr.length > str.length * 1.2) break;
    }
  
    if (Math.random() < errorCount % 1) {
      newStr = applyRandomError(newStr, alphabet);
      if (newStr.length > str.length * 1.2) {
        newStr = newStr.slice(0, str.length);
      }
    }
  
    if (newStr.length < Math.max(1, str.length * 0.8)) {
      newStr = newStr.concat(str.slice(newStr.length));
    }
  
    return newStr.join('');
  }

  function applyRandomError(arr, alphabet) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    const errorType = Math.floor(Math.random() * 3);
  
    switch (errorType) {
      case 0:
        if (arr.length > 1) {
          return arr.slice(0, randomIndex).concat(arr.slice(randomIndex + 1));
        }
        return arr;
      case 1:
        const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
        return [...arr.slice(0, randomIndex), randomChar, ...arr.slice(randomIndex)];
      case 2:
        if (randomIndex < arr.length - 1) {
          [arr[randomIndex], arr[randomIndex + 1]] = [arr[randomIndex + 1], arr[randomIndex]];
        }
        return arr;
      default:
        return arr;
    }
  }

