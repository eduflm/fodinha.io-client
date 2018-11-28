var socket = io("http://localhost:3000")

jQuery("#room").css("visibility", "hidden");
jQuery("#start-match").css("visibility", "hidden");
jQuery('#btn-player-ready').val("false")

var admin = false


socket.on('connect', function () {
  console.log("connected to server")
})

socket.on('listRooms', function(rooms) {
  var roomList = jQuery("#list-rooms");
  roomList.empty()
  rooms.rooms.forEach(room => {
    if (!room.inGame){
      roomList.append(`<h4>${room.name}</h4>`)
      roomList.append(`<button id='join_room' onclick="joinRoom('${room.name}')" name=${room.name}> Join room </button>`)
    }
  });
})

socket.on('updatePlayerList', function(players) {
  var ol = jQuery('<ol></ol>');

  players.forEach(function (player) {
    var isReady = 'X'
    if (player.ready){
      isReady = 'V'
    }
    ol.append(jQuery('<li></li>').text(player.name + " " + isReady))
  })

  jQuery('#player_list').html(ol)
})


socket.on('givePlayersCards', function(players) {
  var cards = []
  players.forEach(function (player) {
    if (player.id === socket.id){
      cards = player.cards
      renderCards(cards)
    }
  })
})

socket.on('startMatchWithCards', function(currentPlayer) {
  if (socket.id === currentPlayer.id){
    alert("It's your turn to play")
  } else {
    alert("It's " + currentPlayer.name + " turn")
  }
})


jQuery('#new-room').on('submit', function(e) {
  e.preventDefault();

  var playerName = jQuery('#player-name').val()

  if (playerName === ""){
    alert("Player name can't be empty")
    return
  }

  var newRoomName = jQuery('[name=new-room-name]');

  //Make validation for names

  socket.emit('newRoom', {
    name : newRoomName.val(),
    playerName
  }, function (success, room) {
    if (!success){
      alert("A room with this name already exists")
      return
    }
    admin = true
    jQuery("#lobby").css("visibility", "hidden");
    renderRoom()
    console.log(room)
  });
});

jQuery('#btn-player-ready').on('click', function(e) {
  e.preventDefault();

  var ready = jQuery('#btn-player-ready').val()
  
  ready = ready === "true" ? true : false
  
  socket.emit('playerReady', !ready)
  
  jQuery('#btn-player-ready').val(String(!ready))  
  
  if (!ready){
    jQuery('#btn-player-ready').html("I'm not ready")
  } else {
    jQuery('#btn-player-ready').html("Ready to play")
  }

});


jQuery('#btn-start-match').on('click', function(e) {
  e.preventDefault()

  socket.emit('startMatch')
})


function joinRoom(name){
  var playerName = jQuery('#player-name').val()
  
  if (playerName === ""){
    alert("Player name can't be empty")
    return
  }

  socket.emit('joinRoom', {name,playerName}, function (room) {
    jQuery("#lobby").css("visibility", "hidden");
    renderRoom()
    console.log(room)
  })
}


function renderRoom(){
  jQuery("#room").css("visibility", "visible");
  if (admin){
    jQuery("#start-match").css("visibility", "visible");
  }
}

function renderCards(cards){
  var myCards = jQuery('#my-cards')
  var list = jQuery('<div></div>');

  cards.forEach((card) => {
    list.append(jQuery('<li></li>').text(card.value + " " + card.pack))
  })

  myCards.html(list)


}