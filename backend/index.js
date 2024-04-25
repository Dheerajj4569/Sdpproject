// Require necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult, check } = require('express-validator');
const stripe = require('stripe')('your_stripe_secret_key');

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb+srv://dheeraj4569:Hari@4569@cluster0.9hdmktt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define MongoDB Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', userSchema);

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Middleware for user authentication
const authenticateUser = (req, res, next) => {
  // Check for token in headers
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Authorization token not provided' });
  }

  // Verify token
  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded.user;
    next();
  });
};

// User Registration endpoint
app.post('/register', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, 'secret_key', { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// User Login endpoint
app.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, 'secret_key', { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Sample Product Management endpoint
app.post('/products', authenticateUser, (req, res) => {
  // Implement product creation logic here
  res.json({ message: 'Product created successfully' });
});

// Sample Order Processing endpoint
app.post('/orders', authenticateUser, (req, res) => {
  // Implement order processing logic here
  res.json({ message: 'Order placed successfully' });
});

// Payment endpoint using Stripe
app.post('/payment', authenticateUser, async (req, res) => {
  const token = req.body.token;
  const amount = req.body.amount;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      payment_method_types: ['card'],
      description: 'Payment for E-commerce purchase',
      confirm: true,
      payment_method: token,
    });

    res.json({ message: 'Payment successful', paymentIntent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Payment failed' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
