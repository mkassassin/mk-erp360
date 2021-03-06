var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var path = require('path');

var ErrorManagement = require('./server/handling/ErrorHandling.js');
var LogManagement = require('./server/handling/LogHandling.js');
var AdminModel = require('./server/web/models/Admin/AdminManagement.model.js');

var port = process.env.PORT || 3000;
var app = express();


// Process On Every Error
   process.setMaxListeners(0);
   process.on('unhandledRejection', (reason, promise) => {
      ErrorManagement.ErrorHandling.ErrorLogCreation('', '', '', reason);
      console.log(reason);
      console.error("'Un Handled Rejection' Error Log File - " + new Date().toLocaleDateString());
   });
   process.on('uncaughtException', function (err) {
     console.log(err);
     
      ErrorManagement.ErrorHandling.ErrorLogCreation('', '', '', err.toString());
      console.error(" 'Un Caught Exception' Error Log File - " + new Date().toLocaleDateString());
   });


// DB Connection

  mongoose.connect('mongodb://kathiraashi:kathir143@ds121871.mlab.com:21871/insight-360');
   mongoose.connection.on('error', function(err) {
      ErrorManagement.ErrorHandling.ErrorLogCreation('', 'Mongodb Connection Error', 'Server.js', err);
   });
   mongoose.connection.once('open', function() {
      console.log('DB Connectivity, Success!');
   });


app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Every request Log Creation
// app.use('/API/', function (req, res, next) {
//    if (req.body.Info !== '' && req.body.Info){
//       LogManagement.LogHandling.LogCreation(req);
//       return next();
//    }else {
//       ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Security Error For Every Request Log Creation', 'Server.js');
//       return res.status(406).send({Status: false, Message: 'Invalid Arguments'});
//    }
// });

 require('./server/web/routes/Admin/RegisterAndLogin.routes.js')(app); // Without Company Id, User Id and Authorization

   function AuthorizationValidate(AuthorizationKey, callback) {
      var date = new Date(new Date() - 20 * 60 * 1000); // 20 minutes differ
      AdminModel.User_Management.findOne({ 
         '_id': mongoose.Types.ObjectId(AuthorizationKey.slice(0, -32)), 
         'LoginToken': AuthorizationKey.slice(-32),
         LastActiveTime: { $gte: date } }, {}, {}, function(err, response) {
            if (!err && response !== null) {
               AdminModel.User_Management.update({ _id: response._id }, { $set: { LastActiveTime: new Date() }}).exec();
               return callback(true);
            }else {
               return callback(false);
            }
         });
   }
 // Every request Log Creation
   app.use('/API/', function (req, res, next) {
      if (req.headers.authorization) {
         AuthorizationValidate(req.headers.authorization, function(callback){
            if (callback) {
               return next();
            }else{
               ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Security Error For Request authorization Empty', 'Server.js');
               return res.status(401).send({Status: false, Message: 'Invalid Authorization'});
            }
          });
      }else {
         ErrorManagement.ErrorHandling.ErrorLogCreation(req, 'Security Error For Request authorization Empty', 'Server.js');
         return res.status(401).send({Status: false, Message: 'Invalid Authorization'});
      }
   });

// Admin
   require('./server/web/routes/Admin/AdminManagement.routes.js')(app);
// Configuration
   require('./server/web/routes/Configuration/Configuration.routes.js')(app);
// Product
   require('./server/web/routes/Product/Product.routes.js')(app);
// Leads
   require('./server/web/routes/Lead/Lead.routes.js')(app);
// Crm
   require('./server/web/routes/CRM/Crm.routes.js')(app);
// Hr
   require('./server/web/routes/HR/Hr.routes.js')(app);
// Hrms
   require('./server/web/routes/HRMS/Hrms.routes.js')(app);
// Purchase
   require('./server/web/routes/Purchase/Purchase.routes.js')(app);
// Inventory
   require('./server/web/routes/Inventory/Inventory.routes.js')(app);
// Accounts
   require('./server/web/routes/Accounts/Accounts.routes.js')(app);
// Notification
   require('./server/web/routes/Notification/Notify.routes.js')(app);
// Settings
   // CRM Settings
      require('./server/web/routes/settings/CRM_Settings.routes.js')(app);
   // Leads Settings
      require('./server/web/routes/settings/Leads_Settings.routes.js')(app);
   // HRMS Settings
      require('./server/web/routes/settings/Hrms_Settings.routes.js')(app);
   // HR Settings
      require('./server/web/routes/settings/Hr_Settings.routes.js')(app);
   // Account Settings
      require('./server/web/routes/settings/Account_Settings.routes.js')(app);
    // Company Settings
    require('./server/web/routes/settings/Company_Settings.routes.js')(app);
    // Inventory Settings
    require('./server/web/routes/settings/Inventory_Settings.routes.js')(app);
    // Product Settings
    require('./server/web/routes/settings/Product_Settings.routes.js')(app);


app.use(express.static(__dirname + '/view/dist/view/'));

app.use(function(req, res) {
   res.sendFile(path.join(__dirname, '/view/dist/view', 'index.html'));
});

app.get('*', function(req, res){
    res.send('This is Server Side Page');
});


app.listen(port, function(){
  console.log('Listening on port ' + port);
});