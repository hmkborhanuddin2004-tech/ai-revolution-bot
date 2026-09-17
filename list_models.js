const { config } = require('./src/config.js');
fetch(\https://generativelanguage.googleapis.com/v1beta/models?key=\\)
  .then(res => res.json())
  .then(data => {
     if(data.models) {
         console.log(data.models.map(m => m.name).join(', '));
     } else {
         console.log(data);
     }
  });
