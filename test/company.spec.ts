import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';

describe('API Empresa', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://api-desafio-qa.onrender.com';
  let companyId = '';
  let companyAleatoriaId = '';
  let nomeEmpresa = '';
  let produtoId = '';
  let nomeProduto = '';

  console.log(`${baseUrl}/company`)

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  
  describe('Verificar Requisição Company', () => {

    //Testar número 1
    it('Deve 1 empresa com os dados fornecidos', async () => {
      const response = await p
        .spec()
        .post(`${baseUrl}/company`)
        .withJson({
            name: faker.string.numeric(15),
            cnpj: "12345678912345",
            state: "EUA",
            city: "Cocal do Sul",
            address: "Rua legal",
            sector: "AAAA"
        })
        .expectStatus(StatusCodes.CREATED);
      
      companyId = response.body.id; 
      console.log(`ID da Empresa: ${companyId}`);
    });

    //Testar número 2
    it('Deve retornar todas as empresas cadastradas', async () => {
      const response = await p
        .spec()
        .get(`${baseUrl}/company`)
        .expectStatus(StatusCodes.OK);
      
      companyAleatoriaId = response.body[0].id; 
      console.log(`Retorna o ID da primeira empresa cadastrada: ${companyAleatoriaId}`);
    });

    //Testar número 3
    it('Deve atualizar a empresa cadastrada pelo teste 1', async () => {
      const response = await p
        .spec()
        .put(`${baseUrl}/company/${companyId}`)
        .withJson({
            name: faker.animal.dog()
        })
        .expectStatus(StatusCodes.OK);
    });

    //Testar número 4
    it('Pequisar por empresa cadastrada e atualizada', async () => {
      const response = await p
        .spec()
        .get(`${baseUrl}/company/${companyId}`)
        .expectStatus(StatusCodes.OK);

       nomeEmpresa = response.body.name; 
       console.log(`Nome da empresa atualizada: ${nomeEmpresa}`);
    });

    //Testar número 5
    it('Deletar empresa cadastrada', async () => {
      const response = await p
        .spec()
        .delete(`${baseUrl}/company/${companyId}`)
        .expectStatus(StatusCodes.OK);

      const response2 = await p
        .spec()
        .get(`${baseUrl}/company/${companyId}`)
        .expectStatus(StatusCodes.NOT_FOUND);

      console.log(response2.body.message);

    });

    //Testar número 6
    it('Cria nova empresa e insere um produto na empresa e retorna ele', async () => {
      const response0 = await p
        .spec()
        .post(`${baseUrl}/company`)
        .withJson({
            name: faker.string.numeric(15),
            cnpj: "12345678912345",
            state: "EUA",
            city: "Cocal do Sul",
            address: "Rua legal",
            sector: "AAAA"
        })
        .expectStatus(StatusCodes.CREATED);

        companyId = response0.body.id; 
        console.log(companyId);

      const response = await p
        .spec()
        .post(`${baseUrl}/company/${companyId}/products`)
        .withJson({
          productName: faker.commerce.productName(),
          productDescription: faker.commerce.productDescription(),
          price: 500
      })
        .expectStatus(StatusCodes.CREATED);
      
      produtoId = response.body.product.productId;
      console.log(`Nome do produto cadastrado: ${response.body.productName}`);

    });

    //Testar número 7
    it('Retorna o produto cadastrado e atualiza o nome dele', async () => {
      
      const response2 = await p
        .spec()
        .post(`${baseUrl}/company`)
        .withJson({
            name: faker.string.numeric(15),
            cnpj: "12345678912345",
            state: "EUA",
            city: "Cocal do Sul",
            address: "Rua legal",
            sector: "AAAA"
        })
        .expectStatus(StatusCodes.CREATED);

        companyId = response2.body.id; 
        console.log(companyId);

       const responseProduto = await p
        .spec()
        .post(`${baseUrl}/company/${companyId}/products`)
        .withJson({
          productName: faker.commerce.productName(),
          productDescription: faker.commerce.productDescription(),
          price: 500
      })
        .expectStatus(StatusCodes.CREATED);

        produtoId = responseProduto.body.product.productId; 

      const response0 = await p
        .spec()
        .get(`${baseUrl}/company/${companyId}/products/${produtoId}`)
        .expectStatus(StatusCodes.OK);

       nomeProduto = response0.body.productName; 
       console.log(`Nome atual do produto: ${nomeEmpresa}`);


      const response = await p
        .spec()
        .put(`${baseUrl}/company/${companyId}/products/${produtoId}`)
        .withJson({
          productName: faker.commerce.productName()
      })
        .expectStatus(StatusCodes.OK);

      console.log(`Nome novo da produto cadastrado: ${response.body.product.productName}`);

    });

    //Testar número 8
    it('Deve retornar um erro 400 por não informar um estado', async () => {
      const response = await p
        .spec()
        .post(`${baseUrl}/company`)
        .withJson({
            name: faker.string.numeric(15),
            cnpj: "12345678912345",
            city: "Cocal do Sul",
            address: "Rua legal",
            sector: "AAAA"
        })
        .expectStatus(StatusCodes.BAD_REQUEST);
      
      console.log(`Erro ao cadastrar`);
    });

    //Testar número 9
    it('Deve retornar um erro 404 por informar um cnpj invalido', async () => {
      const response = await p
        .spec()
        .post(`${baseUrl}/company`)
        .withJson({
            name: faker.string.numeric(15),
            cnpj: "34543545645657568768",
            state: "dsfgdfgdfg",
            city: "Cocal do Sul",
            address: "Rua legal",
            sector: "AAAA"
        })
        .expectStatus(StatusCodes.BAD_REQUEST);
      
      console.log(`Erro ao cadastrar CNPJ inválido`);
    });

    //Testar número 10
    it('Deve atualizar uma empresa que não existe e retornar erro', async () => {
      const response = await p
        .spec()
        .put(`${baseUrl}/company/9999999999999`)
        .withJson({
            name: faker.animal.dog()
        })
        .expectStatus(StatusCodes.NOT_FOUND);
    });

    //Testar número 11
    it('Deve apagar uma empresa informando texto como texto', async () => {
      const response = await p
        .spec()
        .delete(`${baseUrl}/company/rwterg`)
        .expectStatus(StatusCodes.BAD_REQUEST);
    });

    //Testar número 12
    it('Cria nova empresa e gerar erro ao cadastrar um item por parametro invalido', async () => {
      const response0 = await p
        .spec()
        .post(`${baseUrl}/company`)
        .withJson({
            name: faker.string.numeric(15),
            cnpj: "12345678912345",
            state: "EUA",
            city: "Cocal do Sul",
            address: "Rua legal",
            sector: "AAAA"
        })
        .expectStatus(StatusCodes.CREATED);

        companyId = response0.body.id; 
        console.log(companyId);

      const response = await p
        .spec()
        .post(`${baseUrl}/company/${companyId}/products`)
        .withJson({
          fgdfgdfgfg: faker.commerce.productName(),
          productDescription: faker.commerce.productDescription(),
          price: 500
      })
        .expectStatus(StatusCodes.BAD_REQUEST);
      

    });

    //Testar número 13
    it('Cria nova empresa e gerar erro ao cadastrar um item por código de empresa inválido', async () => {
      const response0 = await p
        .spec()
        .post(`${baseUrl}/company`)
        .withJson({
            name: faker.string.numeric(15),
            cnpj: "12345678912345",
            state: "EUA",
            city: "Cocal do Sul",
            address: "Rua legal",
            sector: "AAAA"
        })
        .expectStatus(StatusCodes.CREATED);

        companyId = response0.body.id; 
        console.log(companyId);

      const response = await p
        .spec()
        .post(`${baseUrl}/company/6846546848/products`)
        .withJson({
          productName: faker.commerce.productName(),
          productDescription: faker.commerce.productDescription(),
          price: 500
      })
        .expectStatus(StatusCodes.NOT_FOUND);
      

    });

    //Testar número 14
    it('Cria nova empresa e gerar erro ao apagar um item que não existe', async () => {
      const response0 = await p
        .spec()
        .post(`${baseUrl}/company`)
        .withJson({
            name: faker.string.numeric(15),
            cnpj: "12345678912345",
            state: "EUA",
            city: "Cocal do Sul",
            address: "Rua legal",
            sector: "AAAA"
        })
        .expectStatus(StatusCodes.CREATED);

        companyId = response0.body.id; 
        console.log(companyId);

      const response = await p
        .spec()
        .delete(`${baseUrl}/company/${companyId}/products/4545454`)
        .expectStatus(StatusCodes.NOT_FOUND);
      

    });

    //Testar número 15
    it('Cria nova empresa e gerar erro ao apagar um item com digito texto', async () => {
      const response0 = await p
        .spec()
        .post(`${baseUrl}/company`)
        .withJson({
            name: faker.string.numeric(15),
            cnpj: "12345678912345",
            state: "EUA",
            city: "Cocal do Sul",
            address: "Rua legal",
            sector: "AAAA"
        })
        .expectStatus(StatusCodes.CREATED);

        companyId = response0.body.id; 
        console.log(companyId);

      const response = await p
        .spec()
        .delete(`${baseUrl}/company/${companyId}/products/dfghdfghfghfghjfghj`)
        .expectStatus(StatusCodes.BAD_REQUEST);
      

    });

  });
});