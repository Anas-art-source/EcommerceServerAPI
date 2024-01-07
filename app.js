const express = require('express');
const amazonScraper = require('amazon-buddy');
const sqlite3 = require('sqlite3')

const app = express();
const port = 3000; // choose a port

const db = new sqlite3.Database('/home/khudi/Desktop/db_user.db', sqlite3.SQLITE_OPEN_READWRITE | sqlite3.OPEN_READWRITE, (err) => {
  if (err) return console.log(err, "ee")
});

async function fetchData(customerID) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM user_table where customerId = ?', [customerID], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

app.get('/customerDetail/:customerID', async (req, res) => {
  const { customerID } = req.params;

  try {
    const rows =  await fetchData(customerID);
    console.log(rows, 'rrr'); // Log the actual query results
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error querying database');
  }
});

// Define your API endpoint
app.get('/search/:keyword', async (req, res) => {
  const { keyword } = req.params;

  try {
    // Call the amazon-product-api library
    console.log(keyword)
    let products = await amazonScraper.products({ keyword: keyword, number: 50 });

    products = products['result']
    const productResponse = [];

    // Loop over the list of objects and extract the 'title' property
    for (const obj of products) {
        if (obj.title) {
        productResponse.push({
            'title': obj.title,
            'price': obj.price,
            'asin': obj.asin,
            'url': obj.url
        })
    }
    }
    // Return the results from your API
    res.json(productResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Define your API endpoint
app.get('/search-rating/:keyword/:minRating/:maxRating', async (req, res) => {
    const { keyword, minRating, maxRating } = req.params;
  
    try {
      // Call the amazon-product-api library
      console.log(keyword)
      let products = await amazonScraper.products({ keyword: keyword, number: 50, minRating:minRating, maxRating: maxRating });
  
      products = products['result']
      const productResponse = [];
  
      // Loop over the list of objects and extract the 'title' property
      for (const obj of products) {
          if (obj.title) {
          productResponse.push({
              'title': obj.title,
              'price': obj.price,
              'asin': obj.asin,
              'url': obj.url
          })
      }
      }
      // Return the results from your API
      res.json(productResponse);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
