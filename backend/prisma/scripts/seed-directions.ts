import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // IDs de tenant existentes
  const tenant1Id = 1; // Substitua pelo ID real do tenant

  const directions = [
    { rangeInicio: "01000000", rangeFim: "01259999", valorDirecao: "1", regiao: "Zona Central", tenantId: tenant1Id },
    { rangeInicio: "01300000", rangeFim: "01399999", valorDirecao: "1", regiao: "Zona Central", tenantId: tenant1Id },
    { rangeInicio: "01400000", rangeFim: "01499999", valorDirecao: "1", regiao: "Zona Central", tenantId: tenant1Id },
    { rangeInicio: "01500000", rangeFim: "01599999", valorDirecao: "1", regiao: "Zona Central", tenantId: tenant1Id },
    { rangeInicio: "02000000", rangeFim: "02999999", valorDirecao: "2", regiao: "Zona Norte", tenantId: tenant1Id },
    { rangeInicio: "03000000", rangeFim: "03999999", valorDirecao: "3", regiao: "Zona Leste", tenantId: tenant1Id },
    { rangeInicio: "04000000", rangeFim: "04999999", valorDirecao: "4", regiao: "Zona Sul", tenantId: tenant1Id },
    { rangeInicio: "05000000", rangeFim: "05599999", valorDirecao: "5", regiao: "Zona Oeste", tenantId: tenant1Id },
    { rangeInicio: "06000000", rangeFim: "06299999", valorDirecao: "25", regiao: "Extremo Oeste", tenantId: tenant1Id },
    { rangeInicio: "06300000", rangeFim: "06399999", valorDirecao: "25", regiao: "Extremo Oeste", tenantId: tenant1Id },
    { rangeInicio: "06400000", rangeFim: "06499999", valorDirecao: "25", regiao: "Extremo Oeste", tenantId: tenant1Id },
    { rangeInicio: "06600000", rangeFim: "06649999", valorDirecao: "25", regiao: "Extremo Oeste", tenantId: tenant1Id },
    { rangeInicio: "06650000", rangeFim: "06699999", valorDirecao: "25", regiao: "Extremo Oeste", tenantId: tenant1Id },
    { rangeInicio: "06700000", rangeFim: "06729999", valorDirecao: "25", regiao: "Extremo Oeste", tenantId: tenant1Id },
    { rangeInicio: "06750000", rangeFim: "06779999", valorDirecao: "25", regiao: "Extremo Oeste", tenantId: tenant1Id },
    { rangeInicio: "06800000", rangeFim: "06849999", valorDirecao: "25", regiao: "Extremo Oeste", tenantId: tenant1Id },
    { rangeInicio: "07800000", rangeFim: "07809999", valorDirecao: "26", regiao: "Extremo Norte", tenantId: tenant1Id },
    { rangeInicio: "07700000", rangeFim: "07729999", valorDirecao: "26", regiao: "Extremo Norte", tenantId: tenant1Id },
    { rangeInicio: "07000000", rangeFim: "07299999", valorDirecao: "27", regiao: "Extremo Leste", tenantId: tenant1Id },
    { rangeInicio: "08700000", rangeFim: "08799999", valorDirecao: "27", regiao: "Extremo Leste", tenantId: tenant1Id },
    { rangeInicio: "08600000", rangeFim: "08699999", valorDirecao: "27", regiao: "Extremo Leste", tenantId: tenant1Id },
    { rangeInicio: "08570000", rangeFim: "08599999", valorDirecao: "27", regiao: "Extremo Leste", tenantId: tenant1Id },
    { rangeInicio: "08500000", rangeFim: "08529999", valorDirecao: "27", regiao: "Extremo Leste", tenantId: tenant1Id },
    { rangeInicio: "08550000", rangeFim: "08569999", valorDirecao: "27", regiao: "Extremo Leste", tenantId: tenant1Id },
    { rangeInicio: "09000000", rangeFim: "09299999", valorDirecao: "28", regiao: "ABC Paulista", tenantId: tenant1Id },
    { rangeInicio: "09600000", rangeFim: "09899999", valorDirecao: "28", regiao: "ABC Paulista", tenantId: tenant1Id },
    { rangeInicio: "09900000", rangeFim: "09999999", valorDirecao: "28", regiao: "ABC Paulista", tenantId: tenant1Id },
    { rangeInicio: "09500000", rangeFim: "09599999", valorDirecao: "28", regiao: "ABC Paulista", tenantId: tenant1Id },
    { rangeInicio: "11250000", rangeFim: "11279999", valorDirecao: "29", regiao: "Litoral Norte", tenantId: tenant1Id },
    { rangeInicio: "11600000", rangeFim: "11629999", valorDirecao: "29", regiao: "Litoral Norte", tenantId: tenant1Id },
    { rangeInicio: "11630000", rangeFim: "11639999", valorDirecao: "29", regiao: "Litoral Norte", tenantId: tenant1Id },
    { rangeInicio: "11660000", rangeFim: "11679999", valorDirecao: "29", regiao: "Litoral Norte", tenantId: tenant1Id },
    { rangeInicio: "11680000", rangeFim: "11699999", valorDirecao: "29", regiao: "Litoral Norte", tenantId: tenant1Id },
    { rangeInicio: "11000000", rangeFim: "11099999", valorDirecao: "30", regiao: "Litoral Sul", tenantId: tenant1Id },
    { rangeInicio: "11300000", rangeFim: "11399999", valorDirecao: "30", regiao: "Litoral Sul", tenantId: tenant1Id },
    { rangeInicio: "11700000", rangeFim: "11729999", valorDirecao: "30", regiao: "Litoral Sul", tenantId: tenant1Id },
    { rangeInicio: "11730000", rangeFim: "11739999", valorDirecao: "30", regiao: "Litoral Sul", tenantId: tenant1Id },
    { rangeInicio: "11740000", rangeFim: "11749999", valorDirecao: "30", regiao: "Litoral Sul", tenantId: tenant1Id },
    { rangeInicio: "11750000", rangeFim: "11759999", valorDirecao: "30", regiao: "Litoral Sul", tenantId: tenant1Id },
    { rangeInicio: "11400000", rangeFim: "11499999", valorDirecao: "30", regiao: "Litoral Sul", tenantId: tenant1Id },
    { rangeInicio: "12200000", rangeFim: "12349999", valorDirecao: "31", regiao: "Vale do Paraíba", tenantId: tenant1Id },
    { rangeInicio: "12000000", rangeFim: "12149999", valorDirecao: "31", regiao: "Vale do Paraíba", tenantId: tenant1Id },
    { rangeInicio: "12500000", rangeFim: "12519999", valorDirecao: "31", regiao: "Vale do Paraíba", tenantId: tenant1Id },
    { rangeInicio: "12400000", rangeFim: "12449999", valorDirecao: "31", regiao: "Vale do Paraíba", tenantId: tenant1Id },
    { rangeInicio: "13000000", rangeFim: "13149999", valorDirecao: "32", regiao: "Região de Campinas", tenantId: tenant1Id },
    { rangeInicio: "13200000", rangeFim: "13219999", valorDirecao: "32", regiao: "Região de Campinas", tenantId: tenant1Id },
    { rangeInicio: "13330000", rangeFim: "13349999", valorDirecao: "32", regiao: "Região de Campinas", tenantId: tenant1Id },
    { rangeInicio: "13300000", rangeFim: "13319999", valorDirecao: "32", regiao: "Região de Campinas", tenantId: tenant1Id },
    { rangeInicio: "13465000", rangeFim: "13479999", valorDirecao: "32", regiao: "Região de Campinas", tenantId: tenant1Id },
    { rangeInicio: "13480000", rangeFim: "13489999", valorDirecao: "32", regiao: "Região de Campinas", tenantId: tenant1Id },
    { rangeInicio: "13400000", rangeFim: "13449999", valorDirecao: "32", regiao: "Região de Campinas", tenantId: tenant1Id },
    { rangeInicio: "18000000", rangeFim: "18119999", valorDirecao: "33", regiao: "Região de Sorocaba", tenantId: tenant1Id },
    { rangeInicio: "18200000", rangeFim: "18219999", valorDirecao: "33", regiao: "Região de Sorocaba", tenantId: tenant1Id },
    { rangeInicio: "14000000", rangeFim: "14119999", valorDirecao: "34", regiao: "Região de Ribeirão Preto", tenantId: tenant1Id },
    { rangeInicio: "14400000", rangeFim: "14419999", valorDirecao: "34", regiao: "Região de Ribeirão Preto", tenantId: tenant1Id },
    { rangeInicio: "17000000", rangeFim: "17119999", valorDirecao: "35", regiao: "Região de Bauru", tenantId: tenant1Id },
    { rangeInicio: "17500000", rangeFim: "17529999", valorDirecao: "35", regiao: "Região de Bauru", tenantId: tenant1Id },
    { rangeInicio: "15000000", rangeFim: "15099999", valorDirecao: "36", regiao: "Região de São José do Rio Preto", tenantId: tenant1Id },
    { rangeInicio: "14780000", rangeFim: "14789999", valorDirecao: "36", regiao: "Região de São José do Rio Preto", tenantId: tenant1Id },
    { rangeInicio: "16000000", rangeFim: "16099999", valorDirecao: "37", regiao: "Outras Regiões do Interior", tenantId: tenant1Id },
    { rangeInicio: "19000000", rangeFim: "19119999", valorDirecao: "37", regiao: "Outras Regiões do Interior", tenantId: tenant1Id },
    { rangeInicio: "13500000", rangeFim: "13509999", valorDirecao: "37", regiao: "Outras Regiões do Interior", tenantId: tenant1Id },
    { rangeInicio: "13560000", rangeFim: "13569999", valorDirecao: "37", regiao: "Outras Regiões do Interior", tenantId: tenant1Id },
    { rangeInicio: "69900000", rangeFim: "69999999", valorDirecao: "38", regiao: "Região Norte", tenantId: tenant1Id },
    { rangeInicio: "68900000", rangeFim: "68999999", valorDirecao: "38", regiao: "Região Norte", tenantId: tenant1Id },
    { rangeInicio: "69000000", rangeFim: "69299999", valorDirecao: "38", regiao: "Região Norte", tenantId: tenant1Id },
    { rangeInicio: "69400000", rangeFim: "69899999", valorDirecao: "38", regiao: "Região Norte", tenantId: tenant1Id },
    { rangeInicio: "66000000", rangeFim: "68899999", valorDirecao: "38", regiao: "Região Norte", tenantId: tenant1Id },
    { rangeInicio: "76800000", rangeFim: "76999999", valorDirecao: "38", regiao: "Região Norte", tenantId: tenant1Id },
    { rangeInicio: "69300000", rangeFim: "69399999", valorDirecao: "38", regiao: "Região Norte", tenantId: tenant1Id },
    { rangeInicio: "77000000", rangeFim: "77999999", valorDirecao: "38", regiao: "Região Norte", tenantId: tenant1Id },
    { rangeInicio: "57000000", rangeFim: "57999999", valorDirecao: "39", regiao: "Região Nordeste", tenantId: tenant1Id },
    { rangeInicio: "40000000", rangeFim: "48999999", valorDirecao: "39", regiao: "Região Nordeste", tenantId: tenant1Id },
    { rangeInicio: "60000000", rangeFim: "63999999", valorDirecao: "39", regiao: "Região Nordeste", tenantId: tenant1Id },
    { rangeInicio: "65000000", rangeFim: "65999999", valorDirecao: "39", regiao: "Região Nordeste", tenantId: tenant1Id },
    { rangeInicio: "58000000", rangeFim: "58999999", valorDirecao: "39", regiao: "Região Nordeste", tenantId: tenant1Id },
    { rangeInicio: "50000000", rangeFim: "56999999", valorDirecao: "39", regiao: "Região Nordeste", tenantId: tenant1Id },
    { rangeInicio: "64000000", rangeFim: "64999999", valorDirecao: "39", regiao: "Região Nordeste", tenantId: tenant1Id },
    { rangeInicio: "59000000", rangeFim: "59999999", valorDirecao: "39", regiao: "Região Nordeste", tenantId: tenant1Id },
    { rangeInicio: "49000000", rangeFim: "49999999", valorDirecao: "39", regiao: "Região Nordeste", tenantId: tenant1Id },
    { rangeInicio: "70000000", rangeFim: "72799999", valorDirecao: "40", regiao: "Região Centro-Oeste", tenantId: tenant1Id },
    { rangeInicio: "73000000", rangeFim: "73699999", valorDirecao: "40", regiao: "Região Centro-Oeste", tenantId: tenant1Id },
    { rangeInicio: "72800000", rangeFim: "72999999", valorDirecao: "40", regiao: "Região Centro-Oeste", tenantId: tenant1Id },
    { rangeInicio: "73700000", rangeFim: "76799999", valorDirecao: "40", regiao: "Região Centro-Oeste", tenantId: tenant1Id },
    { rangeInicio: "78000000", rangeFim: "78899999", valorDirecao: "40", regiao: "Região Centro-Oeste", tenantId: tenant1Id },
    { rangeInicio: "79000000", rangeFim: "79999999", valorDirecao: "40", regiao: "Região Centro-Oeste", tenantId: tenant1Id },
    { rangeInicio: "29000000", rangeFim: "29999999", valorDirecao: "41", regiao: "Região Sudeste", tenantId: tenant1Id },
    { rangeInicio: "30000000", rangeFim: "39999999", valorDirecao: "41", regiao: "Região Sudeste", tenantId: tenant1Id },
    { rangeInicio: "20000000", rangeFim: "28999999", valorDirecao: "41", regiao: "Região Sudeste", tenantId: tenant1Id },
    { rangeInicio: "80000000", rangeFim: "87999999", valorDirecao: "42", regiao: "Região Sul", tenantId: tenant1Id },
    { rangeInicio: "90000000", rangeFim: "99999999", valorDirecao: "42", regiao: "Região Sul", tenantId: tenant1Id },
    { rangeInicio: "88000000", rangeFim: "89999999", valorDirecao: "42", regiao: "Região Sul", tenantId: tenant1Id },
  ];

  for (const direction of directions) {
    await prisma.directions.create({ data: direction });
  }

  console.log('Directions have been created.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
