var Contestants = ['Cassidy','Cody','Dwight','Elie','Geo','Jay','Jeanine','Jesse','Justine','Karla','Lindsay','Mike','Nneka','Noelle','Owen','Ryan','Sami']
var Selected = []
    function selectContestant() {
        if(arguments[0].id.includes('-Selected')){
            arguments[0].style.border='';
            arguments[0].id = arguments[0].id.slice(0, -9); 
            const index = Selected.indexOf(arguments[0].id);
            if (index > -1) {
                Selected.splice(index, 1);
            }
        }else if(Selected.length < 4){
            arguments[0].style.border= 'thick green solid';
            Selected.push(arguments[0].id)
            arguments[0].id=arguments[0].id+'-Selected'
        }
    }

    for(var i = 0; i < Contestants.length; i++) {
        document.getElementById(Contestants[i]).onclick = function() {
            selectContestant(this)
        }
    }

    document.getElementById("submitTeam").onclick = function() {
        Selected.push(document.getElementById("nameInput").value)
        $.ajax({
            url: '/newTeam',
            type: 'POST',
            data: JSON.stringify(Selected),
            contentType: "application/json",
            processData: false,
            success: function(data){
                location.href = "/"
            }
        });
    }

    