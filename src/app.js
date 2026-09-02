const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

const customers = [
  {
    id: 5,
    first_name: 'Dodol',
    last_name: 'Dargombez'
  },
  {
    id: 6,
    first_name: 'Nyongot',
    last_name: 'Gonzales'
  }
];

const clients = [
  {
    id: 1,
    first_name: 'Haha',
    last_name: 'Hehe'
  },
  {
    id: 2,
    first_name: 'Lala',
    last_name: 'Lili'
  }
];

app.use(helmet());
app.use(express.json());
app.use(morgan('combined'));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'nodejs-api-kong-modern'
  });
});

app.get('/api/v1/customers', (req, res) => {
  res.json(customers);
});

app.get('/api/v1/customers/:id', (req, res) => {
  const customer = customers.find((item) => item.id === Number(req.params.id));

  if (!customer) {
    return res.status(404).json({
      message: 'Customer not found'
    });
  }

  return res.json(customer);
});

app.get('/api/v1/clients', (req, res) => {
  res.json(clients);
});

app.get('/api/v1/clients/:id', (req, res) => {
  const client = clients.find((item) => item.id === Number(req.params.id));

  if (!client) {
    return res.status(404).json({
      message: 'Client not found'
    });
  }

  return res.json(client);
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

module.exports = app;
