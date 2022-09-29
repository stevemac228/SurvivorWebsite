const express = require("express");
const mongo = require('./utils/db');
const port = process.env.PORT || 3000;
const app = express()
const bodyParser= require('body-parser')
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())

var db;
var teams;
async function loadDBClient() {
	try {
		db = await mongo.connectToDB();
		teams = db.collection("teams");
	}catch(err){
		throw new Error('Could not connect to the Mongo DB');
	}
};
loadDBClient();


app.use(express.static(__dirname + '/public'));
app.use((req, res, next) => {
	req.db = db;	
	next();
});

server = app.listen(port, () => {
	console.log('listening at localhost:%d',port);
});  

process.on('SIGINT', () => {
	console.info('SIGINT signal received.');
	console.log('Closing Mongo Client.');
	mongo.closeDBConnection();
	server.close(() => {
	  console.log('Http server closed.');
	});
 });


//Routes

app.post('/newTeam', (req, res) => {
	//console.log(req.body)
	let newTeam = {
		"Name":req.body[4],
		"P1":{"Name":req.body[0],"Place":1, Out: false},
		"P2":{"Name":req.body[1],"Place":1, Out: false},
		"P3":{"Name":req.body[2],"Place":1, Out: false},
		"P4":{"Name":req.body[3],"Place":1, Out: false},
		"Score":4
	}
	
	teams.insertOne(newTeam)

    .then(result => {
		return res.redirect('/')
    })
	
})

app.post('/elim', (req, res) => {
	const eliminatePlayer = async () =>{
		//Set players Out to True
		teams.updateMany(
			{ "P1.Name": req.body.elimPlayer},
			{ $set:{"P1.Out": true} }
		)
		teams.updateMany(
			{ "P2.Name": req.body.elimPlayer},
			{ $set:{"P2.Out": true} }
		)
		teams.updateMany(
			{ "P3.Name": req.body.elimPlayer},
			{ $set:{"P3.Out": true} }
		)
		teams.updateMany(
			{ "P4.Name": req.body.elimPlayer},
			{ $set:{"P4.Out": true} }
		)
	}
	
	const increaseScore = () =>{
		//Increment anyones place whos still in
		teams.updateMany(
			{ "P1.Out": false},
			{ $inc: { "P1.Place": 1 , Score: 1} }
		)
		teams.updateMany(
			{ "P2.Out": false},
			{ $inc: { "P2.Place": 1 , Score: 1} }
		)
		teams.updateMany(
			{ "P3.Out": false},
			{ $inc: { "P3.Place": 1 , Score: 1} }
		)
		teams.updateMany(
			{ "P4.Out": false},
			{ $inc: { "P4.Place": 1 , Score: 1} }
		)
	}
	
	const runfunctions = async() => {
		await eliminatePlayer();
		increaseScore();       
	};

	runfunctions();

})

app.get('/newTeam', (req, res) => {
    res.render('newTeam.ejs')
})

app.get('/tempPage', (req, res) => {
    res.render('tempPage.ejs')
})


app.get('/', (req, res) => {
 	teams.find().sort({Score: -1}).toArray()
     .then(results => {
 		res.render('leaderboard.ejs', { leaderboard: results})
     })
 	//res.render('newTeam.ejs')
 })

app.get('/admin', (req, res) => {
	teams.find().toArray()
    .then(results => {
      res.render('admin.ejs', { leaderboard: results})
    })
})



