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

app.use(express.static('/Users/steven.macdonald/Documents/Projects/Practice Projects/Survivor Website/public'));
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
//app.get('/', (req, res) => {
//	res.render('/Users/steven.macdonald/Documents/Projects/Practice Projects/Survivor Website/views/leaderboard.ejs')
//})

app.post('/newTeam', (req, res) => {
	let newTeam = {
		"Name":req.body.name,
		"P1":{"Name":req.body.teamSelect[0],"Place":0, Out: false},
		"P2":{"Name":req.body.teamSelect[1],"Place":0, Out: false},
		"P3":{"Name":req.body.teamSelect[2],"Place":0, Out: false},
		"P4":{"Name":req.body.teamSelect[3],"Place":0, Out: false},
		"Score":0
	}
	console.log(newTeam)
	
	teams.insertOne(newTeam)
    .then(result => {
		res.redirect('/')
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

app.get('/', (req, res) => {
	teams.find().sort({Score: -1}).toArray()
    .then(results => {
		res.render('leaderboard.ejs', { leaderboard: results})
    })
})

app.get('/admin', (req, res) => {
	teams.find().toArray()
    .then(results => {
      res.render('admin.ejs', { leaderboard: results})
    })
})



