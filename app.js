const express = require('express');
const { Client } = require('pg');
const bodyParser = require("body-parser");
require("dotenv/config");
const app = express();
var PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//-----------------------------------------------------------------------
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});
  
client.connect( () =>{
    console.log('Connected');
});

//-----------------------------------------------------------------------
// Transaction
app.get('/transaction', (req, res)=>{
    client.query('SELECT * FROM salesforce.transaction__c', (err, data)=>{
      if (err) {
        console.log(err);
        res.status(400).send(err);
      } else {
        res.json(data.rows);
      }
    });
});

app.get('/transaction/:id', (req, res)=>{
    client.query('SELECT * FROM salesforce.transaction__c WHERE id = $1', [req.params.id], (err, data)=>{
      if (err) {
        console.log(err);
        res.status(400).send(err);
      } else {
        res.json(data.rows[0]);
      }
    });
});

app.post('/transaction', (req, response) => {
  let transaction_appid__c = Math.floor(Math.random() * (999999 - 1 + 1) + 1);
    client.query("INSERT INTO " + 
      "salesforce.transaction__c(Name, OrderID__c, ReasonCodeDesc__c, ReasonCode__c, ResponseCode__c, transaction_appid__c)" +
      "VALUES($1, $2, $3, $4, $5, $6) RETURNING *", 
      
      [req.body.OrderID, req.body.OrderID, req.body.ReasonCodeDesc, req.body.ReasonCode, req.body.ResponseCode, transaction_appid__c], 
      
      (err, data) => {
        if (err) {
          console.log(err);
          response.status(400).send(err);
        } else {
          console.log(data.rows[0].reasoncodedesc__c);
          response.redirect('https://delcampo.force.com/s/bills?id=' + data.rows[0].reasoncodedesc__c + "&id2=" + data.rows[0].reasoncode__c);
        }
    });
  });

//-----------------------------------------------------------------------
app.listen(PORT, () => {
    console.log("Listening on PORT:", PORT);
  });