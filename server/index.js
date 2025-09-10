const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'db.json');

// Initialize database
async function initDB() {
  try {
    await fs.access(DB_PATH);
  } catch (error) {
    const initialData = {
      users: [
        {
          id: '1',
          email: 'rep@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'John Rep',
          role: 'rep'
        },
        {
          id: '2',
          email: 'manager@example.com',
          password: await bcrypt.hash('password123', 10),
          name: 'Jane Manager',
          role: 'manager'
        }
      ],
      leads: [
        {
          id: '1',
          name: 'Acme Corporation',
          email: 'contact@acme.com',
          phone: '+1-555-0123',
          company: 'Acme Corporation',
          status: 'new',
          assignedTo: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Tech Solutions Inc',
          email: 'info@techsolutions.com',
          phone: '+1-555-0456',
          company: 'Tech Solutions Inc',
          status: 'contacted',
          assignedTo: '1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      opportunities: [
        {
          id: '1',
          name: 'Acme Software License',
          company: 'Acme Corporation',
          value: 50000,
          stage: 'proposal',
          probability: 75,
          expectedCloseDate: '2024-03-15',
          assignedTo: '1',
          leadId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };
    await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
  }
}

// Database operations
async function readDB() {
  const data = await fs.readFile(DB_PATH, 'utf8');
  return JSON.parse(data);
}

async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await readDB();
    
    const user = db.users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role = 'rep' } = req.body;
    const db = await readDB();
    
    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      name,
      role
    };

    db.users.push(newUser);
    await writeDB(db);

    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email, 
        name: newUser.name, 
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Leads routes
app.get('/api/leads', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    let leads = db.leads;
    
    if (req.user.role === 'rep') {
      leads = leads.filter(lead => lead.assignedTo === req.user.id);
    }
    
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/leads', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, company, status = 'new' } = req.body;
    const db = await readDB();
    
    const newLead = {
      id: uuidv4(),
      name,
      email,
      phone,
      company,
      status,
      assignedTo: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.leads.push(newLead);
    await writeDB(db);
    
    res.status(201).json(newLead);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/leads/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, status } = req.body;
    const db = await readDB();
    
    const leadIndex = db.leads.findIndex(lead => lead.id === id);
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    const lead = db.leads[leadIndex];
    if (req.user.role === 'rep' && lead.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    db.leads[leadIndex] = {
      ...lead,
      name: name || lead.name,
      email: email || lead.email,
      phone: phone || lead.phone,
      company: company || lead.company,
      status: status || lead.status,
      updatedAt: new Date().toISOString()
    };
    
    await writeDB(db);
    res.json(db.leads[leadIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/leads/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDB();
    
    const leadIndex = db.leads.findIndex(lead => lead.id === id);
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    const lead = db.leads[leadIndex];
    if (req.user.role === 'rep' && lead.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    db.leads.splice(leadIndex, 1);
    await writeDB(db);
    
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Convert lead to opportunity
app.post('/api/leads/:id/convert', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { opportunityName, value, expectedCloseDate } = req.body;
    const db = await readDB();
    
    const leadIndex = db.leads.findIndex(lead => lead.id === id);
    if (leadIndex === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    const lead = db.leads[leadIndex];
    if (req.user.role === 'rep' && lead.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Update lead status
    db.leads[leadIndex].status = 'qualified';
    db.leads[leadIndex].updatedAt = new Date().toISOString();
    
    // Create opportunity
    const newOpportunity = {
      id: uuidv4(),
      name: opportunityName || `${lead.name} - Opportunity`,
      company: lead.company,
      value: value || 0,
      stage: 'discovery',
      probability: 25,
      expectedCloseDate: expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedTo: req.user.id,
      leadId: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.opportunities.push(newOpportunity);
    await writeDB(db);
    
    res.status(201).json(newOpportunity);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Opportunities routes
app.get('/api/opportunities', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    let opportunities = db.opportunities;
    
    if (req.user.role === 'rep') {
      opportunities = opportunities.filter(opp => opp.assignedTo === req.user.id);
    }
    
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/opportunities', authenticateToken, async (req, res) => {
  try {
    const { name, company, value, stage = 'discovery', probability = 25, expectedCloseDate } = req.body;
    const db = await readDB();
    
    const newOpportunity = {
      id: uuidv4(),
      name,
      company,
      value: parseFloat(value) || 0,
      stage,
      probability: parseInt(probability) || 25,
      expectedCloseDate: expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedTo: req.user.id,
      leadId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.opportunities.push(newOpportunity);
    await writeDB(db);
    
    res.status(201).json(newOpportunity);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/opportunities/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company, value, stage, probability, expectedCloseDate } = req.body;
    const db = await readDB();
    
    const oppIndex = db.opportunities.findIndex(opp => opp.id === id);
    if (oppIndex === -1) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    const opportunity = db.opportunities[oppIndex];
    if (req.user.role === 'rep' && opportunity.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    db.opportunities[oppIndex] = {
      ...opportunity,
      name: name || opportunity.name,
      company: company || opportunity.company,
      value: value !== undefined ? parseFloat(value) : opportunity.value,
      stage: stage || opportunity.stage,
      probability: probability !== undefined ? parseInt(probability) : opportunity.probability,
      expectedCloseDate: expectedCloseDate || opportunity.expectedCloseDate,
      updatedAt: new Date().toISOString()
    };
    
    await writeDB(db);
    res.json(db.opportunities[oppIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/opportunities/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await readDB();
    
    const oppIndex = db.opportunities.findIndex(opp => opp.id === id);
    if (oppIndex === -1) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    
    const opportunity = db.opportunities[oppIndex];
    if (req.user.role === 'rep' && opportunity.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    db.opportunities.splice(oppIndex, 1);
    await writeDB(db);
    
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const db = await readDB();
    let leads = db.leads;
    let opportunities = db.opportunities;
    
    if (req.user.role === 'rep') {
      leads = leads.filter(lead => lead.assignedTo === req.user.id);
      opportunities = opportunities.filter(opp => opp.assignedTo === req.user.id);
    }
    
    const leadsByStatus = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});
    
    const opportunitiesByStage = opportunities.reduce((acc, opp) => {
      acc[opp.stage] = (acc[opp.stage] || 0) + 1;
      return acc;
    }, {});
    
    const totalOpportunityValue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
    
    res.json({
      totalLeads: leads.length,
      totalOpportunities: opportunities.length,
      totalOpportunityValue,
      leadsByStatus,
      opportunitiesByStage
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Initialize database and start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});