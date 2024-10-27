const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const sequelize = new Sequelize('neon_db', 'neon_db_owner', 'WcYmerMgEt85', {
  host: 'ep-wild-haze-a8o04mr2.eastus2.azure.neon.tech',
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Use this only if you're having issues with self-signed certificates
    }
  } // or 'mysql', 'sqlite', etc.
});

// User model
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Product model
const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

// Sync database
sequelize.sync();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, 'nodejs-react-ecommerce', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user.id }, 'nodejs-react-ecommerce', { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error during login' });
  }
});

// User APIs
// Product APIs
app.get('/users', authenticateToken, async (req, res) => {
  try {
    console.log(req,"req")
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving users' });
  }
});

app.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: ['id', 'username'] });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user' });
  }
});

app.put('/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const user = await User.findByPk(id);
    if (user) {
      await user.update({ username });
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' });
  }
});

// Product APIs
app.get('/products',authenticateToken, async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving products' });
  }
});

app.get('/products/:id',authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByPk(id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving product' });
  }
});

app.post('/products', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const product = await Product.create({ name, description, price, stock });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error creating product' });
  }
});

app.put('/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    const product = await Product.findByPk(id);
    if (product) {
      await product.update({ name, description, price, stock });
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating product' });
  }
});

app.delete('/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (product) {
      await product.destroy();
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product' });
  }
});


app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
