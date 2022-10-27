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
		teams = db.collection("Main");
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


const season = 43
var episodeNum = 1
var episode = "Episode" + String(episodeNum)
var playerNumber = ['P1','P2','P3','P4']
var seasonFilter = {};
seasonFilter['Season']=season;


app.post('/elim', (req, res) => {
	const eliminatePlayer = async () =>{
		//Set players Out to True

		//TAKE NUMBER OFF END OF EPISODE AND USE THAT AS EPISODE NUNM SO IT DONT RESET
		//MAKE NEW / ADD ON EPISODE+1
		// RUN THER POINTS AND OUT AND STUFF ON THAT NEW EPISODE



		  teams.find(seasonFilter).toArray(function(err, result) {//in this season
			episodeNum ++;
			console.log(result[0]['Episode1'])
			console.log(episodeNum)
			for (x in result[0]['Episode1']){//in the first episode
				for(var i = 0; i < playerNumber.length; i++) {//get all players
					// let filter = {};//filter = 'Season':season , EpisodeX.playername.contestantnumber.Name
					// filter['Season']=season; 
					// filter[episode + "." + x + '.' + playerNumber[i] + ".Name"] = req.body.elimPlayer;//if filter is eliminated player
					// let set = {}
					// set['$set'] = {[episode + "." + x + '.' + playerNumber[i] + ".Out"] : true}
					// teams.updateMany(filter,set)//set that they are out
					// let incrementFilter = {}
					// incrementFilter['Season']=season; 
					// incrementFilter[episode + "." + x + '.' + playerNumber[i] + ".Out"] ='false'
					// let inc = {}
					// inc['$inc'] = {[episode + "." + x + '.' + playerNumber[i] + ".Place"] : 1,[episode + "." + x + '.Score'] : 1}
					// teams.updateMany(incrementFilter,inc)
				}
			}	
		  });
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

function orderBySubKey( input, key ) {
	return Object.keys( input ).map( key => ({ key, value: input[key] }) ).sort( (a, b) => b.value[key] - a.value[key] );
  }

app.get('/', (req, res) => {
 	teams.find({Season: 43}).project({"Episode1" : 1, _id : 0}).sort({'Episode1.Score': -1}).toArray()
     .then(results => {
		for (x in results[0]){
			
			res.render('leaderboard.ejs', { leaderboard:orderBySubKey(results[0][x],'Score')})
		}
     })
 	//res.render('newTeam.ejs')
 })

app.get('/admin', (req, res) => {
	teams.find().toArray()
    .then(results => {
      res.render('admin.ejs', { leaderboard: results})
    })
})